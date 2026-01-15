const sanitaryService = require('../services/sanitaryService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// Vaccinations
const createVaccination = asyncHandler(async (req, res) => {
  const vaccination = await sanitaryService.createVaccination(req.accountId, req.body);
  return ApiResponse.created(res, vaccination, 'Vaccination type created successfully');
});

const getVaccinations = asyncHandler(async (req, res) => {
  const vaccinations = await sanitaryService.getVaccinations(req.accountId);
  return ApiResponse.success(res, vaccinations);
});

const applyVaccination = asyncHandler(async (req, res) => {
  const record = await sanitaryService.applyVaccination(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Vaccination applied successfully');
});

const applyBatchVaccination = asyncHandler(async (req, res) => {
  const result = await sanitaryService.applyBatchVaccination(req.accountId, req.body);
  return ApiResponse.created(res, result, `Vaccination applied to ${result.count} animals`);
});

const getAnimalVaccinations = asyncHandler(async (req, res) => {
  const result = await sanitaryService.getAnimalVaccinations(
    req.accountId,
    req.params.animalId,
    req.query
  );
  return ApiResponse.paginated(res, result.records, result.pagination);
});

const getVaccinationAlerts = asyncHandler(async (req, res) => {
  const result = await sanitaryService.getVaccinationAlerts(req.accountId, req.query);
  return ApiResponse.paginated(res, result.alerts, result.pagination);
});

// Health Records
const createHealthRecord = asyncHandler(async (req, res) => {
  const record = await sanitaryService.createHealthRecord(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Health record created successfully');
});

const getAnimalHealthRecords = asyncHandler(async (req, res) => {
  const result = await sanitaryService.getAnimalHealthRecords(
    req.accountId,
    req.params.animalId,
    req.query
  );
  return ApiResponse.paginated(res, result.records, result.pagination);
});

// Campaigns
const createCampaign = asyncHandler(async (req, res) => {
  const campaign = await sanitaryService.createCampaign(req.accountId, req.body);
  return ApiResponse.created(res, campaign, 'Campaign created successfully');
});

const getCampaigns = asyncHandler(async (req, res) => {
  const result = await sanitaryService.getCampaigns(req.accountId, req.query);
  return ApiResponse.paginated(res, result.campaigns, result.pagination);
});

const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await sanitaryService.getCampaign(req.accountId, req.params.id);
  return ApiResponse.success(res, campaign);
});

const updateCampaignStatus = asyncHandler(async (req, res) => {
  const campaign = await sanitaryService.updateCampaignStatus(
    req.accountId,
    req.params.id,
    req.body.status
  );
  return ApiResponse.success(res, campaign, 'Campaign status updated');
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await sanitaryService.getStats(req.accountId, req.query);
  return ApiResponse.success(res, stats);
});

module.exports = {
  createVaccination,
  getVaccinations,
  applyVaccination,
  applyBatchVaccination,
  getAnimalVaccinations,
  getVaccinationAlerts,
  createHealthRecord,
  getAnimalHealthRecords,
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaignStatus,
  getStats,
};
