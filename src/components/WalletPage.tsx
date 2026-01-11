import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet as WalletIcon, RefreshCw, History, Gem, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api/client';
import { StripeCheckoutModal } from './StripeCheckoutModal';
import { toast } from 'sonner';

const BUNDLES = [
  { id: 'b1', cost: 4.99, xp: 5000, xc: 5 },
  { id: 'b2', cost: 9.99, xp: 12000, xc: 15 },
  { id: 'b3', cost: 19.99, xp: 25000, xc: 35 },
  { id: 'b4', cost: 49.99, xp: 75000, xc: 100 },
];

export function WalletPage() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [balanceXP, setBalanceXP] = useState(0);
  const [balanceXC, setBalanceXC] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<typeof BUNDLES[0] | null>(null);
  const [exchangeXP, setExchangeXP] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1000); // 1000 XP = 1 XC

  useEffect(() => {
    if (isAuthenticated) {
      loadWallet();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadWallet = async () => {
    setIsLoading(true);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        apiClient.get('/wallet/balance'),
        apiClient.get('/wallet/transactions'),
      ]);

      if (balanceRes.success) {
        const balance = balanceRes.balance || balanceRes;
        setBalanceXP(parseFloat(balance.balance_xp || '0'));
        setBalanceXC(parseFloat(balance.balance_xc || '0'));
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.transactions || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = (bundle: typeof BUNDLES[0]) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedBundle(bundle);
  };

  const handlePurchaseSuccess = async () => {
    await loadWallet();
    setSelectedBundle(null);
  };

  const handleExchange = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const amount = parseFloat(exchangeXP);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balanceXP) {
      toast.error('Insufficient XP balance');
      return;
    }

    try {
      const response = await apiClient.post('/wallet/exchange', {
        amount_xp: amount,
      });

      if (response.success) {
        const xcReceived = response.xc_received || (amount / exchangeRate);
        toast.success(`Exchanged ${amount.toLocaleString()} XP for ${xcReceived.toFixed(2)} XC`);
        setExchangeXP('');
        await loadWallet();
      } else {
        toast.error(response.message || 'Exchange failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Exchange failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to view your wallet</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <WalletIcon className="w-6 h-6" />
            Wallet
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Balance Display */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                <div className="text-sm text-gray-500 mb-2">XP Balance</div>
                <div className="text-3xl font-bold text-blue-400">{balanceXP.toLocaleString()}</div>
              </div>
              <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                <div className="text-sm text-gray-500 mb-2">XC Balance</div>
                <div className="text-3xl font-bold text-purple-400">{balanceXC.toFixed(2)}</div>
              </div>
            </div>

            {/* Purchase Bundles */}
            <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
              <h2 className="text-xl font-bold mb-4">Purchase Bundles</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {BUNDLES.map((bundle) => (
                  <div
                    key={bundle.id}
                    className={`${isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}
                  >
                    <div className="text-2xl font-bold mb-2">${bundle.cost}</div>
                    <div className="text-sm text-gray-500 mb-1">{bundle.xp.toLocaleString()} XP</div>
                    <div className="text-sm text-purple-400 mb-4">+ {bundle.xc} XC Bonus</div>
                    <button
                      onClick={() => handlePurchase(bundle)}
                      className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange */}
            <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
              <h2 className="text-xl font-bold mb-4">Exchange XP to XC</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">XP Amount</label>
                  <input
                    type="number"
                    value={exchangeXP}
                    onChange={(e) => setExchangeXP(e.target.value)}
                    placeholder="Enter XP amount"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Rate: {exchangeRate} XP = 1 XC
                  </div>
                </div>
                <button
                  onClick={handleExchange}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-colors"
                >
                  Exchange
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </h2>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No transactions yet</div>
                ) : (
                  transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className={`${isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 flex items-center justify-between`}
                    >
                      <div>
                        <div className="font-semibold">{tx.description || tx.type}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        tx.type === 'bet_won' || tx.type === 'deposit' || tx.type === 'bonus'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {tx.type === 'bet_won' || tx.type === 'deposit' || tx.type === 'bonus' ? '+' : '-'}
                        {Math.abs(parseFloat(tx.amount)).toLocaleString()} {tx.currency}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedBundle && (
        <StripeCheckoutModal
          isOpen={!!selectedBundle}
          onClose={() => setSelectedBundle(null)}
          bundle={selectedBundle}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}

