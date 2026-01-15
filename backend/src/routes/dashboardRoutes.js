const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/overview', dashboardController.getOverview);
router.get('/today', dashboardController.getTodayAppointments);
router.get('/alerts', dashboardController.getAlerts);
router.get('/stats', dashboardController.getStats);

module.exports = router;
