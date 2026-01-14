import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesApi, Conversation, Message } from '../lib/api/messages';
import { usersApi } from '../lib/api/users';
import { Send, ArrowLeft, Search, MoreHorizontal, Check, CheckCheck, Image as ImageIcon, Smile, Info } from 'lucide-react';
import { toast } from 'sonner';

export function MessagesPage() {
  const { theme } = useTheme();
  const { isAuthenticated, userData } = useAuth();
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
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Real-time polling for new messages
  useEffect(() => {
    if (selectedConversation?.id) {
      pollingIntervalRef.current = setInterval(() => {
        loadNewMessages();
      }, 2000); // Poll every 2 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedConversation?.id, messages]);

  // Load new messages
  const loadNewMessages = async () => {
    if (!selectedConversation?.id) return;
    
    try {
      const response = await messagesApi.getMessages(selectedConversation.id);
      if (response.success && response.messages.length > messages.length) {
        const newMsgs = response.messages.slice(messages.length);
        setMessages(response.messages);
        
        // Only scroll if new messages are from other user
        if (newMsgs.some(m => m.sender_id !== userData?.id)) {
          scrollToBottom();
        }
      }
    } catch (error) {
      // Silent fail for polling
    }
  };

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
        
        if (response.messages.length > 0) {
          lastMessageIdRef.current = response.messages[response.messages.length - 1].id;
        }
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);
    
    try {
      const response = await messagesApi.sendMessage(
        selectedConversation.participant.id,
        messageContent
      );
      
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        scrollToBottom();
        
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
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Log in to access your messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Left Sidebar - Twitter Style */}
      <div 
        className={`w-full md:w-[400px] flex flex-col ${
          isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        } border-r ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className={`px-4 py-3 ${isDark ? 'border-gray-800' : 'border-gray-200'} border-b`}>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Messages
          </h1>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search Direct Messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-full text-sm ${
                isDark 
                  ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500' 
                  : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <Send className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Welcome to Messages
              </p>
              <p className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {searchQuery ? 'No messages found' : 'Send private messages to anyone'}
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
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-all ${
                    selectedConversation?.id === conv.id
                      ? isDark 
                        ? 'bg-gray-900/50 border-r-2 border-blue-500' 
                        : 'bg-gray-50 border-r-2 border-blue-500'
                      : isDark 
                        ? 'hover:bg-gray-900/30' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold"
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
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold text-[15px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {conv.participant.full_name || conv.participant.username}
                        </span>
                        {conv.participant.is_verified && (
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conv.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area - Twitter Style */}
      {selectedConversation ? (
        <div className={`flex-1 flex flex-col ${isDark ? 'bg-black' : 'bg-white'}`}>
          {/* Chat Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b backdrop-blur-sm bg-opacity-80 sticky top-0 z-10`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedConversation(null)} 
                className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0"
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
                  <h2 className={`font-bold text-[15px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedConversation.participant.full_name || selectedConversation.participant.username}
                  </h2>
                  {selectedConversation.participant.is_verified && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                    </svg>
                  )}
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  @{selectedConversation.participant.username}
                </p>
              </div>
            </div>
            <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}>
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`w-16 h-16 mb-4 rounded-full ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
                  <Send className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No messages yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === userData?.id;
                  const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                  const showTime = index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id;
                  
                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
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
                      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-blue-500 text-white'
                              : isDark
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-[15px] leading-snug break-words whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        {showTime && (
                          <div className={`flex items-center gap-1 mt-1 px-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            <span>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              message.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input - Twitter Style */}
          <div className={`px-4 py-3 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t`}>
            <div className={`flex items-end gap-2 rounded-full px-4 py-2 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <input
                ref={inputRef}
                type="text"
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
                placeholder="Start a new message"
                className={`flex-1 bg-transparent outline-none text-[15px] ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-all flex-shrink-0"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
              <Send className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Select a message
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Choose from your existing conversations, start a new one, or just keep swimming.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
