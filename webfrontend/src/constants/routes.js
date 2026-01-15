export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Dashboard
  DASHBOARD: '/',

  // Clients
  CLIENTS: '/clients',
  CLIENT_CREATE: '/clients/new',
  CLIENT_DETAIL: '/clients/:id',
  CLIENT_EDIT: '/clients/:id/edit',

  // Animals
  ANIMALS: '/animals',
  ANIMAL_CREATE: '/animals/new',
  ANIMAL_DETAIL: '/animals/:id',
  ANIMAL_EDIT: '/animals/:id/edit',
  BATCHES: '/batches',
  BATCH_CREATE: '/batches/new',
  BATCH_DETAIL: '/batches/:id',

  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_CREATE: '/appointments/new',
  APPOINTMENT_DETAIL: '/appointments/:id',
  SERVICES: '/services',

  // Reproductive
  REPRODUCTIVE: '/reproductive',
  PREGNANT_ANIMALS: '/reproductive/pregnant',

  // Sanitary
  SANITARY: '/sanitary',
  VACCINATION_ALERTS: '/sanitary/alerts',
  CAMPAIGNS: '/sanitary/campaigns',

  // Financial
  FINANCIAL: '/financial',
  INVOICES: '/financial/invoices',
  INVOICE_CREATE: '/financial/invoices/new',
  INVOICE_DETAIL: '/financial/invoices/:id',
  RECEIVABLES: '/financial/receivables',

  // Reports
  REPORTS: '/reports',

  // Subscription
  SUBSCRIPTION: '/subscription',
  PLANS: '/plans',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Settings
  PROFILE: '/settings/profile',
  USERS: '/settings/users',
};
