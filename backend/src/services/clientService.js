const prisma = require('../config/database');
const AppError = require('../utils/appError');
const { parsePagination, parseSort, buildWhereClause } = require('../utils/helpers');

class ClientService {
  /**
   * Create a new client
   */
  async create(accountId, data) {
    // Check client limit based on plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { plan: true },
    });

    if (account.plan) {
      const clientCount = await prisma.client.count({
        where: { accountId, deletedAt: null },
      });

      if (clientCount >= account.plan.maxClients) {
        throw AppError.forbidden(
          `Client limit reached (${account.plan.maxClients}). Please upgrade your plan.`
        );
      }
    }

    const client = await prisma.client.create({
      data: {
        accountId,
        ...data,
      },
      include: {
        properties: true,
      },
    });

    return client;
  }

  /**
   * Get all clients with pagination and filters
   */
  async findAll(accountId, query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['name', 'createdAt', 'city', 'state']);

    const filters = {
      search: query.search,
      city: query.city,
      state: query.state,
      isActive: query.isActive,
    };

    const where = {
      accountId,
      deletedAt: null,
      ...buildWhereClause(filters, ['name', 'email', 'phone', 'document']),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          properties: {
            where: { deletedAt: null },
            select: { id: true, name: true },
          },
          _count: {
            select: {
              animals: { where: { deletedAt: null } },
              appointments: true,
              invoices: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return {
      clients,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get client by ID
   */
  async findById(accountId, clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
      include: {
        properties: {
          where: { deletedAt: null },
        },
        animals: {
          where: { deletedAt: null },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        appointments: {
          take: 10,
          orderBy: { scheduledDate: 'desc' },
        },
        invoices: {
          take: 10,
          orderBy: { issueDate: 'desc' },
        },
        _count: {
          select: {
            animals: { where: { deletedAt: null } },
            appointments: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    return client;
  }

  /**
   * Update client
   */
  async update(accountId, clientId, data) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data,
      include: {
        properties: {
          where: { deletedAt: null },
        },
      },
    });

    return updated;
  }

  /**
   * Delete client (soft delete)
   */
  async delete(accountId, clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    // Soft delete client and related properties
    await prisma.$transaction([
      prisma.client.update({
        where: { id: clientId },
        data: { deletedAt: new Date(), isActive: false },
      }),
      prisma.property.updateMany({
        where: { clientId },
        data: { deletedAt: new Date(), isActive: false },
      }),
    ]);

    return { message: 'Client deleted successfully' };
  }

  /**
   * Get client financial summary
   */
  async getFinancialSummary(accountId, clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId },
      select: {
        totalAmount: true,
        paidAmount: true,
        status: true,
        issueDate: true,
      },
    });

    const summary = {
      totalInvoiced: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      invoiceCount: invoices.length,
    };

    const now = new Date();

    invoices.forEach((invoice) => {
      const total = Number(invoice.totalAmount);
      const paid = Number(invoice.paidAmount);

      summary.totalInvoiced += total;
      summary.totalPaid += paid;

      if (invoice.status === 'overdue') {
        summary.totalOverdue += total - paid;
      } else if (['sent', 'partial'].includes(invoice.status)) {
        summary.totalPending += total - paid;
      }
    });

    return summary;
  }

  /**
   * Get client service history
   */
  async getServiceHistory(accountId, clientId, query) {
    const { page, limit, skip } = parsePagination(query);

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: { clientId },
        include: {
          appointmentServices: {
            include: {
              service: true,
            },
          },
          appointmentAnimals: {
            include: {
              animal: {
                select: { id: true, identifier: true, name: true },
              },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { scheduledDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where: { clientId } }),
    ]);

    return {
      appointments,
      pagination: { page, limit, total },
    };
  }

  // ==================== PROPERTY METHODS ====================

  /**
   * Create property for client
   */
  async createProperty(accountId, clientId, data) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    const property = await prisma.property.create({
      data: {
        clientId,
        ...data,
      },
    });

    return property;
  }

  /**
   * Get all properties for a client
   */
  async findProperties(accountId, clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    const properties = await prisma.property.findMany({
      where: {
        clientId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            animals: { where: { deletedAt: null } },
            batches: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return properties;
  }

  /**
   * Update property
   */
  async updateProperty(accountId, clientId, propertyId, data) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        clientId,
        client: { accountId },
        deletedAt: null,
      },
    });

    if (!property) {
      throw AppError.notFound('Property not found');
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data,
    });

    return updated;
  }

  /**
   * Delete property
   */
  async deleteProperty(accountId, clientId, propertyId) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        clientId,
        client: { accountId },
        deletedAt: null,
      },
    });

    if (!property) {
      throw AppError.notFound('Property not found');
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Property deleted successfully' };
  }
}

module.exports = new ClientService();
