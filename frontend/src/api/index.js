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
  getPregnantAnimals: async (params = {}) => {
    const response = await apiClient.get('/reproductive/pregnant-animals', { params });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/reproductive/stats', { params });
    return response.data;
  },
  getProcedures: async (params = {}) => {
    const response = await apiClient.get('/reproductive/procedures', { params });
    return response.data;
  },
  getProcedure: async (id) => {
    const response = await apiClient.get(`/reproductive/procedures/${id}`);
    return response.data;
  },
  createProcedure: async (data) => {
    const response = await apiClient.post('/reproductive/procedures', data);
    return response.data;
  },
  updateProcedure: async (id, data) => {
    const response = await apiClient.patch(`/reproductive/procedures/${id}`, data);
    return response.data;
  },
  getRecentProcedures: async (limit = 10) => {
    const response = await apiClient.get('/reproductive/procedures/recent', { params: { limit } });
    return response.data;
  },
};

export const sanitaryApi = {
  getVaccinations: async (params = {}) => {
    const response = await apiClient.get('/sanitary/vaccinations', { params });
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
  getCampaign: async (id) => {
    const response = await apiClient.get(`/sanitary/campaigns/${id}`);
    return response.data;
  },
  createCampaign: async (data) => {
    const response = await apiClient.post('/sanitary/campaigns', data);
    return response.data;
  },
  updateCampaign: async (id, data) => {
    const response = await apiClient.patch(`/sanitary/campaigns/${id}`, data);
    return response.data;
  },
  createHealthRecord: async (data) => {
    const response = await apiClient.post('/sanitary/health-records', data);
    return response.data;
  },
  recordApplication: async (data) => {
    const response = await apiClient.post('/sanitary/applications', data);
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await apiClient.get('/sanitary/stats', { params });
    return response.data;
  },
  getRecentTreatments: async (limit = 10) => {
    const response = await apiClient.get('/sanitary/treatments/recent', { params: { limit } });
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
  generate: async (type, filters) => {
    const response = await apiClient.post(`/reports/generate/${type}`, filters);
    return response.data;
  },
};

export const servicesApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/services', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/services', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  },
};

export const batchesApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/batches', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/batches/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/batches', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/batches/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/batches/${id}`);
    return response.data;
  },
  addAnimals: async (id, animalIds) => {
    const response = await apiClient.post(`/batches/${id}/animals`, { animalIds });
    return response.data;
  },
  removeAnimal: async (id, animalId) => {
    const response = await apiClient.delete(`/batches/${id}/animals/${animalId}`);
    return response.data;
  },
};

export const teamApi = {
  getMembers: async () => {
    const response = await apiClient.get('/team/members');
    return response.data;
  },
  invite: async (data) => {
    const response = await apiClient.post('/team/invite', data);
    return response.data;
  },
  removeMember: async (userId) => {
    const response = await apiClient.delete(`/team/members/${userId}`);
    return response.data;
  },
  updateRole: async (userId, role) => {
    const response = await apiClient.patch(`/team/members/${userId}/role`, { role });
    return response.data;
  },
  getPendingInvites: async () => {
    const response = await apiClient.get('/team/invites/pending');
    return response.data;
  },
  cancelInvite: async (inviteId) => {
    const response = await apiClient.delete(`/team/invites/${inviteId}`);
    return response.data;
  },
};

export const profileApi = {
  get: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },
  update: async (data) => {
    const response = await apiClient.patch('/profile', data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await apiClient.post('/profile/change-password', data);
    return response.data;
  },
  uploadAvatar: async (formData) => {
    const response = await apiClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
