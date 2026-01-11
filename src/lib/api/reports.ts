import { apiClient } from './client';

export interface CreateReportData {
  entity_type: 'prediction' | 'user' | 'comment';
  entity_id: string;
  reason: string;
  details?: string;
}

export const reportsApi = {
  createReport: async (data: CreateReportData): Promise<{ success: boolean; message?: string }> => {
    const payload: any = {
      type: data.entity_type === 'comment' ? 'prediction' : data.entity_type,
      reason: data.reason,
    };

    if (data.entity_type === 'prediction' || data.entity_type === 'comment') {
      payload.prediction_id = data.entity_id;
    } else if (data.entity_type === 'user') {
      payload.user_id = data.entity_id;
    }

    if (data.details) {
      payload.reason = `${data.reason}: ${data.details}`;
    }

    return apiClient.post('/reports', payload);
  },

  reportPrediction: async (predictionId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/reports', {
      prediction_id: predictionId,
      reason,
      type: 'prediction',
    });
  },

  reportUser: async (userId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/reports', {
      user_id: userId,
      reason,
      type: 'user',
    });
  },
};

