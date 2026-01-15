const { body } = require('express-validator');

const register = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('accountName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Account name cannot exceed 100 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]+$/)
    .withMessage('Please provide a valid phone number'),
];

const login = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const refreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const verifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
];

const forgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

const resetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const changePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const updateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-+()]+$/)
    .withMessage('Please provide a valid phone number'),
];

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
};
