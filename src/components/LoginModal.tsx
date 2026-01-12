import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Apple, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authApi } from '../lib/api/auth';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const response = await authApi.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
        });

        if (response.success && response.user) {
          toast.success('Account created successfully!');
          // Clear onboarding completed flag for new users to ensure onboarding shows
          localStorage.removeItem('onboarding_completed');
          login({
            email: response.user.email || formData.email,
            name: response.user.full_name || formData.name,
            username: response.user.username,
            avatar: response.user.avatar_url,
            bio: response.user.bio,
            created_at: response.user.created_at, // Pass created_at to detect new user
          });
        } else {
          setError(response.message || 'Registration failed');
          toast.error(response.message || 'Registration failed');
        }
      } else {
        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
        });

        if (response.success && response.user) {
          toast.success('Welcome back!');
          // Use user data from login response directly
          login({
            email: response.user.email || formData.email,
            name: response.user.full_name || formData.name,
            username: response.user.username,
            avatar: response.user.avatar_url,
            bio: response.user.bio,
          });
        } else {
          setError(response.message || 'Login failed');
          toast.error(response.message || 'Login failed');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error?.message ||
                          err?.response?.data?.error ||
                          err?.message || 
                          'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowLoginModal(false)}
      ></div>
      
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} overflow-hidden`}>
        <button
          onClick={() => setShowLoginModal(false)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">X</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {mode === 'login' ? 'Welcome back' : 'Join Xpred'}
          </h2>
          <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {mode === 'login' 
              ? 'Sign in to start predicting the future' 
              : 'Create an account to start predicting'}
          </p>
          
          <div className="space-y-3 mb-6">
            <button className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold border transition-all hover:scale-[1.02] ${
              isDark 
                ? 'bg-white text-black border-white hover:bg-gray-100' 
                : 'bg-black text-white border-black hover:bg-gray-900'
            }`}>
              <Apple className="w-5 h-5" />
              Continue with Apple
            </button>
            
            <button className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold border transition-all hover:scale-[1.02] ${
              isDark 
                ? 'border-gray-700 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}>
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
          
          <div className="relative mb-6">
            <div className={`absolute inset-0 flex items-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${isDark ? 'bg-[#16181c] text-gray-400' : 'bg-white text-gray-600'}`}>
                or continue with email
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDark 
                        ? 'bg-black border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark 
                      ? 'bg-black border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark 
                      ? 'bg-black border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'} hover:text-blue-500`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Remember me</span>
                </label>
                <a href="#" className="text-blue-500 hover:text-blue-400">
                  Forgot password?
                </a>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </span>
            {' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-500 hover:text-blue-400 font-semibold"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
          
          <p className={`mt-6 text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}