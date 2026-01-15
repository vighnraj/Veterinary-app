const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user.id, req.query);
  return ApiResponse.success(res, {
    notifications: result.notifications,
    unreadCount: result.unreadCount,
    pagination: result.pagination,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.id);
  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found');
  }
  return ApiResponse.success(res, notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return ApiResponse.success(res, result);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.delete(req.user.id, req.params.id);
  return ApiResponse.success(res, result);
});

const registerPushToken = asyncHandler(async (req, res) => {
  const { token, platform, deviceName } = req.body;
  const result = await notificationService.registerPushToken(
    req.user.id,
    token,
    platform,
    deviceName
  );
  return ApiResponse.success(res, result, 'Push token registered');
});

const removePushToken = asyncHandler(async (req, res) => {
  const result = await notificationService.removePushToken(req.body.token);
  return ApiResponse.success(res, result);
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
  removePushToken,
};
