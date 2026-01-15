const express = require('express');
const sanitaryController = require('../controllers/sanitaryController');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { auditAction } = require('../middlewares/audit');

const router = express.Router();

router.use(authenticate);

// Vaccination types
router.route('/vaccinations')
  .get(sanitaryController.getVaccinations)
  .post(requirePermission('sanitary.create'), auditAction('CREATE', 'Vaccination'), sanitaryController.createVaccination);

// Apply vaccinations
router.post('/vaccinations/apply', requirePermission('sanitary.create'), auditAction('CREATE', 'AnimalVaccination'), sanitaryController.applyVaccination);
router.post('/vaccinations/apply-batch', requirePermission('sanitary.create'), sanitaryController.applyBatchVaccination);

// Animal vaccinations
router.get('/animals/:animalId/vaccinations', sanitaryController.getAnimalVaccinations);

// Vaccination alerts
router.get('/alerts/vaccinations', sanitaryController.getVaccinationAlerts);

// Health records
router.post('/health-records', requirePermission('sanitary.create'), auditAction('CREATE', 'HealthRecord'), sanitaryController.createHealthRecord);
router.get('/animals/:animalId/health-records', sanitaryController.getAnimalHealthRecords);

// Campaigns
router.route('/campaigns')
  .get(sanitaryController.getCampaigns)
  .post(requirePermission('sanitary.create'), auditAction('CREATE', 'SanitaryCampaign'), sanitaryController.createCampaign);

router.route('/campaigns/:id')
  .get(sanitaryController.getCampaign);

router.patch('/campaigns/:id/status', requirePermission('sanitary.update'), sanitaryController.updateCampaignStatus);

// Stats
router.get('/stats', sanitaryController.getStats);

module.exports = router;
