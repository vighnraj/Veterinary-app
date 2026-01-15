const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, requireFeature } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/appointments/:id', reportController.generateAppointmentReport);
router.get('/animals/:id', reportController.generateAnimalReport);
router.get('/invoices/:id', reportController.generateInvoiceReport);
router.get('/financial', requireFeature('financial_reports'), reportController.generateFinancialReport);

module.exports = router;
