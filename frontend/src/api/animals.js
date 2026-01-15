import apiClient from './client';

export const animalsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/animals', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/animals/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/animals', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/animals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/animals/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, reason) => {
    const response = await apiClient.patch(`/animals/${id}/status`, { status, reason });
    return response.data;
  },

  recordWeight: async (id, data) => {
    const response = await apiClient.post(`/animals/${id}/weight`, data);
    return response.data;
  },

  getWeightHistory: async (id, params = {}) => {
    const response = await apiClient.get(`/animals/${id}/weight`, { params });
    return response.data;
  },

  getGenealogy: async (id, generations = 3) => {
    const response = await apiClient.get(`/animals/${id}/genealogy`, { params: { generations } });
    return response.data;
  },

  // Species and Breeds
  getSpecies: async () => {
    const response = await apiClient.get('/animals/species');
    return response.data;
  },

  getBreedsBySpecies: async (speciesId) => {
    const response = await apiClient.get(`/animals/species/${speciesId}/breeds`);
    return response.data;
  },

  // Batches
  getBatches: async (params = {}) => {
    const response = await apiClient.get('/animals/batches', { params });
    return response.data;
  },

  getBatch: async (id) => {
    const response = await apiClient.get(`/animals/batches/${id}`);
    return response.data;
  },

  createBatch: async (data) => {
    const response = await apiClient.post('/animals/batches', data);
    return response.data;
  },

  updateBatch: async (id, data) => {
    const response = await apiClient.patch(`/animals/batches/${id}`, data);
    return response.data;
  },

  deleteBatch: async (id) => {
    const response = await apiClient.delete(`/animals/batches/${id}`);
    return response.data;
  },

  addAnimalsToBatch: async (batchId, animalIds) => {
    const response = await apiClient.post(`/animals/batches/${batchId}/add-animals`, { animalIds });
    return response.data;
  },

  removeAnimalsFromBatch: async (batchId, animalIds) => {
    const response = await apiClient.post(`/animals/batches/${batchId}/remove-animals`, { animalIds });
    return response.data;
  },
};

export default animalsApi;
