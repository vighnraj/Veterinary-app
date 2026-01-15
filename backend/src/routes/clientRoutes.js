const express = require('express');
const clientController = require('../controllers/clientController');
const clientValidator = require('../validators/clientValidator');
const validate = require('../middlewares/validate');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { auditAction } = require('../middlewares/audit');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Client routes
router
  .route('/')
  .get(clientValidator.listClients, validate, clientController.getClients)
  .post(
    requirePermission('clients.create'),
    clientValidator.createClient,
    validate,
    auditAction('CREATE', 'Client'),
    clientController.createClient
  );

router
  .route('/:id')
  .get(clientValidator.getClient, validate, clientController.getClient)
  .patch(
    requirePermission('clients.update'),
    clientValidator.updateClient,
    validate,
    auditAction('UPDATE', 'Client'),
    clientController.updateClient
  )
  .delete(
    requirePermission('clients.delete'),
    clientValidator.getClient,
    validate,
    auditAction('DELETE', 'Client'),
    clientController.deleteClient
  );

// Client financial and history
router.get('/:id/financial', clientValidator.getClient, validate, clientController.getFinancialSummary);
router.get('/:id/history', clientValidator.getClient, validate, clientController.getServiceHistory);

// Property routes
router
  .route('/:clientId/properties')
  .get(clientController.getProperties)
  .post(
    requirePermission('clients.update'),
    clientValidator.createProperty,
    validate,
    auditAction('CREATE', 'Property'),
    clientController.createProperty
  );

router
  .route('/:clientId/properties/:propertyId')
  .patch(
    requirePermission('clients.update'),
    clientValidator.updateProperty,
    validate,
    auditAction('UPDATE', 'Property'),
    clientController.updateProperty
  )
  .delete(
    requirePermission('clients.delete'),
    auditAction('DELETE', 'Property'),
    clientController.deleteProperty
  );

module.exports = router;
