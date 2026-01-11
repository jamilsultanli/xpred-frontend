import { apiClient } from './client';

export interface PlacePredictionRequest {
  prediction_id: string;
  amount: number;
  currency: 'XP' | 'XC';
  choice: 'yes' | 'no';
}

export interface PlacePredictionResponse {
  success: boolean;
  bet?: any;
  multiplier?: number;
  potential_payout?: number;
  platform_fee?: number;
  you_receive?: number;
  updated_balance?: any;
  message?: string;
}

export interface ActivePrediction {
  id: string;
  user_id: string;
  prediction_id: string;
  amount: number;
  currency: string;
  choice: 'yes' | 'no';
  multiplier_at_bet?: number;
  created_at: string;
  prediction?: {
    id: string;
    question: string;
    deadline: string;
    is_resolved: boolean;
    outcome?: boolean;
    total_pot_xp?: number;
    yes_pool_xp?: number;
    no_pool_xp?: number;
    total_pot_xc?: number;
    yes_pool_xc?: number;
    no_pool_xc?: number;
  };
  currentMultiplier?: number;
  potentialPayout?: number;
  currentOdds?: {
    yes: number;
    no: number;
  };
}

export interface ActivePredictionsResponse {
  success: boolean;
  bets: ActivePrediction[];
  count: number;
}

export const betsApi = {
  placePrediction: async (data: PlacePredictionRequest): Promise<PlacePredictionResponse> => {
    return apiClient.post('/bets', data);
  },

  getActivePredictions: async (): Promise<ActivePredictionsResponse> => {
    return apiClient.get('/bets/active');
  },

  getMultipliers: async (predictionId: string): Promise<{ success: boolean; multipliers: any }> => {
    return apiClient.get(`/bets/multipliers/${predictionId}`);
  },
};
