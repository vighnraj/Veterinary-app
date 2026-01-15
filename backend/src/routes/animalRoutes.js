const express = require('express');
const animalController = require('../controllers/animalController');
const animalValidator = require('../validators/animalValidator');
const validate = require('../middlewares/validate');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { auditAction } = require('../middlewares/audit');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Species and Breeds (reference data)
router.get('/species', animalController.getSpecies);
router.get('/species/:speciesId/breeds', animalController.getBreedsBySpecies);

// Batch routes
router
  .route('/batches')
  .get(animalController.getBatches)
  .post(
    requirePermission('animals.create'),
    animalValidator.createBatch,
    validate,
    auditAction('CREATE', 'Batch'),
    animalController.createBatch
  );

router
  .route('/batches/:id')
  .get(animalController.getBatch)
  .patch(
    requirePermission('animals.update'),
    auditAction('UPDATE', 'Batch'),
    animalController.updateBatch
  )
  .delete(
    requirePermission('animals.delete'),
    auditAction('DELETE', 'Batch'),
    animalController.deleteBatch
  );

router.post(
  '/batches/:batchId/add-animals',
  requirePermission('animals.update'),
  animalValidator.batchAnimals,
  validate,
  animalController.addAnimalsToBatch
);

router.post(
  '/batches/:batchId/remove-animals',
  requirePermission('animals.update'),
  animalValidator.batchAnimals,
  validate,
  animalController.removeAnimalsFromBatch
);

// Animal routes
router
  .route('/')
  .get(animalValidator.listAnimals, validate, animalController.getAnimals)
  .post(
    requirePermission('animals.create'),
    animalValidator.createAnimal,
    validate,
    auditAction('CREATE', 'Animal'),
    animalController.createAnimal
  );

router
  .route('/:id')
  .get(animalValidator.getAnimal, validate, animalController.getAnimal)
  .patch(
    requirePermission('animals.update'),
    animalValidator.updateAnimal,
    validate,
    auditAction('UPDATE', 'Animal'),
    animalController.updateAnimal
  )
  .delete(
    requirePermission('animals.delete'),
    animalValidator.getAnimal,
    validate,
    auditAction('DELETE', 'Animal'),
    animalController.deleteAnimal
  );

// Animal specific actions
router.patch(
  '/:id/status',
  requirePermission('animals.update'),
  animalValidator.updateStatus,
  validate,
  auditAction('UPDATE', 'Animal'),
  animalController.updateAnimalStatus
);

router
  .route('/:id/weight')
  .get(animalValidator.getAnimal, validate, animalController.getWeightHistory)
  .post(
    requirePermission('animals.update'),
    animalValidator.recordWeight,
    validate,
    animalController.recordWeight
  );

router.get('/:id/genealogy', animalValidator.getAnimal, validate, animalController.getGenealogy);

module.exports = router;
