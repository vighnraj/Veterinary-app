const prisma = require('../config/database');
const { parsePagination } = require('../utils/helpers');

class NotificationService {
  /**
   * Create notification
   */
  async create(data) {
    const notification = await prisma.notification.create({
      data: {
        accountId: data.accountId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedEntity: data.relatedEntity,
        relatedEntityId: data.relatedEntityId,
        channels: data.channels || ['in_app'],
        scheduledFor: data.scheduledFor,
      },
    });

    return notification;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      userId,
      ...(query.read !== undefined && { read: query.read === 'true' }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId, notificationId) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return null;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    return { updated: result.count };
  }

  /**
   * Delete notification
   */
  async delete(userId, notificationId) {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });

    return { message: 'Notification deleted' };
  }

  /**
   * Register push token
   */
  async registerPushToken(userId, token, platform, deviceName) {
    // Update or create push token
    const existing = await prisma.pushToken.findUnique({
      where: { token },
    });

    if (existing) {
      return prisma.pushToken.update({
        where: { token },
        data: { userId, platform, deviceName, isActive: true },
      });
    }

    return prisma.pushToken.create({
      data: { userId, token, platform, deviceName },
    });
  }

  /**
   * Remove push token
   */
  async removePushToken(token) {
    await prisma.pushToken.deleteMany({
      where: { token },
    });

    return { message: 'Token removed' };
  }

  /**
   * Get user push tokens
   */
  async getUserPushTokens(userId) {
    return prisma.pushToken.findMany({
      where: { userId, isActive: true },
    });
  }

  /**
   * Send notification to user(s)
   */
  async sendNotification(accountId, data) {
    const { userIds, type, title, message, relatedEntity, relatedEntityId, channels } = data;

    const notifications = await prisma.$transaction(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            accountId,
            userId,
            type,
            title,
            message,
            relatedEntity,
            relatedEntityId,
            channels: channels || ['in_app', 'push'],
          },
        })
      )
    );

    // TODO: Send push notifications via Expo
    // if (channels.includes('push')) {
    //   await this.sendPushNotifications(userIds, title, message);
    // }

    return { sent: notifications.length };
  }

  /**
   * Create appointment reminder notification
   */
  async createAppointmentReminder(appointment) {
    const notification = await this.create({
      accountId: appointment.accountId,
      userId: appointment.userId,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment with ${appointment.client?.name} scheduled for tomorrow`,
      relatedEntity: 'Appointment',
      relatedEntityId: appointment.id,
      channels: ['in_app', 'push', 'email'],
    });

    return notification;
  }

  /**
   * Create vaccination alert notification
   */
  async createVaccinationAlert(animal, vaccination, nextDoseDate) {
    const notification = await this.create({
      accountId: animal.accountId,
      type: 'vaccine_due',
      title: 'Vaccination Due',
      message: `${animal.identifier} is due for ${vaccination.name}`,
      relatedEntity: 'Animal',
      relatedEntityId: animal.id,
      channels: ['in_app'],
    });

    return notification;
  }

  /**
   * Create payment due notification
   */
  async createPaymentDueAlert(invoice) {
    const notification = await this.create({
      accountId: invoice.accountId,
      type: 'payment_due',
      title: 'Payment Due',
      message: `Invoice ${invoice.invoiceNumber} for ${invoice.client?.name} is due`,
      relatedEntity: 'Invoice',
      relatedEntityId: invoice.id,
      channels: ['in_app'],
    });

    return notification;
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications() {
    const now = new Date();

    const notifications = await prisma.notification.findMany({
      where: {
        scheduledFor: { lte: now },
        sentAt: null,
      },
    });

    for (const notification of notifications) {
      // Mark as sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: { sentAt: new Date() },
      });

      // TODO: Send push notification
    }

    return { processed: notifications.length };
  }
}

module.exports = new NotificationService();
