const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Push tokens
router.post('/push-token', notificationController.registerPushToken);
router.delete('/push-token', notificationController.removePushToken);

module.exports = router;
