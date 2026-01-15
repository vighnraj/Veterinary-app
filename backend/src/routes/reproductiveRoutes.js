const express = require('express');
const reproductiveController = require('../controllers/reproductiveController');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { auditAction } = require('../middlewares/audit');

const router = express.Router();

router.use(authenticate);

// Records
router.post('/heat', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveRecord'), reproductiveController.recordHeat);
router.post('/insemination', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveRecord'), reproductiveController.recordInsemination);
router.post('/pregnancy-check', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveRecord'), reproductiveController.recordPregnancyCheck);
router.post('/birth', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveRecord'), reproductiveController.recordBirth);
router.post('/abortion', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveRecord'), reproductiveController.recordAbortion);
router.post('/andrological', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveRecord'), reproductiveController.recordAndrologicalEval);

// Procedures
router.post('/procedures', requirePermission('reproductive.create'), auditAction('CREATE', 'ReproductiveProcedure'), reproductiveController.createProcedure);
router.patch('/procedures/:id/result', requirePermission('reproductive.update'), reproductiveController.updateProcedureResult);

// Animal history
router.get('/animals/:animalId/history', reproductiveController.getAnimalHistory);
router.get('/animals/:animalId/procedures', reproductiveController.getAnimalProcedures);

// Alerts and stats
router.get('/pregnant', reproductiveController.getPregnantAnimals);
router.get('/stats', reproductiveController.getStats);

module.exports = router;
