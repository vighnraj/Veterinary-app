const express = require('express');

const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const animalRoutes = require('./animalRoutes');
const reproductiveRoutes = require('./reproductiveRoutes');
const sanitaryRoutes = require('./sanitaryRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const financialRoutes = require('./financialRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const nfeRoutes = require('./nfe');
const batchRoutes = require('./batchRoutes');
const serviceRoutes = require('./serviceRoutes');
const teamRoutes = require('./teamRoutes');
const profileRoutes = require('./profileRoutes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/animals', animalRoutes);
router.use('/reproductive', reproductiveRoutes);
router.use('/sanitary', sanitaryRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/financial', financialRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/nfe', nfeRoutes);
router.use('/batches', batchRoutes);
router.use('/services', serviceRoutes);
router.use('/team', teamRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
