const { body, param, query } = require('express-validator');

const createClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('whatsapp')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]+$/)
    .withMessage('Please provide a valid WhatsApp number'),

  body('document')
    .optional()
    .trim()
    .matches(/^[\d.\-/]+$/)
    .withMessage('Please provide a valid document number'),

  body('documentType')
    .optional()
    .isIn(['CPF', 'CNPJ'])
    .withMessage('Document type must be CPF or CNPJ'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('zipCode')
    .optional()
    .trim()
    .matches(/^[\d\-]+$/)
    .withMessage('Please provide a valid zip code'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const updateClient = [
  param('id')
    .isUUID()
    .withMessage('Invalid client ID'),

  ...createClient.map((validation) => validation.optional()),
];

const getClient = [
  param('id')
    .isUUID()
    .withMessage('Invalid client ID'),
];

const listClients = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),

  query('city')
    .optional()
    .trim(),

  query('state')
    .optional()
    .trim(),

  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),

  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'city', 'state'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const createProperty = [
  param('clientId')
    .isUUID()
    .withMessage('Invalid client ID'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Property name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('zipCode')
    .optional()
    .trim(),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('totalAreaHectares')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total area must be a positive number'),

  body('pastureAreaHectares')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Pasture area must be a positive number'),
];

const updateProperty = [
  param('clientId')
    .isUUID()
    .withMessage('Invalid client ID'),

  param('propertyId')
    .isUUID()
    .withMessage('Invalid property ID'),

  ...createProperty.slice(1).map((validation) => validation.optional()),
];

module.exports = {
  createClient,
  updateClient,
  getClient,
  listClients,
  createProperty,
  updateProperty,
};
