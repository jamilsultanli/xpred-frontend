import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { settingsApi } from '../lib/api/settings';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditProfileModal({ isOpen, onClose, onUpdate }: EditProfileModalProps) {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const isDark = theme === 'dark';
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && userData) {
      setFullName(userData.name || '');
      setBio(userData.bio || '');
      setAvatarUrl(userData.avatar || '');
      setBannerUrl('');
    }
  }, [isOpen, userData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await settingsApi.updateProfile({
        full_name: fullName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        banner_url: bannerUrl.trim() || undefined,
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        onUpdate();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} flex flex-col max-h-[90vh]`}>
        <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="Tell us about yourself"
              maxLength={160}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{bio.length}/160</p>
          </div>
          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Avatar"
            type="avatar"
            maxSizeMB={2}
          />
          <ImageUpload
            value={bannerUrl}
            onChange={setBannerUrl}
            label="Banner"
            type="banner"
            maxSizeMB={5}
          />
        </div>
        <div className={`flex-shrink-0 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-6`}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

