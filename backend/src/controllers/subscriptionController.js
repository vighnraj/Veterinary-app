const subscriptionService = require('../services/subscriptionService');
const config = require('../config');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const getPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.getPlans();
  return ApiResponse.success(res, plans);
});

const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const status = await subscriptionService.getSubscriptionStatus(req.accountId);
  return ApiResponse.success(res, status);
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { planId, billingPeriod } = req.body;
  const session = await subscriptionService.createCheckoutSession(
    req.accountId,
    planId,
    billingPeriod
  );
  return ApiResponse.success(res, session);
});

const createPortalSession = asyncHandler(async (req, res) => {
  const session = await subscriptionService.createPortalSession(req.accountId);
  return ApiResponse.success(res, session);
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.cancelSubscription(req.accountId);
  return ApiResponse.success(res, result);
});

const resumeSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.resumeSubscription(req.accountId);
  return ApiResponse.success(res, result);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const stripe = require('stripe')(config.stripe.secretKey);
    event = stripe.webhooks.constructEvent(req.rawBody, sig, config.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await subscriptionService.handleWebhook(event);

  return res.json({ received: true });
});

module.exports = {
  getPlans,
  getSubscriptionStatus,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  resumeSubscription,
  handleWebhook,
};
