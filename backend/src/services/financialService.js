const prisma = require('../config/database');
const AppError = require('../utils/appError');
const { parsePagination, generateInvoiceNumber } = require('../utils/helpers');

class FinancialService {
  /**
   * Create invoice
   */
  async createInvoice(accountId, userId, data) {
    // Validate client
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, accountId, deletedAt: null },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    // Get next invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    let sequence = 1;
    if (lastInvoice) {
      const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    const invoiceNumber = generateInvoiceNumber('INV', sequence);

    // Calculate totals
    let subtotal = 0;
    if (data.items && data.items.length > 0) {
      data.items.forEach((item) => {
        const itemTotal = item.unitPrice * item.quantity * (1 - (item.discountPercent || 0) / 100);
        subtotal += itemTotal;
      });
    }

    const discountAmount = subtotal * ((data.discountPercent || 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * ((data.taxPercent || 0) / 100);
    const totalAmount = afterDiscount + taxAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        accountId,
        clientId: data.clientId,
        appointmentId: data.appointmentId,
        createdById: userId,
        invoiceNumber,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        subtotal,
        discountPercent: data.discountPercent || 0,
        discountAmount,
        taxPercent: data.taxPercent || 0,
        taxAmount,
        totalAmount,
        status: 'draft',
        notes: data.notes,
        internalNotes: data.internalNotes,
      },
    });

    // Create invoice items
    if (data.items && data.items.length > 0) {
      await prisma.invoiceItem.createMany({
        data: data.items.map((item) => ({
          invoiceId: invoice.id,
          serviceId: item.serviceId,
          animalId: item.animalId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          totalPrice: item.unitPrice * item.quantity * (1 - (item.discountPercent || 0) / 100),
        })),
      });
    }

    return this.findById(accountId, invoice.id);
  }

  /**
   * Get all invoices
   */
  async findAll(accountId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      accountId,
      ...(query.clientId && { clientId: query.clientId }),
      ...(query.status && { status: query.status }),
    };

    if (query.dateFrom || query.dateTo) {
      where.issueDate = {};
      if (query.dateFrom) where.issueDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.issueDate.lte = new Date(query.dateTo);
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          _count: { select: { items: true, payments: true } },
        },
        orderBy: { issueDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get invoice by ID
   */
  async findById(accountId, invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, accountId },
      include: {
        client: true,
        appointment: {
          select: { id: true, scheduledDate: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            service: { select: { id: true, name: true } },
            animal: { select: { id: true, identifier: true, name: true } },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    return invoice;
  }

  /**
   * Update invoice
   */
  async update(accountId, invoiceId, data) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, accountId },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    if (invoice.status !== 'draft') {
      throw AppError.badRequest('Only draft invoices can be edited');
    }

    // Recalculate totals if items changed
    if (data.items) {
      // Delete existing items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId },
      });

      let subtotal = 0;
      data.items.forEach((item) => {
        const itemTotal = item.unitPrice * item.quantity * (1 - (item.discountPercent || 0) / 100);
        subtotal += itemTotal;
      });

      const discountAmount = subtotal * ((data.discountPercent || invoice.discountPercent) / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * ((data.taxPercent || invoice.taxPercent) / 100);
      const totalAmount = afterDiscount + taxAmount;

      // Create new items
      await prisma.invoiceItem.createMany({
        data: data.items.map((item) => ({
          invoiceId,
          serviceId: item.serviceId,
          animalId: item.animalId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          totalPrice: item.unitPrice * item.quantity * (1 - (item.discountPercent || 0) / 100),
        })),
      });

      data.subtotal = subtotal;
      data.discountAmount = discountAmount;
      data.taxAmount = taxAmount;
      data.totalAmount = totalAmount;
      delete data.items;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data,
    });

    return this.findById(accountId, invoiceId);
  }

  /**
   * Update invoice status
   */
  async updateStatus(accountId, invoiceId, status) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, accountId },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    return updated;
  }

  /**
   * Record payment
   */
  async recordPayment(accountId, invoiceId, data) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, accountId },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    if (['paid', 'cancelled'].includes(invoice.status)) {
      throw AppError.badRequest(`Cannot record payment for ${invoice.status} invoice`);
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        paymentDate: data.paymentDate || new Date(),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Update invoice paid amount and status
    const newPaidAmount = Number(invoice.paidAmount) + Number(data.amount);
    const totalAmount = Number(invoice.totalAmount);

    let newStatus = invoice.status;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        paidDate: newStatus === 'paid' ? new Date() : null,
        status: newStatus,
        paymentMethod: data.paymentMethod,
      },
    });

    return this.findById(accountId, invoiceId);
  }

  /**
   * Get overdue invoices
   */
  async getOverdue(accountId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      accountId,
      status: { in: ['sent', 'partial'] },
      dueDate: { lt: new Date() },
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, phone: true, email: true } },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    // Mark as overdue
    await prisma.invoice.updateMany({
      where: {
        id: { in: invoices.map((i) => i.id) },
        status: { not: 'overdue' },
      },
      data: { status: 'overdue' },
    });

    return {
      invoices,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get receivables summary
   */
  async getReceivables(accountId) {
    const invoices = await prisma.invoice.findMany({
      where: {
        accountId,
        status: { in: ['sent', 'partial', 'overdue'] },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        dueDate: true,
        status: true,
      },
    });

    const now = new Date();
    const summary = {
      total: 0,
      current: 0,
      overdue30: 0,
      overdue60: 0,
      overdue90: 0,
    };

    invoices.forEach((invoice) => {
      const pending = Number(invoice.totalAmount) - Number(invoice.paidAmount);
      summary.total += pending;

      if (invoice.dueDate >= now) {
        summary.current += pending;
      } else {
        const daysOverdue = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));
        if (daysOverdue <= 30) summary.overdue30 += pending;
        else if (daysOverdue <= 60) summary.overdue60 += pending;
        else summary.overdue90 += pending;
      }
    });

    return summary;
  }

  /**
   * Get financial statistics
   */
  async getStats(accountId, dateRange) {
    const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

    const where = {
      accountId,
      issueDate: { gte: startDate, lte: endDate },
    };

    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({
        where,
        select: {
          totalAmount: true,
          paidAmount: true,
          status: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          invoice: { accountId },
          paymentDate: { gte: startDate, lte: endDate },
        },
        select: { amount: true },
      }),
    ]);

    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = invoices
      .filter((i) => !['paid', 'cancelled'].includes(i.status))
      .reduce((sum, i) => sum + (Number(i.totalAmount) - Number(i.paidAmount)), 0);

    return {
      totalInvoiced,
      totalReceived,
      totalPending,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  /**
   * Get revenue by service category
   */
  async getRevenueByCategory(accountId, dateRange) {
    const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoice: {
          accountId,
          status: { not: 'cancelled' },
          issueDate: { gte: startDate, lte: endDate },
        },
        serviceId: { not: null },
      },
      include: {
        service: { select: { category: true } },
      },
    });

    const byCategory = {};
    items.forEach((item) => {
      const category = item.service?.category || 'other';
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, total: 0 };
      }
      byCategory[category].count++;
      byCategory[category].total += Number(item.totalPrice);
    });

    return byCategory;
  }
}

module.exports = new FinancialService();
