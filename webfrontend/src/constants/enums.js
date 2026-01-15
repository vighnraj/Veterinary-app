export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
};

export const ANIMAL_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  DECEASED: 'deceased',
  TRANSFERRED: 'transferred',
};

export const ANIMAL_SEX = {
  MALE: 'male',
  FEMALE: 'female',
};

export const REPRODUCTIVE_STATUS = {
  OPEN: 'open',
  PREGNANT: 'pregnant',
  LACTATING: 'lactating',
  DRY: 'dry',
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  PIX: 'pix',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
};

export const SUBSCRIPTION_STATUS = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
};

export const SERVICE_CATEGORIES = {
  REPRODUCTIVE: 'reproductive',
  SANITARY: 'sanitary',
  CLINICAL: 'clinical',
  SURGICAL: 'surgical',
  CONSULTING: 'consulting',
};

export const HEALTH_RECORD_TYPES = {
  TREATMENT: 'treatment',
  DEWORMING: 'deworming',
  EXAMINATION: 'examination',
  SURGERY: 'surgery',
};

export const CAMPAIGN_STATUS = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const REPRODUCTIVE_RECORD_TYPES = {
  HEAT: 'heat',
  INSEMINATION: 'insemination',
  PREGNANCY_CHECK: 'pregnancy_check',
  BIRTH: 'birth',
  ABORTION: 'abortion',
  ANDROLOGICAL: 'andrological',
};

export const PROCEDURE_TYPES = {
  AI: 'AI',
  FTAI: 'FTAI',
  ET: 'ET',
  EMBRYO_COLLECTION: 'embryo_collection',
  PREGNANCY_DIAGNOSIS: 'pregnancy_diagnosis',
  NATURAL_BREEDING: 'natural_breeding',
};

export const STATUS_COLORS = {
  // Animal status
  active: 'success',
  sold: 'info',
  deceased: 'secondary',
  transferred: 'warning',

  // Appointment status
  scheduled: 'primary',
  confirmed: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',

  // Invoice status
  draft: 'secondary',
  sent: 'primary',
  paid: 'success',
  partial: 'warning',
  overdue: 'danger',

  // Subscription status
  trialing: 'info',
  past_due: 'warning',
  canceled: 'danger',
  unpaid: 'danger',

  // Campaign status
  planned: 'secondary',

  // Reproductive status
  open: 'secondary',
  pregnant: 'success',
  lactating: 'info',
  dry: 'warning',
};

export const STATUS_LABELS = {
  // Animal status
  active: 'Ativo',
  sold: 'Vendido',
  deceased: 'Falecido',
  transferred: 'Transferido',

  // Appointment status
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',

  // Invoice status
  draft: 'Rascunho',
  sent: 'Enviada',
  paid: 'Paga',
  partial: 'Parcial',
  overdue: 'Vencida',

  // Subscription status
  trialing: 'Período de Teste',
  past_due: 'Pagamento Atrasado',
  canceled: 'Cancelada',
  unpaid: 'Não Paga',

  // Reproductive status
  open: 'Aberta',
  pregnant: 'Prenhe',
  lactating: 'Lactante',
  dry: 'Seca',

  // Sex
  male: 'Macho',
  female: 'Fêmea',
};
