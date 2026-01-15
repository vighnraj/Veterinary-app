import apiClient from './client';

export const dashboardApi = {
  getOverview: async () => {
    const response = await apiClient.get('/dashboard/overview');
    return response.data;
  },

  getTodayAppointments: async () => {
    const response = await apiClient.get('/dashboard/today');
    return response.data;
  },

  getAlerts: async () => {
    const response = await apiClient.get('/dashboard/alerts');
    return response.data;
  },

  getStats: async (period = 30) => {
    const response = await apiClient.get('/dashboard/stats', { params: { period } });
    return response.data;
  },
};

export default dashboardApi;
