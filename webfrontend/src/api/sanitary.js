import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const sanitaryApi = {
  // Vaccinations
  getVaccinations: () => apiClient.get('/sanitary/vaccinations'),

  createVaccination: (data) => apiClient.post('/sanitary/vaccinations', data),

  applyVaccination: (data) => apiClient.post('/sanitary/vaccinations/apply', data),

  applyBatchVaccination: (data) =>
    apiClient.post('/sanitary/vaccinations/apply-batch', data),

  getAnimalVaccinations: (animalId, params) =>
    apiClient.get(`/sanitary/animals/${animalId}/vaccinations${buildQueryString(params)}`),

  getVaccinationAlerts: (params) =>
    apiClient.get(`/sanitary/alerts/vaccinations${buildQueryString(params)}`),

  // Health records
  createHealthRecord: (data) => apiClient.post('/sanitary/health-records', data),

  getAnimalHealthRecords: (animalId, params) =>
    apiClient.get(`/sanitary/animals/${animalId}/health-records${buildQueryString(params)}`),

  // Campaigns
  getCampaigns: (params) => apiClient.get(`/sanitary/campaigns${buildQueryString(params)}`),

  createCampaign: (data) => apiClient.post('/sanitary/campaigns', data),

  getCampaign: (id) => apiClient.get(`/sanitary/campaigns/${id}`),

  updateCampaignStatus: (id, data) =>
    apiClient.patch(`/sanitary/campaigns/${id}/status`, data),

  // Stats
  getStats: () => apiClient.get('/sanitary/stats'),
};
