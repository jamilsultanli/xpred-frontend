import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesApi, Conversation, Message } from '../lib/api/messages';
import { usersApi } from '../lib/api/users';
import { Send, Phone, Video, Info, ArrowLeft, Smile, Paperclip, Mic } from 'lucide-react';
import { toast } from 'sonner';

export function MessagesPage() {
  const { theme } = useTheme();
  const { isAuthenticated, userData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDark = theme === 'dark';
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Optimized polling - only when conversation is open
  useEffect(() => {
    if (selectedConversation?.id) {
      // Initial load
      loadMessages();
      
      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessagesQuiet();
      }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      // Refresh conversations every 10 seconds
      const convInterval = setInterval(loadConversations, 10000);
      return () => clearInterval(convInterval);
    }
  }, [isAuthenticated]);

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
      // Silent fail
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
        lastMessageCountRef.current = response.messages.length;
        scrollToBottom();
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadMessagesQuiet = async () => {
    if (!selectedConversation?.id) return;
    
    try {
      const response = await messagesApi.getMessages(selectedConversation.id);
      if (response.success) {
        // Only update if new messages
        if (response.messages.length > lastMessageCountRef.current) {
          setMessages(response.messages);
          lastMessageCountRef.current = response.messages.length;
          scrollToBottom();
        }
      }
    } catch (error: any) {
      // Silent fail for polling
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id || '',
      sender_id: userData?.id || '',
      receiver_id: selectedConversation.participant.id,
      content: messageContent,
      is_read: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      sender: {
        id: userData?.id || '',
        username: userData?.username || '',
        full_name: userData?.name || '',
        avatar_url: userData?.avatar,
      },
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    try {
      const response = await messagesApi.sendMessage(
        selectedConversation.participant.id,
        messageContent
      );
      
      if (response.success) {
        // Replace temp message with real one
        setMessages(prev => prev.map(m => m.id === tempMessage.id ? response.message : m));
        
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
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
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

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
            <Send className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">
            Messages
          </h2>
          <p className="text-lg text-gray-400">
            Log in to send and receive messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black">
      {/* Left Sidebar - Exact from screenshot */}
      <div 
        className={`w-full md:w-[410px] flex flex-col bg-black border-r border-gray-800 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">
            {userData?.username || 'Messages'}
          </h1>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <Send className="w-16 h-16 mb-4 text-gray-600" />
              <p className="text-lg font-semibold mb-2 text-white">
                No messages yet
              </p>
              <p className="text-sm text-center text-gray-500">
                Start a conversation
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-gray-900' 
                      : 'hover:bg-gray-900/50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-semibold"
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
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-white text-[15px] truncate">
                        {conv.participant.full_name || conv.participant.username}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {conv.lastMessage || 'Send a message'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area - Exact from screenshot */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-black">
          {/* Chat Header - Exact from screenshot */}
          <div className="px-6 py-3 flex items-center gap-4 bg-black border-b border-gray-800">
            <button 
              onClick={() => setSelectedConversation(null)} 
              className="md:hidden p-2 rounded-full hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
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
              <h2 className="font-semibold text-white text-base truncate">
                {selectedConversation.participant.full_name || selectedConversation.participant.username}
              </h2>
              <p className="text-xs text-gray-500">
                @{selectedConversation.participant.username}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-gray-800">
                <Phone className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-800">
                <Video className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-800">
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area - Exact from screenshot */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-black">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                  <Send className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-base font-semibold mb-2 text-white">
                  No messages yet
                </p>
                <p className="text-sm text-gray-500">
                  Say hi to {selectedConversation.participant.full_name}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === userData?.id;
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                  const showName = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                  
                  return (
                    <div key={message.id} className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
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
                      <div className={`flex flex-col max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {showName && !isOwn && (
                          <span className="text-xs font-medium mb-1 text-gray-400">
                            {selectedConversation.participant.username}
                          </span>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-white'
                        }`}>
                          <p className="text-[15px] leading-snug break-words">
                            {message.content}
                          </p>
                        </div>
                        <span className="text-[11px] text-gray-500 mt-1">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Exact from screenshot */}
          <div className="px-4 py-3 bg-black border-t border-gray-800">
            <div className="flex items-center gap-2 bg-gray-900 rounded-full px-4 py-2.5">
              <button className="p-1 hover:bg-gray-800 rounded-full">
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-white text-[15px] placeholder-gray-500"
                disabled={isSending}
              />
              <button className="p-1 hover:bg-gray-800 rounded-full">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-1 hover:bg-gray-800 rounded-full">
                <Mic className="w-5 h-5 text-gray-400" />
              </button>
              {newMessage.trim() && (
                <button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-black">
          <div className="text-center max-w-md px-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-900 flex items-center justify-center">
              <Send className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              Select a message
            </h3>
            <p className="text-sm text-gray-500">
              Choose from your existing conversations or start a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
