const financialService = require('../services/financialService');
const reportService = require('../services/reportService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await financialService.createInvoice(req.accountId, req.user.id, req.body);
  return ApiResponse.created(res, invoice, 'Invoice created successfully');
});

const getInvoices = asyncHandler(async (req, res) => {
  const result = await financialService.findAll(req.accountId, req.query);
  return ApiResponse.paginated(res, result.invoices, result.pagination);
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await financialService.findById(req.accountId, req.params.id);
  return ApiResponse.success(res, invoice);
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await financialService.update(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, invoice, 'Invoice updated successfully');
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await financialService.updateStatus(req.accountId, req.params.id, req.body.status);
  return ApiResponse.success(res, invoice, 'Invoice status updated');
});

const recordPayment = asyncHandler(async (req, res) => {
  const invoice = await financialService.recordPayment(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, invoice, 'Payment recorded successfully');
});

const getOverdueInvoices = asyncHandler(async (req, res) => {
  const result = await financialService.getOverdue(req.accountId, req.query);
  return ApiResponse.paginated(res, result.invoices, result.pagination);
});

const getReceivables = asyncHandler(async (req, res) => {
  const receivables = await financialService.getReceivables(req.accountId);
  return ApiResponse.success(res, receivables);
});

const getFinancialStats = asyncHandler(async (req, res) => {
  const stats = await financialService.getStats(req.accountId, req.query);
  return ApiResponse.success(res, stats);
});

const getRevenueByCategory = asyncHandler(async (req, res) => {
  const revenue = await financialService.getRevenueByCategory(req.accountId, req.query);
  return ApiResponse.success(res, revenue);
});

const generateInvoicePDF = asyncHandler(async (req, res) => {
  const result = await reportService.generateInvoicePDF(req.accountId, req.params.id);
  return ApiResponse.success(res, result, 'Invoice PDF generated');
});

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  updateInvoiceStatus,
  recordPayment,
  getOverdueInvoices,
  getReceivables,
  getFinancialStats,
  getRevenueByCategory,
  generateInvoicePDF,
};
