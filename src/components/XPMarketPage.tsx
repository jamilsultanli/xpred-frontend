import { useState, useEffect } from 'react';
import { Store, Loader2, Check, Sparkles, Image as ImageIcon, Badge } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { xpMarketApi, MarketItem } from '../lib/api/xpmarket';
import { apiClient } from '../lib/api/client';
import { toast } from 'sonner';

export function XPMarketPage() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [items, setItems] = useState<MarketItem[]>([]);
  const [myPurchases, setMyPurchases] = useState<string[]>([]);
  const [balanceXP, setBalanceXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'title' | 'frame' | 'tick'>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMarket();
      loadBalance();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadMarket = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, purchasesRes] = await Promise.all([
        xpMarketApi.getMarketItems(),
        xpMarketApi.getMyPurchases(),
      ]);

      if (itemsRes.success) {
        const uniqueItems = Array.from(
          new Map(itemsRes.items.map((it) => [it.id, it])).values()
        );
        setItems(uniqueItems);
      }

      if (purchasesRes.success) {
        setMyPurchases(purchasesRes.purchases.map(p => p.item_id));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load market');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const response = await apiClient.get('/wallet/balance');
      if (response.success && response.balance) {
        setBalanceXP(parseFloat(response.balance.balance_xp || '0'));
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handlePurchase = async (item: MarketItem) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (balanceXP < item.cost_xp) {
      toast.error('Insufficient XP balance');
      return;
    }

    if (!confirm(`Purchase ${item.name} for ${item.cost_xp.toLocaleString()} XP?`)) {
      return;
    }

    setPurchasing(item.id);
    try {
      const response = await xpMarketApi.purchaseItem(item.id);
      if (response.success) {
        toast.success(response.message);
        setBalanceXP(response.new_balance_xp);
        setMyPurchases([...myPurchases, item.id]);
        await loadMarket(); // Reload to refresh UI
      }
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => {
        if (activeTab === 'title') return item.type === 'title';
        if (activeTab === 'frame') return item.type === 'avatar_frame';
        if (activeTab === 'tick') return item.type === 'grey_tick';
        return true;
      });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to access XP Market</p>
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Store className="w-6 h-6" />
            XP Market
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Purchase titles, avatar frames, and badges with your XP
          </p>
          <div className={`mt-4 inline-block px-4 py-2 rounded-xl ${isDark ? 'bg-[#16181c]' : 'bg-gray-100'}`}>
            <span className="text-sm">Your Balance: </span>
            <span className="font-bold text-blue-400">{balanceXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex mb-6 overflow-x-auto`}>
          {[
            { id: 'all', label: 'All Items', icon: Store },
            { id: 'title', label: 'Titles', icon: Badge },
            { id: 'frame', label: 'Frames', icon: ImageIcon },
            { id: 'tick', label: 'Badges', icon: Check },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-4 border-blue-500'
                  : isDark ? 'text-gray-400 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No items available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isOwned = myPurchases.includes(item.id);
              const canAfford = balanceXP >= item.cost_xp;

              return (
                <div
                  key={item.id}
                  className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6 flex flex-col`}
                >
                  {/* Item Image/Icon */}
                  <div className="mb-4 flex justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                    ) : (
                      <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${
                        item.type === 'title' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        item.type === 'avatar_frame' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                        'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}>
                        {item.type === 'title' && <Badge className="w-12 h-12 text-white" />}
                        {item.type === 'avatar_frame' && <ImageIcon className="w-12 h-12 text-white" />}
                        {item.type === 'grey_tick' && <Check className="w-12 h-12 text-white" />}
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <span className="font-bold text-blue-400">{item.cost_xp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  {isOwned ? (
                    <button
                      disabled
                      className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg font-bold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Owned
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={purchasing === item.id || !canAfford}
                      className={`w-full py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        canAfford
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {purchasing === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : canAfford ? (
                        'Purchase'
                      ) : (
                        'Insufficient XP'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

