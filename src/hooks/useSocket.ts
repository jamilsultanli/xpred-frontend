import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

// Hook for message events
export function useMessageSocket(conversationId: string | null, callbacks: {
  onNewMessage?: (message: any) => void;
  onMessageDeleted?: (data: { messageId: string }) => void;
  onReactionAdded?: (data: { messageId: string; userId: string; emoji: string }) => void;
  onReactionRemoved?: (data: { messageId: string; userId: string; emoji: string }) => void;
  onUserTyping?: (data: { userId: string; username: string }) => void;
  onUserStoppedTyping?: (data: { userId: string }) => void;
  onMessagesRead?: (data: { messageIds: string[] }) => void;
}) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    // Join conversation room
    socket.emit('join_conversation', conversationId);

    // Listen for events
    if (callbacks.onNewMessage) {
      socket.on('new_message', callbacks.onNewMessage);
      socket.on('message_sent', (data: any) => callbacks.onNewMessage?.(data.message));
    }
    
    if (callbacks.onMessageDeleted) {
      socket.on('message_deleted', callbacks.onMessageDeleted);
    }
    
    if (callbacks.onReactionAdded) {
      socket.on('reaction_added', callbacks.onReactionAdded);
    }
    
    if (callbacks.onReactionRemoved) {
      socket.on('reaction_removed', callbacks.onReactionRemoved);
    }
    
    if (callbacks.onUserTyping) {
      socket.on('user_typing', callbacks.onUserTyping);
    }
    
    if (callbacks.onUserStoppedTyping) {
      socket.on('user_stopped_typing', callbacks.onUserStoppedTyping);
    }
    
    if (callbacks.onMessagesRead) {
      socket.on('messages_read', callbacks.onMessagesRead);
    }

    return () => {
      // Leave conversation room
      socket.emit('leave_conversation', conversationId);
      
      // Remove listeners
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('message_deleted');
      socket.off('reaction_added');
      socket.off('reaction_removed');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('messages_read');
    };
  }, [socket, conversationId, isConnected]);

  const sendTypingStatus = (isTyping: boolean, username: string) => {
    if (!socket || !conversationId) return;
    
    if (isTyping) {
      socket.emit('typing_start', { conversationId, username });
    } else {
      socket.emit('typing_stop', { conversationId });
    }
  };

  const markMessagesAsRead = (messageIds: string[], senderId: string) => {
    if (!socket || !conversationId) return;
    socket.emit('message_read', { conversationId, messageIds, senderId });
  };

  return {
    sendTypingStatus,
    markMessagesAsRead,
    isConnected,
  };
}

// Hook for online status
export function useOnlineStatus() {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('user_online', (data: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    socket.on('user_offline', (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    return () => {
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket, isConnected]);

  return {
    isOnline: (userId: string) => onlineUsers.has(userId),
    onlineUsers: Array.from(onlineUsers),
  };
}

