import { useState } from 'react';
import { X, Link as LinkIcon, Twitter, Facebook, Copy, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  description?: string;
}

export function ShareModal({ isOpen, onClose, url, title, description }: ShareModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const shareTitle = title || 'Check out this prediction on Xpred';
  const shareText = description || title || 'Check out this prediction on Xpred';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'}`}>
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Share</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Copy Link */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'bg-black' : 'bg-white'} border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <p className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{shareUrl}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className={`p-4 rounded-xl border transition-colors flex items-center gap-3 ${
                isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Twitter</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className={`p-4 rounded-xl border transition-colors flex items-center gap-3 ${
                isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Facebook</span>
            </button>
          </div>

          {/* Native Share (Mobile) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all"
            >
              Share via...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

