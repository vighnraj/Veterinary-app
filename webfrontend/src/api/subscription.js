import apiClient from './client';

export const subscriptionApi = {
  getPlans: () => apiClient.get('/subscription/plans'),

  getSubscriptionStatus: () => apiClient.get('/subscription/status'),

  createCheckoutSession: (data) => apiClient.post('/subscription/checkout', data),

  createPortalSession: () => apiClient.post('/subscription/portal'),

  cancelSubscription: () => apiClient.post('/subscription/cancel'),

  resumeSubscription: () => apiClient.post('/subscription/resume'),
};
