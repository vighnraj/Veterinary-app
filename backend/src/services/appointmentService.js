const prisma = require('../config/database');
const AppError = require('../utils/appError');
const { parsePagination, parseSort } = require('../utils/helpers');

class AppointmentService {
  // ==================== SERVICES ====================

  /**
   * Create service type
   */
  async createService(accountId, data) {
    const service = await prisma.service.create({
      data: {
        accountId,
        name: data.name,
        description: data.description,
        category: data.category,
        defaultPrice: data.defaultPrice,
        priceUnit: data.priceUnit || 'per_animal',
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        formTemplate: data.formTemplate,
        requiresAnimal: data.requiresAnimal ?? true,
        requiresBatch: data.requiresBatch ?? false,
      },
    });

    return service;
  }

  /**
   * Get all services
   */
  async getServices(accountId, query) {
    const where = {
      accountId,
      isActive: true,
      ...(query.category && { category: query.category }),
    };

    return prisma.service.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Update service
   */
  async updateService(accountId, serviceId, data) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, accountId },
    });

    if (!service) {
      throw AppError.notFound('Service not found');
    }

    return prisma.service.update({
      where: { id: serviceId },
      data,
    });
  }

  /**
   * Delete service
   */
  async deleteService(accountId, serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, accountId },
    });

    if (!service) {
      throw AppError.notFound('Service not found');
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });

    return { message: 'Service deleted successfully' };
  }

  // ==================== APPOINTMENTS ====================

  /**
   * Create appointment
   */
  async createAppointment(accountId, userId, data) {
    // Validate client
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, accountId, deletedAt: null },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        accountId,
        clientId: data.clientId,
        userId,
        scheduledDate: data.scheduledDate,
        scheduledEndDate: data.scheduledEndDate,
        status: 'scheduled',
        locationType: data.locationType || 'property',
        locationNotes: data.locationNotes,
        notes: data.notes,
        internalNotes: data.internalNotes,
      },
    });

    // Add animals if provided
    if (data.animalIds && data.animalIds.length > 0) {
      await prisma.appointmentAnimal.createMany({
        data: data.animalIds.map((animalId) => ({
          appointmentId: appointment.id,
          animalId,
        })),
      });
    }

    // Add batches if provided
    if (data.batchIds && data.batchIds.length > 0) {
      await prisma.appointmentBatch.createMany({
        data: data.batchIds.map((batchId) => ({
          appointmentId: appointment.id,
          batchId,
        })),
      });
    }

    // Add services if provided
    if (data.services && data.services.length > 0) {
      await prisma.appointmentService.createMany({
        data: data.services.map((s) => ({
          appointmentId: appointment.id,
          serviceId: s.serviceId,
          quantity: s.quantity || 1,
          unitPrice: s.unitPrice,
          totalPrice: s.unitPrice * (s.quantity || 1),
        })),
      });
    }

    return this.findById(accountId, appointment.id);
  }

  /**
   * Get all appointments
   */
  async findAll(accountId, query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['scheduledDate', 'createdAt', 'status']);

    const where = {
      accountId,
      ...(query.clientId && { clientId: query.clientId }),
      ...(query.userId && { userId: query.userId }),
      ...(query.status && { status: query.status }),
    };

    // Date range filter
    if (query.dateFrom || query.dateTo) {
      where.scheduledDate = {};
      if (query.dateFrom) where.scheduledDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.scheduledDate.lte = new Date(query.dateTo);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
          appointmentServices: {
            include: { service: { select: { id: true, name: true, category: true } } },
          },
          appointmentAnimals: {
            include: {
              animal: { select: { id: true, identifier: true, name: true } },
            },
          },
          _count: {
            select: {
              appointmentAnimals: true,
              appointmentBatches: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get appointment by ID
   */
  async findById(accountId, appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, accountId },
      include: {
        client: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        appointmentAnimals: {
          include: {
            animal: {
              include: {
                species: { select: { name: true } },
                breed: { select: { name: true } },
              },
            },
          },
        },
        appointmentBatches: {
          include: {
            batch: {
              include: {
                _count: { select: { animals: true } },
              },
            },
          },
        },
        appointmentServices: {
          include: { service: true },
        },
        reproductiveProcedures: true,
        invoices: {
          select: { id: true, invoiceNumber: true, status: true, totalAmount: true },
        },
      },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    return appointment;
  }

  /**
   * Update appointment
   */
  async update(accountId, appointmentId, data) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, accountId },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    // Can't update completed or cancelled appointments
    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw AppError.badRequest(`Cannot update ${appointment.status} appointment`);
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledDate: data.scheduledDate,
        scheduledEndDate: data.scheduledEndDate,
        locationType: data.locationType,
        locationNotes: data.locationNotes,
        notes: data.notes,
        internalNotes: data.internalNotes,
      },
    });

    return this.findById(accountId, appointmentId);
  }

  /**
   * Update appointment status
   */
  async updateStatus(accountId, appointmentId, status, reason = null) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, accountId },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    const updateData = { status };

    if (status === 'in_progress') {
      updateData.actualStartDate = new Date();
    } else if (status === 'completed') {
      updateData.actualEndDate = new Date();
    } else if (status === 'cancelled') {
      updateData.cancellationReason = reason;
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Add animals to appointment
   */
  async addAnimals(accountId, appointmentId, animalIds) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, accountId },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    await prisma.appointmentAnimal.createMany({
      data: animalIds.map((animalId) => ({
        appointmentId,
        animalId,
      })),
      skipDuplicates: true,
    });

    return this.findById(accountId, appointmentId);
  }

  /**
   * Remove animals from appointment
   */
  async removeAnimals(accountId, appointmentId, animalIds) {
    await prisma.appointmentAnimal.deleteMany({
      where: {
        appointmentId,
        animalId: { in: animalIds },
        appointment: { accountId },
      },
    });

    return this.findById(accountId, appointmentId);
  }

  /**
   * Update animal procedure data
   */
  async updateAnimalProcedure(accountId, appointmentId, animalId, procedureData) {
    const appointmentAnimal = await prisma.appointmentAnimal.findFirst({
      where: {
        appointmentId,
        animalId,
        appointment: { accountId },
      },
    });

    if (!appointmentAnimal) {
      throw AppError.notFound('Animal not in appointment');
    }

    const updated = await prisma.appointmentAnimal.update({
      where: { id: appointmentAnimal.id },
      data: {
        procedureData,
        notes: procedureData.notes,
      },
    });

    return updated;
  }

  /**
   * Add services to appointment
   */
  async addServices(accountId, appointmentId, services) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, accountId },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    await prisma.appointmentService.createMany({
      data: services.map((s) => ({
        appointmentId,
        serviceId: s.serviceId,
        quantity: s.quantity || 1,
        unitPrice: s.unitPrice,
        totalPrice: s.unitPrice * (s.quantity || 1),
        formData: s.formData,
        notes: s.notes,
      })),
    });

    return this.findById(accountId, appointmentId);
  }

  /**
   * Get today's appointments
   */
  async getTodayAppointments(accountId, userId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      accountId,
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
      ...(userId && { userId }),
    };

    return prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
        _count: {
          select: { appointmentAnimals: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Get upcoming appointments
   */
  async getUpcoming(accountId, days = 7) {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return prisma.appointment.findMany({
      where: {
        accountId,
        scheduledDate: {
          gte: now,
          lte: endDate,
        },
        status: { in: ['scheduled', 'confirmed'] },
      },
      include: {
        client: { select: { id: true, name: true } },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 20,
    });
  }

  /**
   * Get appointment statistics
   */
  async getStats(accountId, dateRange) {
    const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

    const where = {
      accountId,
      scheduledDate: { gte: startDate, lte: endDate },
    };

    const [total, completed, cancelled, byStatus] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: 'completed' } }),
      prisma.appointment.count({ where: { ...where, status: 'cancelled' } }),
      prisma.appointment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      periodStart: startDate,
      periodEnd: endDate,
    };
  }
}

module.exports = new AppointmentService();
