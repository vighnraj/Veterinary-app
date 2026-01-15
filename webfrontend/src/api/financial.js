import apiClient from './client';
import { buildQueryString } from '../utils/helpers';

export const financialApi = {
  // Stats
  getFinancialStats: (params) =>
    apiClient.get(`/financial/stats${buildQueryString(params)}`),

  getReceivables: () => apiClient.get('/financial/receivables'),

  getRevenueByCategory: (params) =>
    apiClient.get(`/financial/revenue-by-category${buildQueryString(params)}`),

  getOverdueInvoices: (params) =>
    apiClient.get(`/financial/overdue${buildQueryString(params)}`),

  // Invoices
  getInvoices: (params) => apiClient.get(`/financial/invoices${buildQueryString(params)}`),

  getInvoice: (id) => apiClient.get(`/financial/invoices/${id}`),

  createInvoice: (data) => apiClient.post('/financial/invoices', data),

  updateInvoice: (id, data) => apiClient.patch(`/financial/invoices/${id}`, data),

  updateInvoiceStatus: (id, data) =>
    apiClient.patch(`/financial/invoices/${id}/status`, data),

  recordPayment: (invoiceId, data) =>
    apiClient.post(`/financial/invoices/${invoiceId}/payments`, data),

  generateInvoicePDF: (id) => apiClient.get(`/financial/invoices/${id}/pdf`),
};
