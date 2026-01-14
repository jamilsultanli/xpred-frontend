import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesApi, Conversation, Message } from '../lib/api/messages';
import { usersApi } from '../lib/api/users';
import { Send, ArrowLeft, Loader2, Search, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import io, { Socket } from 'socket.io-client';

export function MessagesPage() {
  const { theme } = useTheme();
  const { isAuthenticated, userData, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDark = theme === 'dark';
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        console.log('📨 New message received:', message);
        setMessages((prev) => [...prev, message]);
        loadConversations(); // Refresh conversations list
        scrollToBottom();
      });

      // Listen for typing status
      socket.on('user_typing', (data: { userId: string; username: string; conversationId: string }) => {
        if (selectedConversation?.id === data.conversationId) {
          setTypingUser(data.username);
          setIsTyping(true);
        }
      });

      socket.on('user_stopped_typing', (data: { userId: string; conversationId: string }) => {
        if (selectedConversation?.id === data.conversationId) {
          setIsTyping(false);
          setTypingUser(null);
        }
      });

      // Listen for message read receipts
      socket.on('messages_read', (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          )
        );
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  // Join conversation room when selected
  useEffect(() => {
    if (socketRef.current && selectedConversation?.id) {
      socketRef.current.emit('join_conversation', selectedConversation.id);
      
      return () => {
        if (socketRef.current && selectedConversation?.id) {
          socketRef.current.emit('leave_conversation', selectedConversation.id);
        }
      };
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages();
    } else if (selectedConversation && !selectedConversation.id) {
      setMessages([]);
    }
  }, [selectedConversation]);

  // Handle user query parameter
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && isAuthenticated && !isLoading) {
      handleOpenConversationWithUser(userId);
      setSearchParams({});
    }
  }, [searchParams, isAuthenticated, isLoading]);

  const handleOpenConversationWithUser = async (userId: string) => {
    try {
      const existingConv = conversations.find(conv => conv.participant.id === userId);

      if (existingConv) {
        setSelectedConversation(existingConv);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        const userResponse = await usersApi.getById(userId);
        
        if (userResponse.success && userResponse.user) {
          const tempConversation: Conversation = {
            id: '',
            participant: {
              id: userResponse.user.id,
              username: userResponse.user.username,
              full_name: userResponse.user.full_name,
              avatar_url: userResponse.user.avatar_url,
              is_verified: userResponse.user.is_verified,
            },
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            createdAt: new Date().toISOString(),
          };
          
          setSelectedConversation(tempConversation);
          setMessages([]);
          setTimeout(() => inputRef.current?.focus(), 100);
        } else {
          toast.error('User not found');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open conversation');
    }
  };

  const loadConversations = async () => {
    try {
      const response = await messagesApi.getConversations();
      if (response.success) {
        setConversations(response.conversations);
      }
    } catch (error: any) {
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation?.id) return;
    
    try {
      const response = await messagesApi.getMessages(selectedConversation.id);
      if (response.success) {
        setMessages(response.messages);
        scrollToBottom();
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleTyping = () => {
    if (socketRef.current && selectedConversation?.id && userData) {
      socketRef.current.emit('typing_start', {
        conversationId: selectedConversation.id,
        username: userData.username,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && selectedConversation?.id) {
          socketRef.current.emit('typing_stop', {
            conversationId: selectedConversation.id,
          });
        }
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      const response = await messagesApi.sendMessage(
        selectedConversation.participant.id,
        messageContent
      );
      
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        scrollToBottom();
        
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: selectedConversation.id || response.message.conversation_id,
            receiverId: selectedConversation.participant.id,
            message: response.message,
          });

          // Stop typing
          socketRef.current.emit('typing_stop', {
            conversationId: selectedConversation.id || response.message.conversation_id,
          });
        }
        
        if (!selectedConversation.id) {
          await loadConversations();
          const newConv = await messagesApi.getConversations();
          const updatedConv = newConv.conversations.find(c => 
            c.participant.id === selectedConversation.participant.id
          );
          if (updatedConv) {
            setSelectedConversation(updatedConv);
          }
        } else {
          loadConversations();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <Send className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to Messages
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please log in to access your conversations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      {/* Conversations List - LinkedIn Style */}
      <div 
        className={`w-full md:w-[320px] flex flex-col ${
          isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        } border-r ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className={`px-4 py-4 ${isDark ? 'border-gray-800' : 'border-gray-200'} border-b`}>
          <h1 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Messaging
          </h1>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md text-sm ${
                isDark 
                  ? 'bg-[#1a1a1a] border-gray-800 text-white placeholder-gray-500' 
                  : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
            </div>
          ) : (
            <div>
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-colors border-b ${
                    isDark ? 'border-gray-800' : 'border-gray-100'
                  } ${
                    selectedConversation?.id === conv.id
                      ? isDark 
                        ? 'bg-[#1a1a1a]' 
                        : 'bg-blue-50'
                      : isDark 
                        ? 'hover:bg-[#1a1a1a]' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0 mt-1">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium"
                      style={{
                        backgroundImage: conv.participant.avatar_url
                          ? `url(${conv.participant.avatar_url})`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!conv.participant.avatar_url && (conv.participant.full_name?.[0] || conv.participant.username?.[0] || '?').toUpperCase()}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {conv.participant.full_name || conv.participant.username}
                        </span>
                        {conv.participant.is_verified && (
                          <Check className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-medium' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conv.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - LinkedIn Style */}
      {selectedConversation ? (
        <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
          {/* Chat Header */}
          <div className={`px-4 py-3 flex items-center gap-3 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b`}>
            <button 
              onClick={() => setSelectedConversation(null)} 
              className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0"
              style={{
                backgroundImage: selectedConversation.participant.avatar_url
                  ? `url(${selectedConversation.participant.avatar_url})`
                  : undefined,
                backgroundSize: 'cover',
              }}
            >
              {!selectedConversation.participant.avatar_url && (selectedConversation.participant.full_name?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h2 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConversation.participant.full_name || selectedConversation.participant.username}
                </h2>
                {selectedConversation.participant.is_verified && (
                  <Check className="w-3 h-3 text-blue-500" />
                )}
              </div>
              {isTyping && typingUser && (
                <p className="text-xs text-blue-500 animate-pulse">
                  {typingUser} is typing...
                </p>
              )}
            </div>
            <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === userData?.id;
                  const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && (
                          <div 
                            className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                              backgroundImage: selectedConversation.participant.avatar_url
                                ? `url(${selectedConversation.participant.avatar_url})`
                                : undefined,
                              backgroundSize: 'cover',
                            }}
                          >
                            {!selectedConversation.participant.avatar_url && selectedConversation.participant.full_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : isDark
                                ? 'bg-[#1a1a1a] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="leading-relaxed break-words whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                                {message.is_read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-400" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input - LinkedIn Style */}
          <div className={`px-4 py-3 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t`}>
            <div className={`flex items-end gap-2 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} px-3 py-2`}>
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Write a message..."
                className={`flex-1 bg-transparent resize-none outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                disabled={isSending}
                rows={1}
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className={`w-24 h-24 mx-auto mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
              <Send className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Select a conversation
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose from your existing conversations or start a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
