import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const dashboardApi = {
  getOverview: () => apiClient.get('/dashboard/overview'),

  getTodayAppointments: () => apiClient.get('/dashboard/today'),

  getAlerts: () => apiClient.get('/dashboard/alerts'),

  getStats: (params) => apiClient.get(`/dashboard/stats${buildQueryString(params)}`),
};
