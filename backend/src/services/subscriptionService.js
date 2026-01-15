const Stripe = require('stripe');
const config = require('../config');
const prisma = require('../config/database');
const AppError = require('../utils/appError');

const stripe = new Stripe(config.stripe.secretKey);

class SubscriptionService {
  /**
   * Get all available plans
   */
  async getPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw AppError.notFound('Plan not found');
    }

    return plan;
  }

  /**
   * Create or get Stripe customer
   */
  async getOrCreateStripeCustomer(account) {
    if (account.stripeCustomerId) {
      return account.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: account.email,
      name: account.name,
      metadata: {
        accountId: account.id,
      },
    });

    await prisma.account.update({
      where: { id: account.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(accountId, planId, billingPeriod = 'monthly') {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw AppError.notFound('Account not found');
    }

    const plan = await this.getPlan(planId);

    // Get the correct Stripe price ID
    const priceId = billingPeriod === 'yearly' ? plan.stripePriceYearly : plan.stripePriceMonthly;

    if (!priceId) {
      throw AppError.badRequest('Price not configured for this plan');
    }

    // Get or create Stripe customer
    const customerId = await this.getOrCreateStripeCustomer(account);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${config.urls.frontend}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.urls.frontend}/subscription/cancel`,
      metadata: {
        accountId,
        planId,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          accountId,
          planId,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create customer portal session for managing subscription
   */
  async createPortalSession(accountId) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.stripeCustomerId) {
      throw AppError.badRequest('No subscription found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: `${config.urls.frontend}/subscription`,
    });

    return { url: session.url };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle checkout completion
   */
  async handleCheckoutComplete(session) {
    const { accountId, planId } = session.metadata;

    if (!accountId) return;

    await prisma.account.update({
      where: { id: accountId },
      data: {
        planId,
        subscriptionId: session.subscription,
        subscriptionStatus: 'active',
      },
    });
  }

  /**
   * Handle subscription update
   */
  async handleSubscriptionUpdate(subscription) {
    const accountId = subscription.metadata?.accountId;

    if (!accountId) {
      // Try to find by customer ID
      const account = await prisma.account.findFirst({
        where: { stripeCustomerId: subscription.customer },
      });

      if (!account) return;

      await this.updateAccountSubscription(account.id, subscription);
    } else {
      await this.updateAccountSubscription(accountId, subscription);
    }
  }

  /**
   * Update account subscription data
   */
  async updateAccountSubscription(accountId, subscription) {
    const planId = subscription.metadata?.planId;

    const updateData = {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    };

    if (planId) {
      updateData.planId = planId;
    }

    if (subscription.current_period_end) {
      updateData.subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
    }

    if (subscription.trial_end) {
      updateData.trialEndsAt = new Date(subscription.trial_end * 1000);
    }

    await prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });
  }

  /**
   * Handle subscription deletion
   */
  async handleSubscriptionDeleted(subscription) {
    const account = await prisma.account.findFirst({
      where: { subscriptionId: subscription.id },
    });

    if (!account) return;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSucceeded(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

    const account = await prisma.account.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (!account) return;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        subscriptionStatus: 'active',
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(invoice) {
    const account = await prisma.account.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (!account) return;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

    // TODO: Send email notification about failed payment
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(accountId) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.subscriptionId) {
      throw AppError.badRequest('No active subscription found');
    }

    // Cancel at period end (not immediately)
    const subscription = await stripe.subscriptions.update(account.subscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.account.update({
      where: { id: accountId },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      },
    });

    return {
      message: 'Subscription will be canceled at the end of the billing period',
      endsAt: new Date(subscription.current_period_end * 1000),
    };
  }

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(accountId) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.subscriptionId) {
      throw AppError.badRequest('No subscription found');
    }

    const subscription = await stripe.subscriptions.update(account.subscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.account.update({
      where: { id: accountId },
      data: {
        subscriptionStatus: subscription.status,
      },
    });

    return { message: 'Subscription resumed successfully' };
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(accountId) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { plan: true },
    });

    if (!account) {
      throw AppError.notFound('Account not found');
    }

    return {
      status: account.subscriptionStatus,
      plan: account.plan,
      trialEndsAt: account.trialEndsAt,
      subscriptionEndsAt: account.subscriptionEndsAt,
      isTrialing: account.subscriptionStatus === 'trialing',
      isActive: ['active', 'trialing'].includes(account.subscriptionStatus),
      daysRemaining: this.calculateDaysRemaining(account),
    };
  }

  /**
   * Calculate days remaining in trial or subscription
   */
  calculateDaysRemaining(account) {
    const endDate = account.subscriptionStatus === 'trialing'
      ? account.trialEndsAt
      : account.subscriptionEndsAt;

    if (!endDate) return null;

    const now = new Date();
    const diff = endDate - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Check and update expired trials
   */
  async checkExpiredTrials() {
    const expiredAccounts = await prisma.account.findMany({
      where: {
        subscriptionStatus: 'trialing',
        trialEndsAt: { lt: new Date() },
      },
    });

    for (const account of expiredAccounts) {
      await prisma.account.update({
        where: { id: account.id },
        data: { subscriptionStatus: 'unpaid' },
      });

      // TODO: Send trial expired email
    }

    return { updated: expiredAccounts.length };
  }
}

module.exports = new SubscriptionService();
