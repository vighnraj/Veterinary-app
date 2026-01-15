export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  ACCOUNT: 'account',
};

export const QUERY_KEYS = {
  USER: 'user',
  PROFILE: 'profile',
  CLIENTS: 'clients',
  CLIENT: 'client',
  ANIMALS: 'animals',
  ANIMAL: 'animal',
  BATCHES: 'batches',
  BATCH: 'batch',
  SPECIES: 'species',
  BREEDS: 'breeds',
  APPOINTMENTS: 'appointments',
  APPOINTMENT: 'appointment',
  SERVICES: 'services',
  INVOICES: 'invoices',
  INVOICE: 'invoice',
  DASHBOARD: 'dashboard',
  ALERTS: 'alerts',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTION: 'subscription',
  PLANS: 'plans',
  VACCINATIONS: 'vaccinations',
  CAMPAIGNS: 'campaigns',
  REPRODUCTIVE_STATS: 'reproductive_stats',
  SANITARY_STATS: 'sanitary_stats',
  FINANCIAL_STATS: 'financial_stats',
  PREGNANT_ANIMALS: 'pregnant_animals',
  RECEIVABLES: 'receivables',
  PROPERTIES: 'properties',
};
