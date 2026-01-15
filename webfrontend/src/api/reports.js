import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const reportsApi = {
  generateAppointmentReport: (id) =>
    apiClient.get(`/reports/appointments/${id}`, { responseType: 'blob' }),

  generateAnimalReport: (id) =>
    apiClient.get(`/reports/animals/${id}`, { responseType: 'blob' }),

  generateInvoiceReport: (id) =>
    apiClient.get(`/reports/invoices/${id}`, { responseType: 'blob' }),

  generateFinancialReport: (params) =>
    apiClient.get(`/reports/financial${buildQueryString(params)}`, { responseType: 'blob' }),
};
