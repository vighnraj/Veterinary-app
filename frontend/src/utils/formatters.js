import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date) {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Format date to DD/MM/YYYY HH:mm
 */
export function formatDateTime(date) {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

/**
 * Format currency (BRL)
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format number with decimal places
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format phone number
 */
export function formatPhone(phone) {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Format document (CPF/CNPJ)
 */
export function formatDocument(doc) {
  if (!doc) return '-';
  const cleaned = doc.replace(/\D/g, '');
  if (cleaned.length === 11) {
    // CPF
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  } else if (cleaned.length === 14) {
    // CNPJ
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return doc;
}

/**
 * Format weight with unit
 */
export function formatWeight(weight, unit = 'kg') {
  if (weight === null || weight === undefined) return '-';
  return `${formatNumber(weight, 1)} ${unit}`;
}

/**
 * Get WhatsApp link
 */
export function getWhatsAppLink(phone, message = '') {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  const baseUrl = `https://wa.me/55${cleaned}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

/**
 * Calculate age from date
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = dayjs(birthDate);
  const now = dayjs();
  const years = now.diff(birth, 'year');
  const months = now.diff(birth, 'month') % 12;

  if (years === 0) {
    return `${months} meses`;
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

/**
 * Format relative time
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  return dayjs(date).fromNow();
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
