const reproductiveService = require('../services/reproductiveService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

const recordHeat = asyncHandler(async (req, res) => {
  const record = await reproductiveService.recordHeat(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Heat recorded successfully');
});

const recordInsemination = asyncHandler(async (req, res) => {
  const record = await reproductiveService.recordInsemination(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Insemination recorded successfully');
});

const recordPregnancyCheck = asyncHandler(async (req, res) => {
  const record = await reproductiveService.recordPregnancyCheck(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Pregnancy check recorded successfully');
});

const recordBirth = asyncHandler(async (req, res) => {
  const result = await reproductiveService.recordBirth(req.accountId, req.body);
  return ApiResponse.created(res, result, 'Birth recorded successfully');
});

const recordAbortion = asyncHandler(async (req, res) => {
  const record = await reproductiveService.recordAbortion(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Abortion recorded successfully');
});

const recordAndrologicalEval = asyncHandler(async (req, res) => {
  const record = await reproductiveService.recordAndrologicalEval(req.accountId, req.body);
  return ApiResponse.created(res, record, 'Andrological evaluation recorded successfully');
});

const createProcedure = asyncHandler(async (req, res) => {
  const procedure = await reproductiveService.createProcedure(req.accountId, req.body);
  return ApiResponse.created(res, procedure, 'Procedure created successfully');
});

const updateProcedureResult = asyncHandler(async (req, res) => {
  const procedure = await reproductiveService.updateProcedureResult(
    req.accountId,
    req.params.id,
    req.body
  );
  return ApiResponse.success(res, procedure, 'Procedure result updated successfully');
});

const getAnimalHistory = asyncHandler(async (req, res) => {
  const result = await reproductiveService.getAnimalHistory(
    req.accountId,
    req.params.animalId,
    req.query
  );
  return ApiResponse.paginated(res, result.records, result.pagination);
});

const getAnimalProcedures = asyncHandler(async (req, res) => {
  const result = await reproductiveService.getAnimalProcedures(
    req.accountId,
    req.params.animalId,
    req.query
  );
  return ApiResponse.paginated(res, result.procedures, result.pagination);
});

const getPregnantAnimals = asyncHandler(async (req, res) => {
  const result = await reproductiveService.getPregnantAnimals(req.accountId, req.query);
  return ApiResponse.paginated(res, result.animals, result.pagination);
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await reproductiveService.getStats(req.accountId, req.query);
  return ApiResponse.success(res, stats);
});

module.exports = {
  recordHeat,
  recordInsemination,
  recordPregnancyCheck,
  recordBirth,
  recordAbortion,
  recordAndrologicalEval,
  createProcedure,
  updateProcedureResult,
  getAnimalHistory,
  getAnimalProcedures,
  getPregnantAnimals,
  getStats,
};
