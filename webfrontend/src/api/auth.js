import apiClient from './client';

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),

  register: (data) => apiClient.post('/auth/register', data),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),

  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),

  resendVerification: (email) =>
    apiClient.post('/auth/resend-verification', { email }),

  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data) => apiClient.post('/auth/reset-password', data),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data) => apiClient.patch('/auth/profile', data),

  changePassword: (data) => apiClient.post('/auth/change-password', data),
};
