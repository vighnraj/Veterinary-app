import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const clientsApi = {
  // Clients
  getClients: (params) => apiClient.get(`/clients${buildQueryString(params)}`),

  getClient: (id) => apiClient.get(`/clients/${id}`),

  createClient: (data) => apiClient.post('/clients', data),

  updateClient: (id, data) => apiClient.patch(`/clients/${id}`, data),

  deleteClient: (id) => apiClient.delete(`/clients/${id}`),

  getFinancialSummary: (id) => apiClient.get(`/clients/${id}/financial`),

  getServiceHistory: (id, params) =>
    apiClient.get(`/clients/${id}/history${buildQueryString(params)}`),

  // Properties
  getProperties: (clientId) => apiClient.get(`/clients/${clientId}/properties`),

  createProperty: (clientId, data) =>
    apiClient.post(`/clients/${clientId}/properties`, data),

  updateProperty: (clientId, propertyId, data) =>
    apiClient.patch(`/clients/${clientId}/properties/${propertyId}`, data),

  deleteProperty: (clientId, propertyId) =>
    apiClient.delete(`/clients/${clientId}/properties/${propertyId}`),
};
