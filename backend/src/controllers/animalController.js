const animalService = require('../services/animalService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// ==================== ANIMAL CONTROLLERS ====================

const createAnimal = asyncHandler(async (req, res) => {
  const animal = await animalService.create(req.accountId, req.body);
  return ApiResponse.created(res, animal, 'Animal created successfully');
});

const getAnimals = asyncHandler(async (req, res) => {
  const result = await animalService.findAll(req.accountId, req.query);
  return ApiResponse.paginated(res, result.animals, result.pagination);
});

const getAnimal = asyncHandler(async (req, res) => {
  const animal = await animalService.findById(req.accountId, req.params.id);
  return ApiResponse.success(res, animal);
});

const updateAnimal = asyncHandler(async (req, res) => {
  const animal = await animalService.update(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, animal, 'Animal updated successfully');
});

const deleteAnimal = asyncHandler(async (req, res) => {
  const result = await animalService.delete(req.accountId, req.params.id);
  return ApiResponse.success(res, result);
});

const updateAnimalStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const animal = await animalService.updateStatus(req.accountId, req.params.id, status, reason);
  return ApiResponse.success(res, animal, 'Animal status updated successfully');
});

const recordWeight = asyncHandler(async (req, res) => {
  const record = await animalService.recordWeight(req.accountId, req.params.id, req.body);
  return ApiResponse.created(res, record, 'Weight recorded successfully');
});

const getWeightHistory = asyncHandler(async (req, res) => {
  const result = await animalService.getWeightHistory(req.accountId, req.params.id, req.query);
  return ApiResponse.paginated(res, result.records, result.pagination);
});

const getGenealogy = asyncHandler(async (req, res) => {
  const generations = parseInt(req.query.generations, 10) || 3;
  const genealogy = await animalService.getGenealogy(req.accountId, req.params.id, generations);
  return ApiResponse.success(res, genealogy);
});

// ==================== BATCH CONTROLLERS ====================

const createBatch = asyncHandler(async (req, res) => {
  const batch = await animalService.createBatch(req.accountId, req.body);
  return ApiResponse.created(res, batch, 'Batch created successfully');
});

const getBatches = asyncHandler(async (req, res) => {
  const result = await animalService.findAllBatches(req.accountId, req.query);
  return ApiResponse.paginated(res, result.batches, result.pagination);
});

const getBatch = asyncHandler(async (req, res) => {
  const batch = await animalService.findBatchById(req.accountId, req.params.id);
  return ApiResponse.success(res, batch);
});

const updateBatch = asyncHandler(async (req, res) => {
  const batch = await animalService.updateBatch(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, batch, 'Batch updated successfully');
});

const deleteBatch = asyncHandler(async (req, res) => {
  const result = await animalService.deleteBatch(req.accountId, req.params.id);
  return ApiResponse.success(res, result);
});

const addAnimalsToBatch = asyncHandler(async (req, res) => {
  const result = await animalService.addAnimalsToBatch(
    req.accountId,
    req.params.batchId,
    req.body.animalIds
  );
  return ApiResponse.success(res, result);
});

const removeAnimalsFromBatch = asyncHandler(async (req, res) => {
  const result = await animalService.removeAnimalsFromBatch(
    req.accountId,
    req.params.batchId,
    req.body.animalIds
  );
  return ApiResponse.success(res, result);
});

// ==================== SPECIES & BREEDS ====================

const getSpecies = asyncHandler(async (req, res) => {
  const species = await animalService.getSpecies();
  return ApiResponse.success(res, species);
});

const getBreedsBySpecies = asyncHandler(async (req, res) => {
  const breeds = await animalService.getBreedsBySpecies(req.params.speciesId);
  return ApiResponse.success(res, breeds);
});

module.exports = {
  createAnimal,
  getAnimals,
  getAnimal,
  updateAnimal,
  deleteAnimal,
  updateAnimalStatus,
  recordWeight,
  getWeightHistory,
  getGenealogy,
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  addAnimalsToBatch,
  removeAnimalsFromBatch,
  getSpecies,
  getBreedsBySpecies,
};
