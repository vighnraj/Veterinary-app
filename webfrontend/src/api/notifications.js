import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const notificationsApi = {
  getNotifications: (params) =>
    apiClient.get(`/notifications${buildQueryString(params)}`),

  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.post('/notifications/mark-all-read'),

  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),

  registerPushToken: (data) => apiClient.post('/notifications/push-token', data),

  removePushToken: () => apiClient.delete('/notifications/push-token'),
};
