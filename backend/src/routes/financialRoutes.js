const express = require('express');
const financialController = require('../controllers/financialController');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { auditAction } = require('../middlewares/audit');

const router = express.Router();

router.use(authenticate);

// Stats and summaries
router.get('/stats', financialController.getFinancialStats);
router.get('/receivables', financialController.getReceivables);
router.get('/revenue-by-category', financialController.getRevenueByCategory);
router.get('/overdue', financialController.getOverdueInvoices);

// Invoices
router.route('/invoices')
  .get(financialController.getInvoices)
  .post(requirePermission('invoices.create'), auditAction('CREATE', 'Invoice'), financialController.createInvoice);

router.route('/invoices/:id')
  .get(financialController.getInvoice)
  .patch(requirePermission('invoices.update'), auditAction('UPDATE', 'Invoice'), financialController.updateInvoice);

router.patch('/invoices/:id/status', requirePermission('invoices.update'), financialController.updateInvoiceStatus);
router.post('/invoices/:id/payments', requirePermission('payments.create'), auditAction('CREATE', 'Payment'), financialController.recordPayment);
router.get('/invoices/:id/pdf', financialController.generateInvoicePDF);

module.exports = router;
