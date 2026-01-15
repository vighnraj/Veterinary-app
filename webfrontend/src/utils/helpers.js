// Build query string from params object
export const buildQueryString = (params) => {
  if (!params) return '';

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return query ? `?${query}` : '';
};

// Get error message from API response
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length > 0) {
    return error.response.data.errors.map((e) => e.msg || e.message).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Delay function
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Generate unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Download file from URL
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const valueA = typeof key === 'function' ? key(a) : a[key];
    const valueB = typeof key === 'function' ? key(b) : b[key];

    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Calculate pagination info
export const getPaginationInfo = (pagination) => {
  if (!pagination) return null;

  const { page, limit, total, totalPages } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return {
    start,
    end,
    total,
    currentPage: page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Color helpers
export const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    sold: 'info',
    deceased: 'secondary',
    transferred: 'warning',
    scheduled: 'primary',
    confirmed: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
    draft: 'secondary',
    sent: 'primary',
    paid: 'success',
    partial: 'warning',
    overdue: 'danger',
    trialing: 'info',
    past_due: 'warning',
    canceled: 'danger',
    unpaid: 'danger',
    planned: 'secondary',
    open: 'secondary',
    pregnant: 'success',
    lactating: 'info',
    dry: 'warning',
  };

  return colors[status] || 'secondary';
};
