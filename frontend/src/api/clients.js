import apiClient from './client';

export const clientsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/clients', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },

  getFinancialSummary: async (id) => {
    const response = await apiClient.get(`/clients/${id}/financial`);
    return response.data;
  },

  getServiceHistory: async (id, params = {}) => {
    const response = await apiClient.get(`/clients/${id}/history`, { params });
    return response.data;
  },

  // Properties
  getProperties: async (clientId) => {
    const response = await apiClient.get(`/clients/${clientId}/properties`);
    return response.data;
  },

  createProperty: async (clientId, data) => {
    const response = await apiClient.post(`/clients/${clientId}/properties`, data);
    return response.data;
  },

  updateProperty: async (clientId, propertyId, data) => {
    const response = await apiClient.patch(`/clients/${clientId}/properties/${propertyId}`, data);
    return response.data;
  },

  deleteProperty: async (clientId, propertyId) => {
    const response = await apiClient.delete(`/clients/${clientId}/properties/${propertyId}`);
    return response.data;
  },
};

export default clientsApi;
