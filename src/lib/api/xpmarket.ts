import { apiClient } from './client';

export interface MarketItem {
  id: string;
  type: 'title' | 'avatar_frame' | 'grey_tick';
  name: string;
  description: string;
  cost_xp: number;
  image_url?: string;
  metadata?: any;
  is_active: boolean;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  cost_xp: number;
  purchased_at: string;
  xp_market_items: MarketItem;
}

export const xpMarketApi = {
  getMarketItems: async (type?: string): Promise<{ success: boolean; items: MarketItem[] }> => {
    const query = type ? `?type=${type}` : '';
    return apiClient.get(`/xp-market/items${query}`);
  },

  purchaseItem: async (itemId: string): Promise<{ success: boolean; message: string; new_balance_xp: number }> => {
    return apiClient.post('/xp-market/purchase', { item_id: itemId });
  },

  getMyPurchases: async (): Promise<{ success: boolean; purchases: UserPurchase[] }> => {
    return apiClient.get('/xp-market/my-purchases');
  },
};

