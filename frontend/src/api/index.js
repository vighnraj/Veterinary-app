export { default as apiClient } from './client';
export { default as authApi } from './auth';
export { default as clientsApi } from './clients';
export { default as animalsApi } from './animals';
export { default as dashboardApi } from './dashboard';

// Additional API modules
import apiClient from './client';

export const appointmentsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/appointments', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/appointments/${id}`, data);
    return response.data;
  },
  updateStatus: async (id, status, reason) => {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status, reason });
    return response.data;
  },
  getToday: async () => {
    const response = await apiClient.get('/appointments/today');
    return response.data;
  },
  getUpcoming: async (days = 7) => {
    const response = await apiClient.get('/appointments/upcoming', { params: { days } });
    return response.data;
  },
  getServices: async () => {
    const response = await apiClient.get('/appointments/services');
    return response.data;
  },
};

export const financialApi = {
  getInvoices: async (params = {}) => {
    const response = await apiClient.get('/financial/invoices', { params });
    return response.data;
  },
  getInvoice: async (id) => {
    const response = await apiClient.get(`/financial/invoices/${id}`);
    return response.data;
  },
  createInvoice: async (data) => {
    const response = await apiClient.post('/financial/invoices', data);
    return response.data;
  },
  updateInvoice: async (id, data) => {
    const response = await apiClient.patch(`/financial/invoices/${id}`, data);
    return response.data;
  },
  recordPayment: async (id, data) => {
    const response = await apiClient.post(`/financial/invoices/${id}/payments`, data);
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/financial/stats', { params });
    return response.data;
  },
  getReceivables: async () => {
    const response = await apiClient.get('/financial/receivables');
    return response.data;
  },
};

export const reproductiveApi = {
  recordHeat: async (data) => {
    const response = await apiClient.post('/reproductive/heat', data);
    return response.data;
  },
  recordInsemination: async (data) => {
    const response = await apiClient.post('/reproductive/insemination', data);
    return response.data;
  },
  recordPregnancyCheck: async (data) => {
    const response = await apiClient.post('/reproductive/pregnancy-check', data);
    return response.data;
  },
  recordBirth: async (data) => {
    const response = await apiClient.post('/reproductive/birth', data);
    return response.data;
  },
  getPregnant: async (params = {}) => {
    const response = await apiClient.get('/reproductive/pregnant', { params });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/reproductive/stats', { params });
    return response.data;
  },
};

export const sanitaryApi = {
  getVaccinations: async () => {
    const response = await apiClient.get('/sanitary/vaccinations');
    return response.data;
  },
  applyVaccination: async (data) => {
    const response = await apiClient.post('/sanitary/vaccinations/apply', data);
    return response.data;
  },
  applyBatchVaccination: async (data) => {
    const response = await apiClient.post('/sanitary/vaccinations/apply-batch', data);
    return response.data;
  },
  getAlerts: async (params = {}) => {
    const response = await apiClient.get('/sanitary/alerts/vaccinations', { params });
    return response.data;
  },
  getCampaigns: async (params = {}) => {
    const response = await apiClient.get('/sanitary/campaigns', { params });
    return response.data;
  },
  createHealthRecord: async (data) => {
    const response = await apiClient.post('/sanitary/health-records', data);
    return response.data;
  },
};

export const subscriptionApi = {
  getPlans: async () => {
    const response = await apiClient.get('/subscription/plans');
    return response.data;
  },
  getStatus: async () => {
    const response = await apiClient.get('/subscription/status');
    return response.data;
  },
  createCheckout: async (planId, billingPeriod) => {
    const response = await apiClient.post('/subscription/checkout', { planId, billingPeriod });
    return response.data;
  },
  cancel: async () => {
    const response = await apiClient.post('/subscription/cancel');
    return response.data;
  },
  resume: async () => {
    const response = await apiClient.post('/subscription/resume');
    return response.data;
  },
};

export const notificationsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },
  registerPushToken: async (token, platform) => {
    const response = await apiClient.post('/notifications/push-token', { token, platform });
    return response.data;
  },
};

export const reportsApi = {
  generateAppointmentReport: async (id) => {
    const response = await apiClient.get(`/reports/appointments/${id}`);
    return response.data;
  },
  generateAnimalReport: async (id) => {
    const response = await apiClient.get(`/reports/animals/${id}`);
    return response.data;
  },
  generateInvoicePDF: async (id) => {
    const response = await apiClient.get(`/reports/invoices/${id}`);
    return response.data;
  },
  generateFinancialReport: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/financial', { params: { startDate, endDate } });
    return response.data;
  },
};
