const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate UUID
 */
const generateUUID = () => {
  return uuidv4();
};

/**
 * Parse pagination parameters
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Parse sort parameters
 */
const parseSort = (query, allowedFields = []) => {
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return { [allowedFields[0]]: sortOrder };
  }

  return { [sortBy]: sortOrder };
};

/**
 * Build Prisma where clause from filters
 */
const buildWhereClause = (filters, searchFields = []) => {
  const where = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    // Handle search
    if (key === 'search' && searchFields.length > 0) {
      where.OR = searchFields.map((field) => ({
        [field]: { contains: value },
      }));
      return;
    }

    // Handle date ranges
    if (key.endsWith('From')) {
      const field = key.replace('From', '');
      where[field] = { ...where[field], gte: new Date(value) };
      return;
    }
    if (key.endsWith('To')) {
      const field = key.replace('To', '');
      where[field] = { ...where[field], lte: new Date(value) };
      return;
    }

    // Handle arrays (IN clause)
    if (Array.isArray(value)) {
      where[key] = { in: value };
      return;
    }

    // Handle booleans
    if (value === 'true' || value === 'false') {
      where[key] = value === 'true';
      return;
    }

    // Default: exact match
    where[key] = value;
  });

  return where;
};

/**
 * Calculate days between two dates
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
};

/**
 * Add days to a date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'BRL', locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

/**
 * Get file extension
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if value is empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Omit keys from object
 */
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Pick keys from object
 */
const pick = (obj, keys) => {
  const result = {};
  keys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Generate invoice number
 */
const generateInvoiceNumber = (prefix = 'INV', sequence) => {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(6, '0');
  return `${prefix}-${year}-${paddedSequence}`;
};

/**
 * Mask sensitive data
 */
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 2);
  return `${maskedName}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{2})(\d+)(\d{2})/, '$1****$3');
};

const maskDocument = (document) => {
  if (!document) return '';
  return document.replace(/(\d{3})(\d+)(\d{2})/, '$1.***.***-$3');
};

module.exports = {
  generateToken,
  generateUUID,
  parsePagination,
  parseSort,
  buildWhereClause,
  daysBetween,
  addDays,
  formatCurrency,
  sanitizeFilename,
  getFileExtension,
  isEmpty,
  deepClone,
  omit,
  pick,
  generateInvoiceNumber,
  maskEmail,
  maskPhone,
  maskDocument,
};
