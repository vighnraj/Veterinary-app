import * as yup from 'yup';

// Common validation messages
const messages = {
  required: 'Campo obrigatório',
  email: 'Email inválido',
  minLength: (min) => `Mínimo de ${min} caracteres`,
  maxLength: (max) => `Máximo de ${max} caracteres`,
  min: (min) => `Valor mínimo: ${min}`,
  max: (max) => `Valor máximo: ${max}`,
  phone: 'Telefone inválido',
  document: 'Documento inválido',
  password: 'Senha deve ter pelo menos 6 caracteres',
  passwordMatch: 'As senhas não conferem',
  date: 'Data inválida',
  number: 'Deve ser um número',
  positive: 'Deve ser um valor positivo',
};

// Login schema
export const loginSchema = yup.object({
  email: yup.string().email(messages.email).required(messages.required),
  password: yup.string().required(messages.required),
});

// Register schema
export const registerSchema = yup.object({
  firstName: yup.string().required(messages.required).max(50, messages.maxLength(50)),
  lastName: yup.string().required(messages.required).max(50, messages.maxLength(50)),
  email: yup.string().email(messages.email).required(messages.required),
  password: yup.string().required(messages.required).min(6, messages.password),
  confirmPassword: yup
    .string()
    .required(messages.required)
    .oneOf([yup.ref('password')], messages.passwordMatch),
  accountName: yup.string().required(messages.required).max(100, messages.maxLength(100)),
});

// Forgot password schema
export const forgotPasswordSchema = yup.object({
  email: yup.string().email(messages.email).required(messages.required),
});

// Reset password schema
export const resetPasswordSchema = yup.object({
  password: yup.string().required(messages.required).min(6, messages.password),
  confirmPassword: yup
    .string()
    .required(messages.required)
    .oneOf([yup.ref('password')], messages.passwordMatch),
});

// Change password schema
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required(messages.required),
  newPassword: yup.string().required(messages.required).min(6, messages.password),
  confirmPassword: yup
    .string()
    .required(messages.required)
    .oneOf([yup.ref('newPassword')], messages.passwordMatch),
});

// Profile schema
export const profileSchema = yup.object({
  firstName: yup.string().required(messages.required).max(50, messages.maxLength(50)),
  lastName: yup.string().required(messages.required).max(50, messages.maxLength(50)),
  phone: yup.string().max(20, messages.maxLength(20)),
});

// Client schema
export const clientSchema = yup.object({
  name: yup.string().required(messages.required).max(200, messages.maxLength(200)),
  email: yup.string().email(messages.email),
  phone: yup.string().max(20, messages.maxLength(20)),
  whatsapp: yup.string().max(20, messages.maxLength(20)),
  document: yup.string().max(20, messages.maxLength(20)),
  documentType: yup.string().oneOf(['cpf', 'cnpj', 'other']),
  address: yup.string().max(300, messages.maxLength(300)),
  city: yup.string().max(100, messages.maxLength(100)),
  state: yup.string().max(50, messages.maxLength(50)),
  zipCode: yup.string().max(20, messages.maxLength(20)),
  notes: yup.string().max(1000, messages.maxLength(1000)),
});

// Property schema
export const propertySchema = yup.object({
  name: yup.string().required(messages.required).max(200, messages.maxLength(200)),
  description: yup.string().max(500, messages.maxLength(500)),
  address: yup.string().max(300, messages.maxLength(300)),
  city: yup.string().max(100, messages.maxLength(100)),
  state: yup.string().max(50, messages.maxLength(50)),
  zipCode: yup.string().max(20, messages.maxLength(20)),
  totalAreaHectares: yup.number().nullable().min(0, messages.min(0)),
  pastureAreaHectares: yup.number().nullable().min(0, messages.min(0)),
});

// Animal schema
export const animalSchema = yup.object({
  identifier: yup.string().required(messages.required).max(100, messages.maxLength(100)),
  name: yup.string().max(100, messages.maxLength(100)),
  speciesId: yup.string().required(messages.required),
  breedId: yup.string(),
  sex: yup.string().required(messages.required).oneOf(['male', 'female']),
  clientId: yup.string().required(messages.required),
  propertyId: yup.string(),
  dateOfBirth: yup.date().nullable(),
  coatColor: yup.string().max(50, messages.maxLength(50)),
  currentWeight: yup.number().nullable().min(0, messages.min(0)),
  notes: yup.string().max(1000, messages.maxLength(1000)),
});

// Batch schema
export const batchSchema = yup.object({
  name: yup.string().required(messages.required).max(100, messages.maxLength(100)),
  description: yup.string().max(500, messages.maxLength(500)),
  clientId: yup.string().required(messages.required),
  propertyId: yup.string(),
  speciesId: yup.string(),
});

// Appointment schema
export const appointmentSchema = yup.object({
  clientId: yup.string().required(messages.required),
  scheduledDate: yup.date().required(messages.required),
  scheduledEndDate: yup.date().nullable(),
  locationType: yup.string().oneOf(['property', 'clinic', 'other']),
  locationNotes: yup.string().max(500, messages.maxLength(500)),
  notes: yup.string().max(1000, messages.maxLength(1000)),
});

// Invoice schema
export const invoiceSchema = yup.object({
  clientId: yup.string().required(messages.required),
  issueDate: yup.date().required(messages.required),
  dueDate: yup.date().required(messages.required),
  notes: yup.string().max(1000, messages.maxLength(1000)),
});

// Payment schema
export const paymentSchema = yup.object({
  amount: yup.number().required(messages.required).positive(messages.positive),
  paymentDate: yup.date().required(messages.required),
  paymentMethod: yup
    .string()
    .required(messages.required)
    .oneOf(['cash', 'card', 'pix', 'bank_transfer', 'check']),
  reference: yup.string().max(100, messages.maxLength(100)),
  notes: yup.string().max(500, messages.maxLength(500)),
});

// Vaccination schema
export const vaccinationApplySchema = yup.object({
  animalId: yup.string().required(messages.required),
  vaccinationId: yup.string().required(messages.required),
  applicationDate: yup.date().required(messages.required),
  doseNumber: yup.number().min(1, messages.min(1)),
  batchNumber: yup.string().max(50, messages.maxLength(50)),
});

// Health record schema
export const healthRecordSchema = yup.object({
  animalId: yup.string().required(messages.required),
  type: yup.string().required(messages.required).oneOf(['treatment', 'deworming', 'examination', 'surgery']),
  diagnosis: yup.string().max(500, messages.maxLength(500)),
  treatment: yup.string().max(500, messages.maxLength(500)),
  notes: yup.string().max(1000, messages.maxLength(1000)),
});

// Reproductive record schemas
export const heatRecordSchema = yup.object({
  animalId: yup.string().required(messages.required),
  detectionDate: yup.date().required(messages.required),
  intensity: yup.string().oneOf(['weak', 'moderate', 'strong']),
  notes: yup.string().max(500, messages.maxLength(500)),
});

export const inseminationSchema = yup.object({
  animalId: yup.string().required(messages.required),
  inseminationDate: yup.date().required(messages.required),
  semenBatch: yup.string().max(100, messages.maxLength(100)),
  bullId: yup.string().max(100, messages.maxLength(100)),
  technician: yup.string().max(100, messages.maxLength(100)),
  notes: yup.string().max(500, messages.maxLength(500)),
});

export const pregnancyCheckSchema = yup.object({
  animalId: yup.string().required(messages.required),
  checkDate: yup.date().required(messages.required),
  result: yup.string().required(messages.required).oneOf(['positive', 'negative', 'inconclusive']),
  estimatedDueDate: yup.date().nullable(),
  notes: yup.string().max(500, messages.maxLength(500)),
});

export const birthRecordSchema = yup.object({
  animalId: yup.string().required(messages.required),
  birthDate: yup.date().required(messages.required),
  numberOfOffspring: yup.number().required(messages.required).min(1, messages.min(1)),
  birthType: yup.string().oneOf(['normal', 'cesarean', 'assisted']),
  notes: yup.string().max(500, messages.maxLength(500)),
});

export default {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileSchema,
  clientSchema,
  propertySchema,
  animalSchema,
  batchSchema,
  appointmentSchema,
  invoiceSchema,
  paymentSchema,
  vaccinationApplySchema,
  healthRecordSchema,
  heatRecordSchema,
  inseminationSchema,
  pregnancyCheckSchema,
  birthRecordSchema,
};
