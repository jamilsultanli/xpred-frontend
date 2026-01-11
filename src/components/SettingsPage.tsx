import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Palette, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { settingsApi } from '../lib/api/settings';
import { blocksApi } from '../lib/api/blocks';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ChangeUsernameModal } from './ChangeUsernameModal';
import { BlockedUsersModal } from './BlockedUsersModal';
import { MutedUsersModal } from './MutedUsersModal';
import { GeneralSettingsModal } from './GeneralSettingsModal';
import { PrivacySettingsModal } from './PrivacySettingsModal';
import { TwoFactorAuthModal } from './TwoFactorAuthModal';
import { toast } from 'sonner';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout, userData } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    reposts: true,
    follows: true,
    wins: true,
    mentions: true,
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showMutedUsers, setShowMutedUsers] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [generalSettingsType, setGeneralSettingsType] = useState<'language' | 'currency' | 'timezone'>('language');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const response = await settingsApi.getNotificationSettings();
      if (response.success && response.settings) {
        setNotifications(response.settings);
      }
    } catch (error) {
      // Use defaults if API fails
      console.error('Failed to load notification settings:', error);
    }
  };

  const updateNotificationSetting = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    const updated = { ...notifications, [key]: newValue };
    setNotifications(updated);
    
    try {
      await settingsApi.updateNotificationSettings({ [key]: newValue });
      toast.success('Settings updated');
    } catch (error: any) {
      // Revert on error
      setNotifications(notifications);
      toast.error(error.message || 'Failed to update settings');
    }
  };

  const handleAccountAction = (label: string) => {
    if (label === 'Edit profile') {
      setShowEditProfile(true);
    } else if (label === 'Change username') {
      setShowChangeUsername(true);
    } else if (label === 'Change password') {
      setShowChangePassword(true);
    }
  };

  const handlePrivacyAction = async (label: string) => {
    if (label === 'Blocked users') {
      setShowBlockedUsers(true);
    } else if (label === 'Muted users') {
      setShowMutedUsers(true);
    } else if (label === 'Privacy settings') {
      toast.info('Privacy settings coming soon');
    } else if (label === 'Two-factor authentication') {
      setShowTwoFactorAuth(true);
    }
  };

  const handleGeneralAction = (label: string) => {
    if (label === 'Language') {
      setGeneralSettingsType('language');
      setShowGeneralSettings(true);
    } else if (label === 'Currency') {
      setGeneralSettingsType('currency');
      setShowGeneralSettings(true);
    } else if (label === 'Time zone') {
      setGeneralSettingsType('timezone');
      setShowGeneralSettings(true);
    }
  };

      const handleSupportAction = (label: string) => {
        if (label === 'Help Center') {
          navigate('/help');
        } else if (label === 'Terms of Service') {
          navigate('/terms');
        } else if (label === 'Privacy Policy') {
          navigate('/privacy');
        } else if (label === 'Contact us') {
          navigate('/contact');
        }
      };

  const refreshUserData = async () => {
    // Refresh user data after profile update
    window.location.reload();
  };

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Edit profile', description: 'Update your profile information', action: () => handleAccountAction('Edit profile') },
        { label: 'Change username', description: 'Modify your @username', action: () => handleAccountAction('Change username') },
        { label: 'Change password', description: 'Update your password', action: () => handleAccountAction('Change password') },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Likes', description: 'When someone likes your prediction', toggle: true, value: notifications.likes, onChange: () => updateNotificationSetting('likes') },
        { label: 'Comments', description: 'When someone comments on your prediction', toggle: true, value: notifications.comments, onChange: () => updateNotificationSetting('comments') },
        { label: 'Reposts', description: 'When someone reposts your prediction', toggle: true, value: notifications.reposts, onChange: () => updateNotificationSetting('reposts') },
        { label: 'New followers', description: 'When someone follows you', toggle: true, value: notifications.follows, onChange: () => updateNotificationSetting('follows') },
        { label: 'Prediction wins', description: 'When your predictions win', toggle: true, value: notifications.wins, onChange: () => updateNotificationSetting('wins') },
        { label: 'Mentions', description: 'When someone mentions you', toggle: true, value: notifications.mentions, onChange: () => updateNotificationSetting('mentions') },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Lock,
      items: [
        { label: 'Privacy settings', description: 'Control who can see your content', action: () => setShowPrivacySettings(true) },
        { label: 'Blocked users', description: 'Manage blocked accounts', action: () => handlePrivacyAction('Blocked users') },
        { label: 'Muted users', description: 'Manage muted accounts', action: () => handlePrivacyAction('Muted users') },
        { label: 'Two-factor authentication', description: 'Add extra security', action: () => handlePrivacyAction('Two-factor authentication') },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { label: 'Theme', description: `Currently: ${theme === 'dark' ? 'Dark' : 'Light'}`, action: toggleTheme },
      ],
    },
    {
      title: 'General',
      icon: Globe,
      items: [
        { label: 'Language', description: 'English (US)', action: () => handleGeneralAction('Language') },
        { label: 'Currency', description: 'USD ($)', action: () => handleGeneralAction('Currency') },
        { label: 'Time zone', description: 'Automatic', action: () => handleGeneralAction('Time zone') },
      ],
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        { label: 'Help Center', description: 'Get help using Xpred', action: () => handleSupportAction('Help Center') },
        { label: 'Terms of Service', description: 'Read our terms', action: () => handleSupportAction('Terms of Service') },
        { label: 'Privacy Policy', description: 'Read our privacy policy', action: () => handleSupportAction('Privacy Policy') },
        { label: 'Contact us', description: 'Get in touch with support', action: () => handleSupportAction('Contact us') },
      ],
    },
  ];

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-5 h-5" />
              <h2 className="text-lg font-bold">{section.title}</h2>
            </div>
            <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden`}>
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors text-base ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  } ${index < section.items.length - 1 ? (isDark ? 'border-b border-gray-800' : 'border-b border-gray-200') : ''}`}
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-base">{item.label}</div>
                    <div className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </div>
                  </div>
                  {item.toggle ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={item.onChange}
                        className="sr-only peer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        item.value ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                      }`}></div>
                    </label>
                  ) : (
                    <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden`}>
          <button
            onClick={logout}
            className={`w-full px-4 py-4 flex items-center gap-3 transition-colors text-red-500 hover:bg-red-500/10`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Log out</span>
          </button>
        </div>

        <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} py-4`}>
          <p>Xpred v1.0.0</p>
          <p className="mt-1">© 2026 Xpred AI. All rights reserved.</p>
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onUpdate={refreshUserData}
      />
      <ChangeUsernameModal
        isOpen={showChangeUsername}
        onClose={() => setShowChangeUsername(false)}
        onUpdate={refreshUserData}
      />
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <BlockedUsersModal
        isOpen={showBlockedUsers}
        onClose={() => setShowBlockedUsers(false)}
      />
      <MutedUsersModal
        isOpen={showMutedUsers}
        onClose={() => setShowMutedUsers(false)}
      />
      <GeneralSettingsModal
        isOpen={showGeneralSettings}
        onClose={() => setShowGeneralSettings(false)}
        type={generalSettingsType}
      />
      <PrivacySettingsModal
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />
      <TwoFactorAuthModal
        isOpen={showTwoFactorAuth}
        onClose={() => setShowTwoFactorAuth(false)}
      />
    </div>
  );
}
