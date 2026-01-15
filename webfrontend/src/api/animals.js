import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const animalsApi = {
  // Reference data
  getSpecies: () => apiClient.get('/animals/species'),

  getBreedsBySpecies: (speciesId) =>
    apiClient.get(`/animals/species/${speciesId}/breeds`),

  // Animals
  getAnimals: (params) => apiClient.get(`/animals${buildQueryString(params)}`),

  getAnimal: (id) => apiClient.get(`/animals/${id}`),

  createAnimal: (data) => apiClient.post('/animals', data),

  updateAnimal: (id, data) => apiClient.patch(`/animals/${id}`, data),

  deleteAnimal: (id) => apiClient.delete(`/animals/${id}`),

  updateAnimalStatus: (id, data) => apiClient.patch(`/animals/${id}/status`, data),

  // Weight
  getWeightHistory: (id, params) =>
    apiClient.get(`/animals/${id}/weight${buildQueryString(params)}`),

  recordWeight: (id, data) => apiClient.post(`/animals/${id}/weight`, data),

  // Genealogy
  getGenealogy: (id, params) =>
    apiClient.get(`/animals/${id}/genealogy${buildQueryString(params)}`),

  // Batches
  getBatches: (params) => apiClient.get(`/animals/batches${buildQueryString(params)}`),

  getBatch: (id) => apiClient.get(`/animals/batches/${id}`),

  createBatch: (data) => apiClient.post('/animals/batches', data),

  updateBatch: (id, data) => apiClient.patch(`/animals/batches/${id}`, data),

  deleteBatch: (id) => apiClient.delete(`/animals/batches/${id}`),

  addAnimalsToBatch: (batchId, animalIds) =>
    apiClient.post(`/animals/batches/${batchId}/add-animals`, { animalIds }),

  removeAnimalsFromBatch: (batchId, animalIds) =>
    apiClient.post(`/animals/batches/${batchId}/remove-animals`, { animalIds }),
};
