const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Webhook (no auth, raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// Protected routes
router.use(authenticate);

router.get('/status', subscriptionController.getSubscriptionStatus);
router.post('/checkout', subscriptionController.createCheckoutSession);
router.post('/portal', subscriptionController.createPortalSession);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/resume', subscriptionController.resumeSubscription);

module.exports = router;
