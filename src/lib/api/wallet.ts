import { apiClient } from './client';

export interface Bundle {
  id: string;
  cost: number;
  xp: number;
  xc: number;
}

export interface PaymentIntentResponse {
  success: boolean;
  client_secret: string;
  payment_intent_id: string;
}

export const walletApi = {
  getBalance: async () => {
    return apiClient.get('/wallet/balance');
  },

  getTransactions: async (page: number = 1, limit: number = 20) => {
    return apiClient.get(`/wallet/transactions?page=${page}&limit=${limit}`);
  },

  getBundles: async (): Promise<{ success: boolean; bundles: Bundle[] }> => {
    return apiClient.get('/wallet/bundles');
  },

  createPaymentIntent: async (bundleId: string): Promise<PaymentIntentResponse> => {
    return apiClient.post('/wallet/create-payment-intent', { bundle_id: bundleId });
  },

  purchaseBundle: async (bundleId: string, paymentMethod: 'stripe' | 'paypal', paymentToken?: string, paymentIntentId?: string) => {
    return apiClient.post('/wallet/purchase-bundle', {
      bundle_id: bundleId,
      payment_method: paymentMethod,
      payment_token: paymentToken,
      payment_intent_id: paymentIntentId,
    });
  },

  exchangeXPtoXC: async (amountXP: number) => {
    return apiClient.post('/wallet/exchange', {
      amount_xp: amountXP,
    });
  },
};

