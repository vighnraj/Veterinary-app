const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Register new user and account
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, accountName, phone } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    accountName,
    phone,
  });

  return ApiResponse.created(res, result, 'Registration successful. Please verify your email.');
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({
    email,
    password,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  return ApiResponse.success(res, result, 'Login successful');
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);

  return ApiResponse.success(res, result, 'Token refreshed');
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  return ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * Verify email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const result = await authService.verifyEmail(token);

  return ApiResponse.success(res, result);
});

/**
 * Resend verification email
 */
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.resendVerification(email);

  return ApiResponse.success(res, result);
});

/**
 * Request password reset
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.forgotPassword(email);

  return ApiResponse.success(res, result);
});

/**
 * Reset password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  return ApiResponse.success(res, result);
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

  return ApiResponse.success(res, result);
});

/**
 * Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user.id);

  return ApiResponse.success(res, result);
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user.id, req.body);

  return ApiResponse.success(res, result, 'Profile updated successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
};
