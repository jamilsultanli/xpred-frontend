import { apiClient } from './client';

export interface AdminPermission {
  id: string;
  role_id: string;
  resource: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  level: number;
}

export interface AdminUser {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  role: string;
  admin_role_id?: string;
  admin_role?: AdminRole;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: {
    id: string;
    username: string;
  };
}

export interface UserNote {
  id: string;
  user_id: string;
  admin_id: string;
  note: string;
  type: 'note' | 'warning' | 'ban_reason' | 'internal';
  is_visible_to_user: boolean;
  created_at: string;
  admin?: {
    id: string;
    username: string;
    full_name?: string;
  };
}

export interface ResolutionSubmission {
  id: string;
  prediction_id: string;
  submitted_by: string;
  proof_url?: string;
  proof_image?: string;
  proposed_outcome: boolean;
  submission_notes?: string;
  admin_notes?: string;
  reviewed_by?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_needed';
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  prediction?: any;
  submitter?: any;
  reviewer?: any;
}

export interface DashboardStats {
  total_users: number;
  total_predictions: number;
  total_bets: number;
  total_volume_xp: number;
  total_volume_xc: number;
  active_users_24h: number;
  new_users_7d: number;
  pending_kyc: number;
  pending_reports: number;
  pending_support: number;
}

export interface ChartData {
  user_growth: Array<{ date: string; value: number }>;
  bet_volume_xp: Array<{ date: string; value: number }>;
  bet_volume_xc: Array<{ date: string; value: number }>;
  bet_count: Array<{ date: string; value: number }>;
}

/**
 * Admin API Client
 * All endpoints require admin authentication
 */
export const adminApi = {
  // =====================================================
  // PERMISSIONS & ADMIN MANAGEMENT
  // =====================================================

  /**
   * Get current admin's permissions
   */
  getMyPermissions: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/admin/me/permissions');
    return response.data || [];
  },

  /**
   * Get all admin users
   */
  getAdmins: async () => {
    const response = await apiClient.get<{ success: boolean; admins: AdminUser[] }>('/admin/admins');
    return response.admins || [];
  },

  /**
   * Promote user to admin
   */
  promoteToAdmin: async (userId: string, role_name: string, reason?: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/admins/${userId}/promote`, {
      role_name,
      reason,
    });
    return response.data || response;
  },

  /**
   * Demote admin to regular user
   */
  demoteAdmin: async (userId: string, reason?: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/admins/${userId}/demote`, {
      reason,
    });
    return response.data || response;
  },

  // =====================================================
  // DASHBOARD
  // =====================================================

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await apiClient.get<any>('/admin/dashboard/stats', {
      key: 'GET:/admin/dashboard/stats',
    });
    // Backend returns flat structure directly (not nested in stats object)
    // Remove success field and return the rest
    const { success, ...stats } = response;
    return stats || {};
  },

  /**
   * Get dashboard charts data
   */
  getDashboardCharts: async (period: '24h' | '7d' | '30d' = '7d') => {
    const response = await apiClient.get<{ success: boolean; charts: ChartData }>(`/admin/dashboard/charts?period=${period}`, {
      key: `GET:/admin/dashboard/charts?period=${period}`,
    });
    return response.charts || {};
  },

  /**
   * Get top users by metric
   */
  getTopUsers: async (metric: 'balance_xp' | 'balance_xc' | 'predictions' = 'balance_xp', limit = 10) => {
    const response = await apiClient.get<{ success: boolean; users: any[] }>(`/admin/dashboard/top-users?metric=${metric}&limit=${limit}`, {
      key: `GET:/admin/dashboard/top-users?metric=${metric}&limit=${limit}`,
    });
    return response.users || [];
  },

  /**
   * Get recent activity feed
   */
  getRecentActivity: async (limit = 20) => {
    const response = await apiClient.get<{ success: boolean; activity: any[] }>(`/admin/dashboard/activity?limit=${limit}`, {
      key: `GET:/admin/dashboard/activity?limit=${limit}`,
    });
    return response.activity || [];
  },

  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  /**
   * Get users with filters and pagination
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    is_banned?: boolean;
    is_verified?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role) queryParams.set('role', params.role);
    if (params?.is_banned !== undefined) queryParams.set('is_banned', params.is_banned.toString());
    if (params?.is_verified !== undefined) queryParams.set('is_verified', params.is_verified.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    const response = await apiClient.get<{ success: boolean; users: any[]; pagination: any }>(endpoint, { enabled: false });
    return { users: response.users || [], pagination: response.pagination };
  },

  /**
   * Get detailed user information
   */
  getUserDetails: async (userId: string) => {
    const response = await apiClient.get<{ success: boolean; user: any }>(`/admin/users/${userId}`, { enabled: false });
    return response.user || response.data?.user;
  },

  /**
   * Update user details
   */
  updateUser: async (userId: string, data: {
    role?: 'user' | 'admin' | 'moderator';
    is_banned?: boolean;
    balance_xp?: number;
    balance_xc?: number;
    is_verified?: boolean;
  }) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/users/${userId}`, data);
    return response.data || response;
  },

  /**
   * Ban user
   */
  banUser: async (userId: string, reason?: string, duration_days?: number) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/users/${userId}/ban`, {
      reason,
      duration_days,
    });
    return response.data || response;
  },

  /**
   * Add funds to user account
   */
  addFunds: async (userId: string, amount: number, currency: 'XP' | 'XC', reason?: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/users/${userId}/add-funds`, {
      amount,
      currency,
      reason,
    });
    return response.data || response;
  },

  /**
   * Get user notes
   */
  getUserNotes: async (userId: string) => {
    const response = await apiClient.get<{ success: boolean; notes: UserNote[] }>(`/admin/users/${userId}/notes`, { enabled: false });
    return response.notes || [];
  },

  /**
   * Add note to user
   */
  addUserNote: async (userId: string, note: string, type?: string, is_visible_to_user?: boolean) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/users/${userId}/notes`, {
      note,
      type,
      is_visible_to_user,
    });
    return response.data || response;
  },

  // =====================================================
  // PREDICTION MANAGEMENT
  // =====================================================

  /**
   * Get predictions with filters
   */
  getPredictions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    is_featured?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.is_featured !== undefined) queryParams.set('is_featured', params.is_featured.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/predictions?${queryString}` : '/admin/predictions';
    
    const response = await apiClient.get<{ success: boolean; predictions: any[]; pagination: any }>(endpoint, { enabled: false });
    return { predictions: response.predictions || [], pagination: response.pagination };
  },

  /**
   * Update prediction
   */
  updatePrediction: async (predictionId: string, data: {
    is_featured?: boolean;
    category?: string;
  }) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/predictions/${predictionId}`, data);
    return response.data || response;
  },

  /**
   * Force resolve prediction
   */
  forceResolvePrediction: async (predictionId: string, outcome: boolean, reason?: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/predictions/${predictionId}/resolve`, {
      outcome,
      reason,
    });
    return response.data || response;
  },

  /**
   * Delete prediction
   */
  deletePrediction: async (predictionId: string) => {
    const response = await apiClient.delete<{ success: boolean; data: any }>(`/admin/predictions/${predictionId}`);
    return response.data || response;
  },

  // =====================================================
  // RESOLUTION QUEUE
  // =====================================================

  /**
   * Get resolution queue
   */
  getResolutionQueue: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.category) queryParams.set('category', params.category);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/resolutions/queue?${queryString}` : '/admin/resolutions/queue';
    
    const response = await apiClient.get<{ success: boolean; resolutions: ResolutionSubmission[]; pagination: any }>(endpoint, { enabled: false });
    return { resolutions: response.resolutions || [], pagination: response.pagination };
  },

  /**
   * Review resolution submission
   */
  reviewResolution: async (resolutionId: string, decision: 'approved' | 'rejected', admin_notes?: string, rejection_reason?: string) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/resolutions/${resolutionId}/review`, {
      decision,
      admin_notes,
      rejection_reason,
    });
    return response.data || response;
  },

  // =====================================================
  // REPORTS & MODERATION
  // =====================================================

  /**
   * Get reports
   */
  getReports: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.type) queryParams.set('type', params.type);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/reports?${queryString}` : '/admin/reports';
    
    const response = await apiClient.get<{ success: boolean; reports: any[]; pagination: any }>(endpoint, { enabled: false });
    return { reports: response.reports || [], pagination: response.pagination };
  },

  /**
   * Resolve report
   */
  resolveReport: async (reportId: string, action: 'dismiss' | 'ban_user' | 'delete_content' | 'warn_user', notes?: string) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/reports/${reportId}`, {
      action,
      notes,
    });
    return response.data || response;
  },

  // =====================================================
  // KYC MANAGEMENT
  // =====================================================

  /**
   * Get KYC requests
   */
  getKYCRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/kyc/requests?${queryString}` : '/admin/kyc/requests';
    
    const response = await apiClient.get<{ success: boolean; requests: any[]; pagination: any }>(endpoint, { enabled: false });
    return { requests: response.requests || [], pagination: response.pagination };
  },

  /**
   * Update KYC status
   */
  updateKYCStatus: async (requestId: string, decision: 'approved' | 'rejected', admin_notes?: string) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/kyc/requests/${requestId}`, {
      decision,
      admin_notes,
    });
    return response.data || response;
  },

  // =====================================================
  // SUPPORT MANAGEMENT
  // =====================================================

  /**
   * Get support tickets
   */
  getTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.priority) queryParams.set('priority', params.priority);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/support/tickets?${queryString}` : '/admin/support/tickets';
    
    const response = await apiClient.get<{ success: boolean; tickets: any[]; pagination: any }>(endpoint, { enabled: false });
    return { tickets: response.tickets || [], pagination: response.pagination };
  },

  /**
   * Reply to ticket
   */
  replyToTicket: async (ticketId: string, admin_reply: string, status?: 'resolved' | 'in_progress') => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/admin/support/tickets/${ticketId}/reply`, {
      admin_reply,
      status,
    });
    return response.data || response;
  },

  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================

  /**
   * Get system settings
   */
  getSettings: async () => {
    const response = await apiClient.get<{ success: boolean; settings: any }>('/admin/settings', { enabled: false });
    return response.settings || [];
  },

  /**
   * Update setting
   */
  updateSetting: async (key: string, value: string) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(`/admin/settings/${key}`, { value });
    return response.data || response;
  },

  // =====================================================
  // BROADCAST
  // =====================================================

  /**
   * Send broadcast message
   */
  sendBroadcast: async (message: string, options?: {
    type?: 'info' | 'warning' | 'announcement';
    set_banner?: boolean;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: any }>('/admin/broadcast', {
      message,
      ...options,
    });
    return response.data || response;
  },

  // =====================================================
  // FINANCE ANALYTICS
  // =====================================================

  /**
   * Get finance analytics
   */
  getFinanceAnalytics: async (period: '24h' | '7d' | '30d' | '90d' | '1y' = '30d') => {
    const response = await apiClient.get<{ success: boolean; revenue: any; volume: any; transactions: any; trends: any[] }>(`/admin/finance/analytics?period=${period}`, { enabled: false });
    // Transform backend response to match component expectations
    return {
      total_revenue_xp: response.revenue?.total_xp || 0,
      total_revenue_xc: response.revenue?.total_xc || 0,
      revenue_growth_xp: 0, // Not provided by backend yet
      revenue_growth_xc: 0, // Not provided by backend yet
      total_transactions: (response.transactions?.deposits || 0) + (response.transactions?.withdrawals || 0),
      total_fees: response.revenue?.total_xp || 0, // Platform fees
      revenue_trend: response.trends || [],
      recent_transactions: [], // Not provided by backend yet
      ...response, // Include all other fields
    };
  },

  // =====================================================
  // AUDIT LOGS
  // =====================================================

  /**
   * Get audit logs
   */
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    admin_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.admin_id) queryParams.set('admin_id', params.admin_id);
    if (params?.action) queryParams.set('action', params.action);
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/audit-logs?${queryString}` : '/admin/audit-logs';
    
    const response = await apiClient.get<{ success: boolean; logs: AuditLog[]; pagination: any }>(endpoint, { enabled: false });
    return { logs: response.logs || [], pagination: response.pagination };
  },
};

export default adminApi;

