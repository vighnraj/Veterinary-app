import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const reproductiveApi = {
  // Records
  recordHeat: (data) => apiClient.post('/reproductive/heat', data),

  recordInsemination: (data) => apiClient.post('/reproductive/insemination', data),

  recordPregnancyCheck: (data) => apiClient.post('/reproductive/pregnancy-check', data),

  recordBirth: (data) => apiClient.post('/reproductive/birth', data),

  recordAbortion: (data) => apiClient.post('/reproductive/abortion', data),

  recordAndrologicalEval: (data) => apiClient.post('/reproductive/andrological', data),

  // Procedures
  createProcedure: (data) => apiClient.post('/reproductive/procedures', data),

  updateProcedureResult: (id, data) =>
    apiClient.patch(`/reproductive/procedures/${id}/result`, data),

  // History
  getAnimalHistory: (animalId, params) =>
    apiClient.get(`/reproductive/animals/${animalId}/history${buildQueryString(params)}`),

  getAnimalProcedures: (animalId, params) =>
    apiClient.get(`/reproductive/animals/${animalId}/procedures${buildQueryString(params)}`),

  // Analytics
  getPregnantAnimals: (params) =>
    apiClient.get(`/reproductive/pregnant${buildQueryString(params)}`),

  getStats: (params) => apiClient.get(`/reproductive/stats${buildQueryString(params)}`),
};
