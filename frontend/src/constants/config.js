export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
  SPECIES: 'species',
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
};

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  sold: 'bg-blue-100 text-blue-800',
  deceased: 'bg-gray-100 text-gray-800',
  transferred: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

export const ANIMAL_SEX = {
  male: 'Male',
  female: 'Female',
};

export const REPRODUCTIVE_STATUS = {
  open: 'Open',
  pregnant: 'Pregnant',
  lactating: 'Lactating',
  dry: 'Dry',
};

export const SERVICE_CATEGORIES = {
  reproductive: 'Reproductive',
  sanitary: 'Sanitary',
  clinical: 'Clinical',
  surgical: 'Surgical',
  consulting: 'Consulting',
};
