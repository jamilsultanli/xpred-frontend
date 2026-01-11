import { apiClient } from './client';

export interface ResolutionProposal {
  proposed_outcome: boolean;
  evidence?: string;
  notes?: string;
}

export const resolutionsApi = {
  // Get user's pending resolutions
  getPendingResolutions: async (): Promise<{
    success: boolean;
    predictions: any[];
    counts: {
      total: number;
      pending: number;
      underReview: number;
    };
  }> => {
    return apiClient.get('/predictions/pending-resolutions');
  },

  // Submit resolution proposal
  submitResolution: async (predictionId: string, proposal: ResolutionProposal): Promise<{
    success: boolean;
    message: string;
    prediction: any;
  }> => {
    return apiClient.post(`/predictions/${predictionId}/propose-resolution`, proposal);
  },
};

