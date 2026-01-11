import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { settingsApi } from '../lib/api/settings';
import { toast } from 'sonner';

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ChangeUsernameModal({ isOpen, onClose, onUpdate }: ChangeUsernameModalProps) {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const isDark = theme === 'dark';
  const [username, setUsername] = useState(userData?.username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await settingsApi.changeUsername(username.trim());
      if (response.success) {
        toast.success('Username changed successfully');
        onUpdate();
        onClose();
      } else {
        toast.error(response.message || 'Failed to change username');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change username');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} flex flex-col`}>
        <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Change Username</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="username"
              maxLength={30}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {username.length}/30 characters. Only letters, numbers, and underscores.
            </p>
          </div>
        </div>
        <div className={`flex-shrink-0 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-6`}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !username.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Change Username'}
          </button>
        </div>
      </div>
    </div>
  );
}

