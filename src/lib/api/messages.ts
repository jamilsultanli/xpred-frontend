import { apiClient } from './client';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  reactions?: Array<{
    id: string;
    emoji: string;
    user_id: string;
  }>;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
}

export const messagesApi = {
  // Get all conversations
  getConversations: async (): Promise<{
    success: boolean;
    conversations: Conversation[];
  }> => {
    // Messaging needs fresh data (polling). Disable cache.
    return apiClient.get('/messages', { enabled: false });
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string, page = 1): Promise<{
    success: boolean;
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      hasMore: boolean;
    };
  }> => {
    // Messaging needs fresh data (polling). Disable cache.
    return apiClient.get(`/messages/${conversationId}?page=${page}`, { enabled: false });
  },

  // Send a message
  sendMessage: async (receiverId: string, content: string): Promise<{
    success: boolean;
    message: Message;
  }> => {
    return apiClient.post('/messages', { receiverId, content });
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient.delete(`/messages/${messageId}`);
  },

  // React to a message
  reactToMessage: async (messageId: string, emoji: string): Promise<{
    success: boolean;
    action: 'added' | 'removed';
    emoji: string;
  }> => {
    return apiClient.post(`/messages/${messageId}/react`, { emoji });
  },

  // Update typing status
  updateTypingStatus: async (conversationId: string, isTyping: boolean): Promise<{
    success: boolean;
  }> => {
    return apiClient.post(`/messages/${conversationId}/typing`, { isTyping });
  },

  // Get typing status (polling)
  getTypingStatus: async (conversationId: string): Promise<{
    success: boolean;
    isTyping: boolean;
    users: Array<{
      id: string;
      username: string;
      full_name?: string;
      avatar_url?: string;
    }>;
  }> => {
    return apiClient.get(`/messages/${conversationId}/typing`, { enabled: false });
  },

  // Get unread count
  getUnreadCount: async (): Promise<{
    success: boolean;
    unreadCount: number;
  }> => {
    return apiClient.get('/messages/unread-count', { enabled: false });
  },
};
