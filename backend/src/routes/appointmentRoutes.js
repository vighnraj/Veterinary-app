const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { auditAction } = require('../middlewares/audit');

const router = express.Router();

router.use(authenticate);

// Services
router.route('/services')
  .get(appointmentController.getServices)
  .post(requirePermission('services.create'), auditAction('CREATE', 'Service'), appointmentController.createService);

router.route('/services/:id')
  .patch(requirePermission('services.update'), auditAction('UPDATE', 'Service'), appointmentController.updateService)
  .delete(requirePermission('services.delete'), auditAction('DELETE', 'Service'), appointmentController.deleteService);

// Quick access
router.get('/today', appointmentController.getTodayAppointments);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/stats', appointmentController.getAppointmentStats);

// Appointments
router.route('/')
  .get(appointmentController.getAppointments)
  .post(requirePermission('appointments.create'), auditAction('CREATE', 'Appointment'), appointmentController.createAppointment);

router.route('/:id')
  .get(appointmentController.getAppointment)
  .patch(requirePermission('appointments.update'), auditAction('UPDATE', 'Appointment'), appointmentController.updateAppointment);

router.patch('/:id/status', requirePermission('appointments.update'), appointmentController.updateAppointmentStatus);

// Animals in appointment
router.post('/:id/animals', requirePermission('appointments.update'), appointmentController.addAnimalsToAppointment);
router.delete('/:id/animals', requirePermission('appointments.update'), appointmentController.removeAnimalsFromAppointment);
router.patch('/:id/animals/:animalId/procedure', requirePermission('appointments.update'), appointmentController.updateAnimalProcedure);

// Services in appointment
router.post('/:id/services', requirePermission('appointments.update'), appointmentController.addServicesToAppointment);

module.exports = router;
