const { body, param, query } = require('express-validator');

const createAnimal = [
  body('clientId')
    .isUUID()
    .withMessage('Valid client ID is required'),

  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Identifier is required')
    .isLength({ max: 50 })
    .withMessage('Identifier cannot exceed 50 characters'),

  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Registration number cannot exceed 50 characters'),

  body('speciesId')
    .isUUID()
    .withMessage('Valid species ID is required'),

  body('breedId')
    .optional()
    .isUUID()
    .withMessage('Invalid breed ID'),

  body('crossBreed')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cross breed cannot exceed 100 characters'),

  body('sex')
    .isIn(['male', 'female'])
    .withMessage('Sex must be male or female'),

  body('coatColor')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Coat color cannot exceed 50 characters'),

  body('markings')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Markings cannot exceed 500 characters'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('estimatedAge')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Estimated age cannot exceed 50 characters'),

  body('birthWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Birth weight must be a positive number'),

  body('currentWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current weight must be a positive number'),

  body('propertyId')
    .optional()
    .isUUID()
    .withMessage('Invalid property ID'),

  body('batchId')
    .optional()
    .isUUID()
    .withMessage('Invalid batch ID'),

  body('sireId')
    .optional()
    .isUUID()
    .withMessage('Invalid sire ID'),

  body('damId')
    .optional()
    .isUUID()
    .withMessage('Invalid dam ID'),

  body('reproductiveStatus')
    .optional()
    .isIn(['open', 'pregnant', 'lactating', 'dry'])
    .withMessage('Invalid reproductive status'),

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

const updateAnimal = [
  param('id')
    .isUUID()
    .withMessage('Invalid animal ID'),

  ...createAnimal.map((validation) => validation.optional()),
];

const getAnimal = [
  param('id')
    .isUUID()
    .withMessage('Invalid animal ID'),
];

const listAnimals = [
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

  query('clientId')
    .optional()
    .isUUID()
    .withMessage('Invalid client ID'),

  query('propertyId')
    .optional()
    .isUUID()
    .withMessage('Invalid property ID'),

  query('batchId')
    .optional()
    .isUUID()
    .withMessage('Invalid batch ID'),

  query('speciesId')
    .optional()
    .isUUID()
    .withMessage('Invalid species ID'),

  query('breedId')
    .optional()
    .isUUID()
    .withMessage('Invalid breed ID'),

  query('sex')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Sex must be male or female'),

  query('status')
    .optional()
    .isIn(['active', 'sold', 'deceased', 'transferred'])
    .withMessage('Invalid status'),

  query('reproductiveStatus')
    .optional()
    .isIn(['open', 'pregnant', 'lactating', 'dry'])
    .withMessage('Invalid reproductive status'),
];

const updateStatus = [
  param('id')
    .isUUID()
    .withMessage('Invalid animal ID'),

  body('status')
    .isIn(['active', 'sold', 'deceased', 'transferred'])
    .withMessage('Invalid status'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

const recordWeight = [
  param('id')
    .isUUID()
    .withMessage('Invalid animal ID'),

  body('weight')
    .isFloat({ min: 0.1 })
    .withMessage('Weight must be a positive number'),

  body('unit')
    .optional()
    .isIn(['kg', 'lb'])
    .withMessage('Unit must be kg or lb'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('bodyConditionScore')
    .optional()
    .isFloat({ min: 1, max: 9 })
    .withMessage('Body condition score must be between 1 and 9'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const createBatch = [
  body('clientId')
    .isUUID()
    .withMessage('Valid client ID is required'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Batch name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('propertyId')
    .optional()
    .isUUID()
    .withMessage('Invalid property ID'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
];

const batchAnimals = [
  param('batchId')
    .isUUID()
    .withMessage('Invalid batch ID'),

  body('animalIds')
    .isArray({ min: 1 })
    .withMessage('At least one animal ID is required'),

  body('animalIds.*')
    .isUUID()
    .withMessage('Invalid animal ID'),
];

module.exports = {
  createAnimal,
  updateAnimal,
  getAnimal,
  listAnimals,
  updateStatus,
  recordWeight,
  createBatch,
  batchAnimals,
};
