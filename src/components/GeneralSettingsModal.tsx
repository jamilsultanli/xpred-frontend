import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'language' | 'currency' | 'timezone';
}

const languages = [
  { code: 'en', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

const timezones = [
  { code: 'auto', name: 'Automatic (Browser)' },
  { code: 'UTC', name: 'UTC' },
  { code: 'America/New_York', name: 'Eastern Time (ET)' },
  { code: 'America/Chicago', name: 'Central Time (CT)' },
  { code: 'America/Denver', name: 'Mountain Time (MT)' },
  { code: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
  { code: 'Europe/London', name: 'London (GMT)' },
  { code: 'Europe/Istanbul', name: 'Istanbul (GMT+3)' },
];

export function GeneralSettingsModal({ isOpen, onClose, type }: GeneralSettingsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selected, setSelected] = useState<string>('');

  const handleSave = () => {
    // In a real app, this would save to backend
    const settingName = type === 'language' ? 'Language' : type === 'currency' ? 'Currency' : 'Time zone';
    toast.success(`${settingName} updated successfully`);
    onClose();
  };

  if (!isOpen) return null;

  const options = type === 'language' ? languages : type === 'currency' ? currencies : timezones;
  const title = type === 'language' ? 'Language' : type === 'currency' ? 'Currency' : 'Time Zone';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'}`}>
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.code}
                onClick={() => setSelected(option.code)}
                className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                  selected === option.code
                    ? isDark ? 'bg-blue-500/20 border-blue-500' : 'bg-blue-50 border-blue-500'
                    : isDark ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-gray-50 border-gray-200'
                } border`}
              >
                <div className="font-semibold">
                  {type === 'currency' ? `${(option as any).symbol} ${option.name}` : option.name}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
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
              disabled={!selected}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

