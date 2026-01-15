const appointmentService = require('../services/appointmentService');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// Services
const createService = asyncHandler(async (req, res) => {
  const service = await appointmentService.createService(req.accountId, req.body);
  return ApiResponse.created(res, service, 'Service created successfully');
});

const getServices = asyncHandler(async (req, res) => {
  const services = await appointmentService.getServices(req.accountId, req.query);
  return ApiResponse.success(res, services);
});

const updateService = asyncHandler(async (req, res) => {
  const service = await appointmentService.updateService(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, service, 'Service updated successfully');
});

const deleteService = asyncHandler(async (req, res) => {
  const result = await appointmentService.deleteService(req.accountId, req.params.id);
  return ApiResponse.success(res, result);
});

// Appointments
const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(
    req.accountId,
    req.user.id,
    req.body
  );
  return ApiResponse.created(res, appointment, 'Appointment created successfully');
});

const getAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.findAll(req.accountId, req.query);
  return ApiResponse.paginated(res, result.appointments, result.pagination);
});

const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.findById(req.accountId, req.params.id);
  return ApiResponse.success(res, appointment);
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.update(req.accountId, req.params.id, req.body);
  return ApiResponse.success(res, appointment, 'Appointment updated successfully');
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const appointment = await appointmentService.updateStatus(
    req.accountId,
    req.params.id,
    status,
    reason
  );
  return ApiResponse.success(res, appointment, 'Appointment status updated');
});

const addAnimalsToAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.addAnimals(
    req.accountId,
    req.params.id,
    req.body.animalIds
  );
  return ApiResponse.success(res, appointment, 'Animals added to appointment');
});

const removeAnimalsFromAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.removeAnimals(
    req.accountId,
    req.params.id,
    req.body.animalIds
  );
  return ApiResponse.success(res, appointment, 'Animals removed from appointment');
});

const updateAnimalProcedure = asyncHandler(async (req, res) => {
  const result = await appointmentService.updateAnimalProcedure(
    req.accountId,
    req.params.id,
    req.params.animalId,
    req.body
  );
  return ApiResponse.success(res, result, 'Procedure data updated');
});

const addServicesToAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.addServices(
    req.accountId,
    req.params.id,
    req.body.services
  );
  return ApiResponse.success(res, appointment, 'Services added to appointment');
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getTodayAppointments(req.accountId, req.user.id);
  return ApiResponse.success(res, appointments);
});

const getUpcomingAppointments = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const appointments = await appointmentService.getUpcoming(req.accountId, days);
  return ApiResponse.success(res, appointments);
});

const getAppointmentStats = asyncHandler(async (req, res) => {
  const stats = await appointmentService.getStats(req.accountId, req.query);
  return ApiResponse.success(res, stats);
});

module.exports = {
  createService,
  getServices,
  updateService,
  deleteService,
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  updateAppointmentStatus,
  addAnimalsToAppointment,
  removeAnimalsFromAppointment,
  updateAnimalProcedure,
  addServicesToAppointment,
  getTodayAppointments,
  getUpcomingAppointments,
  getAppointmentStats,
};
