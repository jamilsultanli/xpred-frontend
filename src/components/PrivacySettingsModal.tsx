import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // 'public' | 'followers' | 'private'
    showEmail: false,
    showLocation: true,
    allowMessages: 'everyone', // 'everyone' | 'followers' | 'none'
    showActivity: true,
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Privacy settings updated successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} flex flex-col max-h-[90vh]`}>
        <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Privacy Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <option value="public">Public - Anyone can view</option>
              <option value="followers">Followers only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Who can message you
            </label>
            <select
              value={settings.allowMessages}
              onChange={(e) => setSettings({ ...settings, allowMessages: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <option value="everyone">Everyone</option>
              <option value="followers">Followers only</option>
              <option value="none">No one</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className={`flex items-center justify-between cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <div className="font-semibold">Show email</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Allow others to see your email address
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 ${
                  settings.showEmail ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </label>

            <label className={`flex items-center justify-between cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <div className="font-semibold">Show location</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Display your location on your profile
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showLocation}
                  onChange={(e) => setSettings({ ...settings, showLocation: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 ${
                  settings.showLocation ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </label>

            <label className={`flex items-center justify-between cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <div className="font-semibold">Show activity status</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Show when you're active
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showActivity}
                  onChange={(e) => setSettings({ ...settings, showActivity: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 ${
                  settings.showActivity ? 'bg-blue-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </label>
          </div>
        </div>
        <div className={`flex-shrink-0 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-6 flex gap-3`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

