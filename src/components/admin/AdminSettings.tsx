import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data || []);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      setSaving(true);
      await adminApi.updateSetting(key, value);
      toast.success('Setting updated');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['all', 'platform', 'features', 'content', 'notifications', 'broadcast'];
  const filteredSettings = category === 'all' 
    ? settings 
    : settings.filter(s => s.category === category);

  const groupedSettings = filteredSettings.reduce((acc: any, setting: any) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          System Settings
        </h2>
        <p className="text-gray-400 mt-1">Configure platform settings and features</p>
      </div>

      {/* Category Filter */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                category === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {Object.keys(groupedSettings).map((cat) => (
          <div key={cat} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">{cat} Settings</h3>
            <div className="space-y-4">
              {groupedSettings[cat].map((setting: any) => (
                <div key={setting.key} className="flex items-start justify-between gap-4 p-4 bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">{setting.key}</div>
                    <div className="text-sm text-gray-400 mt-1">{setting.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.data_type === 'boolean' ? (
                      <select
                        value={setting.value}
                        onChange={(e) => handleUpdate(setting.key, e.target.value)}
                        disabled={saving}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : setting.data_type === 'number' ? (
                      <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleUpdate(setting.key, e.target.value)}
                        disabled={saving}
                        className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      />
                    ) : (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleUpdate(setting.key, e.target.value)}
                        disabled={saving}
                        className="w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;

