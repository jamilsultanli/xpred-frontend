import { useState } from 'react';
import { X, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorAuthModal({ isOpen, onClose }: TwoFactorAuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call backend API to generate QR code
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQrCode('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==');
      setSecret('JBSWY3DPEHPK3PXP');
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would verify the code with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('success');
      toast.success('Two-factor authentication enabled successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would disable 2FA via backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Two-factor authentication disabled');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'}`}>
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'setup' && (
            <div className="space-y-4">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Two-factor authentication adds an extra layer of security to your account. 
                You'll need to enter a code from your authenticator app when logging in.
              </p>
              <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-4 space-y-2`}>
                <div className="font-semibold">How it works:</div>
                <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>Scan the QR code with an authenticator app</li>
                  <li>Enter the 6-digit code to verify</li>
                  <li>Use the code when logging in</li>
                </ul>
              </div>
              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enable 2FA'}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48 border-2 border-gray-300 rounded-xl" />
              </div>
              <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Secret Key:</div>
                <div className="font-mono text-sm font-bold">{secret}</div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('setup')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold">2FA Enabled!</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Two-factor authentication is now enabled for your account. 
                You'll need to enter a code from your authenticator app when logging in.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDisable}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  Disable 2FA
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

