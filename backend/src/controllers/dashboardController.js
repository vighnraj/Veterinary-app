const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const getOverview = asyncHandler(async (req, res) => {
  const overview = await dashboardService.getOverview(req.accountId);
  return ApiResponse.success(res, overview);
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const appointments = await dashboardService.getTodayAppointments(req.accountId);
  return ApiResponse.success(res, appointments);
});

const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await dashboardService.getAlerts(req.accountId);
  return ApiResponse.success(res, alerts);
});

const getStats = asyncHandler(async (req, res) => {
  const period = parseInt(req.query.period, 10) || 30;
  const stats = await dashboardService.getStats(req.accountId, period);
  return ApiResponse.success(res, stats);
});

module.exports = {
  getOverview,
  getTodayAppointments,
  getAlerts,
  getStats,
};
