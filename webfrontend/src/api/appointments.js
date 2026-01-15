import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const appointmentsApi = {
  // Appointments
  getAppointments: (params) =>
    apiClient.get(`/appointments${buildQueryString(params)}`),

  getAppointment: (id) => apiClient.get(`/appointments/${id}`),

  createAppointment: (data) => apiClient.post('/appointments', data),

  updateAppointment: (id, data) => apiClient.patch(`/appointments/${id}`, data),

  updateAppointmentStatus: (id, data) =>
    apiClient.patch(`/appointments/${id}/status`, data),

  // Animals
  addAnimalsToAppointment: (id, data) =>
    apiClient.post(`/appointments/${id}/animals`, data),

  removeAnimalsFromAppointment: (id, data) =>
    apiClient.delete(`/appointments/${id}/animals`, { data }),

  updateAnimalProcedure: (appointmentId, animalId, data) =>
    apiClient.patch(`/appointments/${appointmentId}/animals/${animalId}/procedure`, data),

  // Services
  addServicesToAppointment: (id, data) =>
    apiClient.post(`/appointments/${id}/services`, data),

  // Quick access
  getTodayAppointments: () => apiClient.get('/appointments/today'),

  getUpcomingAppointments: (days = 7) =>
    apiClient.get(`/appointments/upcoming?days=${days}`),

  getAppointmentStats: () => apiClient.get('/appointments/stats'),

  // Services management
  getServices: () => apiClient.get('/appointments/services'),

  createService: (data) => apiClient.post('/appointments/services', data),

  updateService: (id, data) => apiClient.patch(`/appointments/services/${id}`, data),

  deleteService: (id) => apiClient.delete(`/appointments/services/${id}`),
};
