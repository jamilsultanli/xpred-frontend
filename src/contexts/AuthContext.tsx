import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api/auth';
import { requestCache, CacheTime, cacheKeys } from '../lib/cache';
import { apiClient } from '../lib/api/client';
import { toast } from 'sonner';

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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:41',message:'useEffect entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let isMounted = true;
    let hasInitialized = false;
    
    const finishInitialization = () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:45',message:'finishInitialization called',data:{isMounted,hasInitialized},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (isMounted && !hasInitialized) {
        hasInitialized = true;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:48',message:'setIsInitializing(false) called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsInitializing(false);
      }
    };
    
    const initializeAuth = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:52',message:'initializeAuth entry',data:{hasWindow:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      try {
        // Check if token exists in localStorage
        if (typeof window !== 'undefined') {
          // Check for Supabase email verification redirect in URL hash
          const hash = window.location.hash;
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:57',message:'Checking URL hash',data:{hasHash:!!hash,hashIncludesToken:hash?.includes('access_token')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          if (hash && hash.includes('access_token')) {
            try {
              // Parse hash fragment: #access_token=...&expires_at=...&type=signup
              const hashParams = new URLSearchParams(hash.substring(1)); // Remove #
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              const expiresAt = hashParams.get('expires_at');
              const type = hashParams.get('type'); // 'signup' for new users
              
              if (accessToken) {
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:67',message:'Email verification path - storing token',data:{hasAccessToken:!!accessToken,type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                // Store token
                const tokenData = {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_at: expiresAt,
                };
                localStorage.setItem('auth_token', JSON.stringify(tokenData));
                apiClient.setToken(accessToken);
                
                // Clear hash from URL
                window.history.replaceState(null, '', window.location.pathname);
                
                // Show success notification
                toast.success('Email verified successfully! Welcome to Xpred.');
                
                // Fetch user data
                try {
                  // #region agent log
                  fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:85',message:'Fetching user after email verification',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                  // #endregion
                  const userResponse = await authApi.getCurrentUser();
                  // #region agent log
                  fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:86',message:'User response received',data:{success:userResponse.success,hasUser:!!userResponse.user,username:userResponse.user?.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                  // #endregion
                  if (userResponse.success && userResponse.user) {
                    const userData = {
                      email: userResponse.user.email || '',
                      name: userResponse.user.full_name || userResponse.user.username || '',
                      username: userResponse.user.username,
                      avatar: userResponse.user.avatar_url,
                      bio: userResponse.user.bio,
                      created_at: userResponse.user.created_at,
                    };
                    
                    if (isMounted) {
                      // #region agent log
                      fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:96',message:'Before state updates',data:{isMounted,hasInitialized},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                      // #endregion
                      setUserData(userData);
                      
                      // Cache user data
                      requestCache.set(cacheKeys.user(), userResponse.user, CacheTime.LONG);
                      localStorage.setItem('user_data_timestamp', Date.now().toString());
                      
                      // Show onboarding for new users (type=signup) or users without username
                      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
                      const isNewSignup = type === 'signup';
                      const hasDefaultUsername = userResponse.user.username && userResponse.user.email && 
                        userResponse.user.username.toLowerCase() === userResponse.user.email.split('@')[0].toLowerCase();
                      
                      // #region agent log
                      fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:109',message:'Onboarding decision',data:{isNewSignup,hasCompletedOnboarding,hasDefaultUsername,hasUsername:!!userResponse.user.username,willShowOnboarding:isNewSignup||(!hasCompletedOnboarding&&(hasDefaultUsername||!userResponse.user.username))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                      // #endregion
                      if (isNewSignup || (!hasCompletedOnboarding && (hasDefaultUsername || !userResponse.user.username))) {
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:110',message:'setShowOnboarding(true) called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                        // #endregion
                        setShowOnboarding(true);
                      } else {
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:112',message:'setIsAuthenticated(true) called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                        // #endregion
                        setIsAuthenticated(true);
                      }
                      finishInitialization();
                      // #region agent log
                      fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:114',message:'Early return after email verification',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      // #endregion
                    }
                    return;
                  }
                } catch (error: any) {
                  // #region agent log
                  fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:118',message:'Error fetching user after email verification',data:{error:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                  console.error('Error fetching user after email verification:', error);
                  toast.error('Failed to load user data. Please try logging in.');
                  finishInitialization();
                  return;
                }
              }
            } catch (error: any) {
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:121',message:'Error parsing email verification hash',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              console.error('Error parsing email verification hash:', error);
              // Continue to normal auth flow
            }
          }
          
          const stored = localStorage.getItem('auth_token');
          if (stored) {
            // Check cache first (5 minute cache for user data)
            const cachedUser = requestCache.get<any>(cacheKeys.user());
            const cachedTimestamp = localStorage.getItem('user_data_timestamp');
            const now = Date.now();
            
            // Use cached data if less than 5 minutes old
            if (cachedUser && cachedTimestamp && now - parseInt(cachedTimestamp) < CacheTime.LONG) {
              console.log('⚡ Using cached user data (AuthContext)');
              if (isMounted) {
                setIsAuthenticated(true);
                setUserData({
                  email: cachedUser.email || '',
                  name: cachedUser.full_name || cachedUser.username || '',
                  username: cachedUser.username,
                  avatar: cachedUser.avatar_url,
                  bio: cachedUser.bio,
                });
                finishInitialization();
              }
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
                
                if (isMounted) {
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
                  finishInitialization();
                }
              } else {
                finishInitialization();
              }
            } catch (error: any) {
              // Token is invalid or expired, clear it silently
              console.log('[AUTH] Token validation failed, clearing stored token:', error.message);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data_timestamp');
              requestCache.clear(cacheKeys.user());
              apiClient.setToken(null);
              finishInitialization();
            }
          } else {
            // No token found
            finishInitialization();
          }
        } else {
          // Not in browser environment
          finishInitialization();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        finishInitialization();
      }
    };

    initializeAuth();

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:264',message:'useEffect cleanup',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      isMounted = false;
    };
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
