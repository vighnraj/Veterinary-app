const reportService = require('../services/reportService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const generateAppointmentReport = asyncHandler(async (req, res) => {
  const result = await reportService.generateAppointmentReport(req.accountId, req.params.id);
  return ApiResponse.success(res, result, 'Report generated successfully');
});

const generateAnimalReport = asyncHandler(async (req, res) => {
  const result = await reportService.generateAnimalReport(req.accountId, req.params.id);
  return ApiResponse.success(res, result, 'Report generated successfully');
});

const generateInvoiceReport = asyncHandler(async (req, res) => {
  const result = await reportService.generateInvoicePDF(req.accountId, req.params.id);
  return ApiResponse.success(res, result, 'Invoice PDF generated');
});

const generateFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await reportService.generateFinancialReport(req.accountId, startDate, endDate);
  return ApiResponse.success(res, result, 'Financial report generated');
});

module.exports = {
  generateAppointmentReport,
  generateAnimalReport,
  generateInvoiceReport,
  generateFinancialReport,
};
