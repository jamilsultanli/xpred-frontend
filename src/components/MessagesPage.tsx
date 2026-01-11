import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesApi, Conversation, Message } from '../lib/api/messages';
import { usersApi } from '../lib/api/users';
import { Send, Smile, ArrowLeft, Loader2, Search, MoreVertical, Check, CheckCheck, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      console.log('🔍 Opening conversation with user:', userId);
      
      const existingConv = conversations.find(conv => conv.participant.id === userId);

      if (existingConv) {
        console.log('✅ Found existing conversation');
        setSelectedConversation(existingConv);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        console.log('📡 Fetching user profile...');
        const userResponse = await usersApi.getById(userId);
        console.log('📦 User response:', userResponse);
        
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
          
          console.log('✅ Created temp conversation:', tempConversation);
          setSelectedConversation(tempConversation);
          setMessages([]);
          setTimeout(() => inputRef.current?.focus(), 100);
        } else {
          console.error('❌ Failed to get user:', userResponse);
          toast.error('User not found');
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to open conversation:', error);
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
    <div className={`h-screen flex ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Conversations Sidebar - Compact */}
      <div 
        className={`w-full md:w-[360px] flex flex-col ${
          isDark ? 'bg-black border-[#1a1a1a]' : 'bg-white border-gray-200'
        } border-r ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Sidebar Header */}
        <div className={`px-5 py-5 ${isDark ? 'border-[#1a1a1a]' : 'border-gray-100'} border-b`}>
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Messages
          </h1>
          <div className="relative group">
            <Search className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'} transition-colors`} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium ${
                isDark 
                  ? 'bg-[#111111] border-[#1a1a1a] text-white placeholder-gray-600' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all`}
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <div className="w-20 h-20 mb-4 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center">
                <Send className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <p className={`text-center font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
              <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                Start chatting from a user's profile
              </p>
            </div>
          ) : (
            <div className="py-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 transition-all ${
                    selectedConversation?.id === conv.id
                      ? isDark 
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500' 
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500'
                      : isDark 
                        ? 'hover:bg-[#111111]' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"
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
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-black">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {conv.participant.full_name || conv.participant.username}
                      </span>
                      {conv.participant.is_verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {conv.lastMessage || 'Start chatting...'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className={`flex-1 flex flex-col ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          {/* Chat Header - Compact */}
          <div className={`px-6 py-3.5 flex items-center gap-4 ${isDark ? 'bg-black border-[#1a1a1a]' : 'bg-white border-gray-200'} border-b shadow-sm`}>
            <button 
              onClick={() => setSelectedConversation(null)} 
              className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg"
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
                <h2 className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConversation.participant.full_name || selectedConversation.participant.username}
                </h2>
                {selectedConversation.participant.is_verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                @{selectedConversation.participant.username}
              </p>
            </div>
            <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition-colors`}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area - SMALLER (30% of space) */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-4" 
            style={{
              maxHeight: '30vh',
              backgroundImage: isDark 
                ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03), transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03), transparent 50%)'
                : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05), transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05), transparent 50%)'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center">
                  <Send className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No messages yet
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === userData?.id;
                  const showAvatar = index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && (
                          <div 
                            className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
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
                            className={`px-4 py-2 rounded-2xl shadow-sm ${
                              isOwn
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                                : isDark
                                ? 'bg-[#1a1a1a] text-white rounded-bl-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
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

          {/* Input Area - HUGE (70% of space) */}
          <div className={`flex flex-col px-6 py-6 gap-4 ${isDark ? 'bg-black border-[#1a1a1a]' : 'bg-white border-gray-200'} border-t`} style={{ minHeight: '40vh' }}>
            {/* Large Writing Area */}
            <div className={`flex-1 rounded-3xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-gray-50 border-gray-200'} border-2 p-6 flex flex-col`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800/50">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md"
                  style={{
                    backgroundImage: selectedConversation.participant.avatar_url
                      ? `url(${selectedConversation.participant.avatar_url})`
                      : undefined,
                    backgroundSize: 'cover',
                  }}
                >
                  {!selectedConversation.participant.avatar_url && (selectedConversation.participant.full_name?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Message {selectedConversation.participant.full_name || selectedConversation.participant.username}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                    @{selectedConversation.participant.username}
                  </p>
                </div>
              </div>
              
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                className={`flex-1 bg-transparent resize-none outline-none text-base ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-500'}`}
                disabled={isSending}
                style={{ minHeight: '180px' }}
              />
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-800/50 mt-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-3 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-200'} transition-colors group`}
                    title="Add emoji"
                  >
                    <Smile className={`w-5 h-5 ${isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`} />
                  </button>
                  <button
                    className={`p-3 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-200'} transition-colors group`}
                    title="Attach file"
                  >
                    <Paperclip className={`w-5 h-5 ${isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`} />
                  </button>
                  <button
                    className={`p-3 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-200'} transition-colors group`}
                    title="Add image"
                  >
                    <ImageIcon className={`w-5 h-5 ${isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`} />
                  </button>
                  <button
                    className={`p-3 rounded-full ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-200'} transition-colors group`}
                    title="Voice message"
                  >
                    <Mic className={`w-5 h-5 ${isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`} />
                  </button>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-base"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-24 left-8 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setNewMessage(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center">
              <Send className={`w-16 h-16 ${isDark ? 'text-gray-700' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Select a conversation
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Choose a conversation from the list to start messaging or visit a user's profile to send them a message
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
