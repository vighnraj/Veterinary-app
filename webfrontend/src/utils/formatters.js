import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

// Date formatters
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
};

export const formatRelativeDate = (date) => {
  if (!date) return '-';
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = target.diff(now, 'day');

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays > 0 && diffDays <= 7) return `Em ${diffDays} dias`;
  if (diffDays < 0 && diffDays >= -7) return `Há ${Math.abs(diffDays)} dias`;

  return formatDate(date);
};

// Currency formatter
export const formatCurrency = (value, currency = 'BRL') => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

// Number formatter
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Percentage formatter
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(value, decimals)}%`;
};

// Phone formatter (Brazilian)
export const formatPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Document formatter (CPF/CNPJ)
export const formatDocument = (doc) => {
  if (!doc) return '-';
  const cleaned = doc.replace(/\D/g, '');

  if (cleaned.length === 11) {
    // CPF
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 14) {
    // CNPJ
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return doc;
};

// Weight formatter
export const formatWeight = (weight, unit = 'kg') => {
  if (weight === null || weight === undefined) return '-';
  return `${formatNumber(weight, 1)} ${unit}`;
};

// Area formatter
export const formatArea = (area) => {
  if (area === null || area === undefined) return '-';
  return `${formatNumber(area, 2)} ha`;
};

// WhatsApp link generator
export const getWhatsAppLink = (phone, message = '') => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}${message ? `?text=${encodedMessage}` : ''}`;
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

// Get initials
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
