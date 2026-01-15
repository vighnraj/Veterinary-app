const clientService = require('../services/clientService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Create a new client
 */
const createClient = asyncHandler(async (req, res) => {
  const client = await clientService.create(req.accountId, req.body);
  return ApiResponse.created(res, client, 'Client created successfully');
});

/**
 * Get all clients
 */
const getClients = asyncHandler(async (req, res) => {
  const result = await clientService.findAll(req.accountId, req.query);
  return ApiResponse.paginated(res, result.clients, result.pagination);
});

/**
 * Get client by ID
 */
const getClient = asyncHandler(async (req, res) => {
  const client = await clientService.findById(req.accountId, req.params.id);
  return ApiResponse.success(res, client);
});

/**
 * Update client
 */
const updateClient = asyncHandler(async (req, res) => {
  const client = await clientService.update(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, client, 'Client updated successfully');
});

/**
 * Delete client
 */
const deleteClient = asyncHandler(async (req, res) => {
  const result = await clientService.delete(req.accountId, req.params.id);
  return ApiResponse.success(res, result);
});

/**
 * Get client financial summary
 */
const getFinancialSummary = asyncHandler(async (req, res) => {
  const summary = await clientService.getFinancialSummary(req.accountId, req.params.id);
  return ApiResponse.success(res, summary);
});

/**
 * Get client service history
 */
const getServiceHistory = asyncHandler(async (req, res) => {
  const result = await clientService.getServiceHistory(req.accountId, req.params.id, req.query);
  return ApiResponse.paginated(res, result.appointments, result.pagination);
});

// ==================== PROPERTY CONTROLLERS ====================

/**
 * Create property for client
 */
const createProperty = asyncHandler(async (req, res) => {
  const property = await clientService.createProperty(
    req.accountId,
    req.params.clientId,
    req.body
  );
  return ApiResponse.created(res, property, 'Property created successfully');
});

/**
 * Get all properties for a client
 */
const getProperties = asyncHandler(async (req, res) => {
  const properties = await clientService.findProperties(req.accountId, req.params.clientId);
  return ApiResponse.success(res, properties);
});

/**
 * Update property
 */
const updateProperty = asyncHandler(async (req, res) => {
  const property = await clientService.updateProperty(
    req.accountId,
    req.params.clientId,
    req.params.propertyId,
    req.body
  );
  return ApiResponse.success(res, property, 'Property updated successfully');
});

/**
 * Delete property
 */
const deleteProperty = asyncHandler(async (req, res) => {
  const result = await clientService.deleteProperty(
    req.accountId,
    req.params.clientId,
    req.params.propertyId
  );
  return ApiResponse.success(res, result);
});

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getFinancialSummary,
  getServiceHistory,
  createProperty,
  getProperties,
  updateProperty,
  deleteProperty,
};
