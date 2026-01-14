import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesApi, Conversation, Message } from '../lib/api/messages';
import { usersApi } from '../lib/api/users';
import { supabase } from '../lib/supabase';
import { Send, Phone, Video, Info, ArrowLeft, Smile, Paperclip, Mic, CheckCheck, Check } from 'lucide-react';
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
  const channelRef = useRef<any>(null);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!selectedConversation?.id || !userData?.id) return;

    console.log('🔴 Subscribing to conversation:', selectedConversation.id);

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`conversation:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          console.log('✅ New message received via Supabase Realtime:', payload);
          const newMsg = payload.new as any;
          
          // Add sender info
          if (newMsg.sender_id === userData.id) {
            newMsg.sender = {
              id: userData.id,
              username: userData.username,
              full_name: userData.name,
              avatar_url: userData.avatar,
            };
          } else {
            newMsg.sender = {
              id: selectedConversation.participant.id,
              username: selectedConversation.participant.username,
              full_name: selectedConversation.participant.full_name,
              avatar_url: selectedConversation.participant.avatar_url,
            };
          }

          setMessages((prev) => {
            // Check if message already exists
            if (prev.some(m => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('🔴 Unsubscribing from conversation');
      channel.unsubscribe();
    };
  }, [selectedConversation?.id, userData?.id]);

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
        // Message will be added via Realtime subscription
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

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-2xl">
            <Send className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Log in to send and receive messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Left Sidebar - Instagram/WhatsApp Style */}
      <div 
        className={`w-full md:w-[380px] flex flex-col ${
          isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        } border-r ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className={`px-6 py-4 ${isDark ? 'border-gray-800' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {userData?.username || 'Messages'}
            </h1>
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                <Send className="w-12 h-12 text-white" />
              </div>
              <p className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No messages yet
              </p>
              <p className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Start a conversation from someone's profile
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
                  className={`w-full px-6 py-4 flex items-center gap-4 transition-all ${
                    selectedConversation?.id === conv.id
                      ? isDark 
                        ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20' 
                        : 'bg-gradient-to-r from-purple-50 to-pink-50'
                      : isDark 
                        ? 'hover:bg-gray-900/30' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center text-white text-lg font-bold shadow-lg"
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
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {conv.participant.full_name || conv.participant.username}
                      </span>
                      {conv.participant.is_verified && (
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      <span className={`ml-auto text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold' : ''} ${isDark ? conv.unreadCount > 0 ? 'text-white' : 'text-gray-400' : conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                      {conv.lastMessage || 'Send a message'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area - WhatsApp/Instagram Style */}
      {selectedConversation ? (
        <div className={`flex-1 flex flex-col ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          {/* Chat Header - WhatsApp Style */}
          <div className={`px-6 py-3 flex items-center gap-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b shadow-sm`}>
            <button 
              onClick={() => setSelectedConversation(null)} 
              className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
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
              <div className="flex items-center gap-2">
                <h2 className={`font-semibold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConversation.participant.full_name || selectedConversation.participant.username}
                </h2>
                {selectedConversation.participant.is_verified && (
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                @{selectedConversation.participant.username}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <Phone className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <Video className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area - WhatsApp Style with patterns */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-6"
            style={{
              backgroundImage: isDark 
                ? 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.05), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.05), transparent 50%)'
                : 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.03), transparent 50%)'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`w-20 h-20 mb-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
                  <Send className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Start the conversation
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send a message to {selectedConversation.participant.full_name}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === userData?.id;
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                  const showName = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                  
                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
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
                        {showName && !isOwn && (
                          <span className={`text-xs font-medium mb-1 px-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedConversation.participant.full_name || selectedConversation.participant.username}
                          </span>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                            isOwn
                              ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white'
                              : isDark
                              ? 'bg-gray-800 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 px-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span>{formatTime(message.created_at)}</span>
                          {isOwn && (
                            message.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - WhatsApp/Instagram Style */}
          <div className={`px-6 py-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
            <div className={`flex items-center gap-3 rounded-full px-5 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <Smile className="w-6 h-6 text-gray-500" />
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
                className={`flex-1 bg-transparent outline-none text-base ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                disabled={isSending}
              />
              {newMessage.trim() ? (
                <button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="p-2 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {isSending ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </button>
              ) : (
                <>
                  <button className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                    <Paperclip className="w-6 h-6 text-gray-500" />
                  </button>
                  <button className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                    <Mic className="w-6 h-6 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center max-w-lg px-8">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-2xl">
              <Send className="w-16 h-16 text-white" />
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Messages
            </h3>
            <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Send private messages to your friends and connections. Select a conversation to start chatting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
