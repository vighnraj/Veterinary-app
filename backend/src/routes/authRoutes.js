const express = require('express');
const authController = require('../controllers/authController');
const authValidator = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', authValidator.register, validate, authController.register);
router.post('/login', authValidator.login, validate, authController.login);
router.post('/refresh-token', authValidator.refreshToken, validate, authController.refreshToken);
router.post('/verify-email', authValidator.verifyEmail, validate, authController.verifyEmail);
router.post('/resend-verification', authValidator.forgotPassword, validate, authController.resendVerification);
router.post('/forgot-password', authValidator.forgotPassword, validate, authController.forgotPassword);
router.post('/reset-password', authValidator.resetPassword, validate, authController.resetPassword);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.patch('/profile', authValidator.updateProfile, validate, authController.updateProfile);
router.post('/change-password', authValidator.changePassword, validate, authController.changePassword);

module.exports = router;
