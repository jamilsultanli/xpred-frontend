import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api/auth';
import { requestCache, CacheTime, cacheKeys } from '../lib/cache';
import { apiClient } from '../lib/api/client';

interface UserData {
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  following?: string[];
  created_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  showLoginModal: boolean;
  showOnboarding: boolean;
  userData: UserData | null;
  setShowLoginModal: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  login: (data?: UserData) => void;
  logout: () => void;
  updateUserData: (data: Partial<UserData>) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if token exists in localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('auth_token');
          if (stored) {
            // Check cache first (5 minute cache for user data)
            const cachedUser = requestCache.get<any>(cacheKeys.user());
            const cachedTimestamp = localStorage.getItem('user_data_timestamp');
            const now = Date.now();
            
            // Use cached data if less than 5 minutes old
            if (cachedUser && cachedTimestamp && now - parseInt(cachedTimestamp) < CacheTime.LONG) {
              console.log('⚡ Using cached user data (AuthContext)');
              setIsAuthenticated(true);
              setUserData({
                email: cachedUser.email || '',
                name: cachedUser.full_name || cachedUser.username || '',
                username: cachedUser.username,
                avatar: cachedUser.avatar_url,
                bio: cachedUser.bio,
              });
              setIsInitializing(false);
              return;
            }
            
            // Try to fetch current user to verify token is valid
            try {
              console.log('📡 Fetching current user...');
              const userResponse = await authApi.getCurrentUser();
              if (userResponse.success && userResponse.user) {
                const userData = {
                  email: userResponse.user.email || '',
                  name: userResponse.user.full_name || userResponse.user.username || '',
                  username: userResponse.user.username,
                  avatar: userResponse.user.avatar_url,
                  bio: userResponse.user.bio,
                };
                
                setUserData(userData);
                
                // Cache user data for 5 minutes
                requestCache.set(cacheKeys.user(), userResponse.user, CacheTime.LONG);
                localStorage.setItem('user_data_timestamp', now.toString());
                console.log('✅ User data fetched and cached');
                
                // Show onboarding for new users who haven't completed it
                // Check if user was created recently (within last 5 minutes) or has no custom username
                const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
                const userCreatedAt = userResponse.user.created_at ? new Date(userResponse.user.created_at) : null;
                const isNewUser = userCreatedAt && (Date.now() - userCreatedAt.getTime()) < 5 * 60 * 1000; // 5 minutes
                const hasDefaultUsername = userResponse.user.username && userResponse.user.email && 
                  userResponse.user.username.toLowerCase() === userResponse.user.email.split('@')[0].toLowerCase();
                
                if (!hasCompletedOnboarding && (isNewUser || hasDefaultUsername || !userResponse.user.username)) {
                  setShowOnboarding(true);
                } else {
                  setIsAuthenticated(true);
                }
              }
            } catch (error: any) {
              // Token is invalid or expired, clear it silently
              console.log('[AUTH] Token validation failed, clearing stored token:', error.message);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data_timestamp');
              requestCache.clear(cacheKeys.user());
              apiClient.setToken(null);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (data?: UserData) => {
    if (data) {
      setUserData(data);
      // Show onboarding for new users who haven't completed it
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      const hasDefaultUsername = data.username && data.email && 
        data.username.toLowerCase() === data.email.split('@')[0].toLowerCase();
      
      // Check if user was created recently (within last 5 minutes)
      const userCreatedAt = data.created_at ? new Date(data.created_at) : null;
      const isNewUser = userCreatedAt && (Date.now() - userCreatedAt.getTime()) < 5 * 60 * 1000; // 5 minutes
      
      if (!hasCompletedOnboarding && (isNewUser || hasDefaultUsername || !data.username)) {
        setShowOnboarding(true);
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(true);
    }
    setShowLoginModal(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    // Clear auth token and cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data_timestamp');
    }
    // Clear all caches
    requestCache.clear();
    // Import and call authApi logout
    import('../lib/api/auth').then(({ authApi }) => {
      authApi.logout();
    });
  };

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => prev ? { ...prev, ...data } : null);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setIsAuthenticated(true);
    // Mark onboarding as completed
    localStorage.setItem('onboarding_completed', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      showLoginModal, 
      showOnboarding,
      userData,
      setShowLoginModal, 
      setShowOnboarding,
      login, 
      logout,
      updateUserData,
      completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
