import { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { betsApi } from '../lib/api/bets';
import { apiClient } from '../lib/api/client';

interface PlaceBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  prediction: 'yes' | 'no';
  predictionId?: string;
  initialCurrency?: 'XP' | 'XC';
}

export function PlaceBetModal({ isOpen, onClose, question, prediction, predictionId, initialCurrency }: PlaceBetModalProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'xp' | 'xc'>(initialCurrency?.toLowerCase() as 'xp' | 'xc' || 'xp');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balanceXP, setBalanceXP] = useState(0);
  const [balanceXC, setBalanceXC] = useState(0);
  const [multiplier, setMultiplier] = useState(1.5);
  const [potentialPayout, setPotentialPayout] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [youReceive, setYouReceive] = useState(0);

  useEffect(() => {
    if (isOpen && isAuthenticated && predictionId) {
      loadBalance();
      loadMultipliers();
    }
  }, [isOpen, isAuthenticated, predictionId, activeTab]);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const amt = parseFloat(amount);
      const payout = amt * multiplier;
      const fee = payout * 0.05; // 5% platform fee
      setPotentialPayout(payout);
      setPlatformFee(fee);
      setYouReceive(payout - fee);
    } else {
      setPotentialPayout(0);
      setPlatformFee(0);
      setYouReceive(0);
    }
  }, [amount, multiplier]);

  const loadBalance = async () => {
    try {
      const response = await apiClient.get('/wallet/balance');
      if (response.success) {
        const balance = response.balance || response;
        setBalanceXP(parseFloat(balance.balance_xp || '0'));
        setBalanceXC(parseFloat(balance.balance_xc || '0'));
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const loadMultipliers = async () => {
    if (!predictionId) return;
    try {
      const response = await betsApi.getMultipliers(predictionId);
      if (response.success && response.multipliers) {
        const currency = activeTab === 'xp' ? 'xp' : 'xc';
        const choice = prediction === 'yes' ? 'yes' : 'no';
        const mult = response.multipliers[currency]?.[choice] || 1.5;
        setMultiplier(mult);
      }
    } catch (error) {
      console.error('Failed to load multipliers:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!predictionId) {
      toast.error('Prediction ID is required');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amt = parseFloat(amount);
    const currency = activeTab === 'xp' ? 'XP' : 'XC';
    const balance = currency === 'XP' ? balanceXP : balanceXC;

    if (amt > balance) {
      toast.error(`Insufficient ${currency} balance`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await betsApi.placePrediction({
        prediction_id: predictionId,
        amount: amt,
        currency,
        choice: prediction,
      });

      if (response.success) {
        toast.success(`Prediction placed successfully! Potential win: ${response.you_receive?.toFixed(2)} ${currency}`);
        await loadBalance();
        onClose();
        setAmount('');
        // Reload page to update predictions
        window.location.reload();
      } else {
        toast.error(response.message || 'Failed to place prediction');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = activeTab === 'xp' 
    ? ['1000', '5000', '10000', '25000']
    : ['1', '5', '10', '25'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-[#16181c]' : 'bg-white'}`}>
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
          <h2 className="text-xl font-bold">Make Your Prediction</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`${isDark ? 'bg-black/50' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Question</div>
            <div className="font-semibold mb-3">{question}</div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your prediction:</span>
              <span className={`font-bold px-3 py-1 rounded-full ${
                prediction === 'yes' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {prediction.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('xp')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                activeTab === 'xp'
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              XP Points
            </button>
            <button
              onClick={() => setActiveTab('xc')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                activeTab === 'xc'
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-5 h-5 mx-auto mb-1" />
              XC Coins
            </button>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Available: {activeTab === 'xp' ? `${balanceXP.toLocaleString()} XP` : `${balanceXC.toFixed(2)} XC`}
            </div>
          </div>

          <div className="mb-6">
            <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Quick Select</div>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 px-3 rounded-lg font-semibold transition-colors ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className={`${isDark ? 'bg-black/50' : 'bg-gray-50'} rounded-xl p-4 mb-6 space-y-2`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Multiplier</span>
              <span className="font-semibold text-blue-400">{multiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Potential Payout</span>
              <span className="font-bold text-lg text-green-400">
                {potentialPayout > 0 ? `${potentialPayout.toFixed(2)} ${activeTab.toUpperCase()}` : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Platform Fee (5%)</span>
              <span className="font-semibold text-yellow-400">
                {platformFee > 0 ? `${platformFee.toFixed(2)} ${activeTab.toUpperCase()}` : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>You Receive</span>
              <span className="font-bold text-xl text-green-400">
                {youReceive > 0 ? `${youReceive.toFixed(2)} ${activeTab.toUpperCase()}` : '0'}
              </span>
            </div>
          </div>
        </div>
        
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-6 flex-shrink-0`}>
          <button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Confirm Prediction'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}