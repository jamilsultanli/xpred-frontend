import React, { useState } from 'react';
import { Radio, Send, Users, Bell } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { toast } from 'sonner';

export const BroadcastMessage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'announcement'>('info');
  const [setBanner, setSetBanner] = useState(false);
  const [targetAudience, setTargetAudience] = useState('all');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      setSending(true);
      await adminApi.sendBroadcast(message, {
        type,
        set_banner: setBanner,
      });
      toast.success('Broadcast sent successfully');
      setMessage('');
      setSetBanner(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Radio className="w-8 h-8" />
          Broadcast Message
        </h2>
        <p className="text-gray-400 mt-1">Send announcements and notifications to users</p>
      </div>

      {/* Composer */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
        {/* Message Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Message Type</label>
          <div className="flex gap-2">
            {[
              { value: 'info', label: 'Info', color: 'bg-blue-600' },
              { value: 'warning', label: 'Warning', color: 'bg-yellow-600' },
              { value: 'announcement', label: 'Announcement', color: 'bg-purple-600' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  type === t.value
                    ? `${t.color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Target Audience</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users (Last 7 Days)</option>
            <option value="verified">Verified Users Only</option>
            <option value="premium">Premium Users Only</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your broadcast message here..."
            rows={6}
            maxLength={1000}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <div className="text-right text-sm text-gray-400 mt-2">
            {message.length} / 1000 characters
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="set-banner"
            checked={setBanner}
            onChange={(e) => setSetBanner(e.target.checked)}
            className="w-4 h-4 bg-gray-900 border-gray-700 rounded focus:ring-purple-500"
          />
          <label htmlFor="set-banner" className="text-sm text-gray-300 cursor-pointer">
            Also set as platform banner (visible on all pages)
          </label>
        </div>

        {/* Preview */}
        {message && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
            <div className={`p-4 rounded-lg ${
              type === 'info' ? 'bg-blue-900 border border-blue-700' :
              type === 'warning' ? 'bg-yellow-900 border border-yellow-700' :
              'bg-purple-900 border border-purple-700'
            }`}>
              <div className="flex items-start gap-3">
                <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  type === 'info' ? 'text-blue-400' :
                  type === 'warning' ? 'text-yellow-400' :
                  'text-purple-400'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-white mb-1">
                    {type === 'info' ? 'Information' :
                     type === 'warning' ? 'Warning' :
                     'Announcement'}
                  </div>
                  <div className="text-gray-200 text-sm">{message}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Broadcast to {targetAudience === 'all' ? 'All' : targetAudience.charAt(0).toUpperCase() + targetAudience.slice(1)} Users
            </>
          )}
        </button>
      </div>

      {/* Recent Broadcasts */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Broadcasts</h3>
        <div className="text-center text-gray-400 py-8">
          No recent broadcasts
        </div>
      </div>
    </div>
  );
};

export default BroadcastMessage;

