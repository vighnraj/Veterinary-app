const prisma = require('../config/database');
const dayjs = require('dayjs');

class DashboardService {
  /**
   * Get dashboard overview data
   */
  async getOverview(accountId) {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const sevenDaysFromNow = dayjs().add(7, 'day').toDate();

    const [
      todayAppointments,
      activeAnimals,
      activeClients,
      pendingInvoices,
      monthlyRevenue,
      upcomingVaccinations,
      pregnantAnimals,
      recentActivities,
    ] = await Promise.all([
      // Today's appointments
      prisma.appointment.count({
        where: {
          accountId,
          scheduledDate: { gte: today, lt: tomorrow },
          status: { in: ['scheduled', 'confirmed', 'in_progress'] },
        },
      }),

      // Active animals count
      prisma.animal.count({
        where: { accountId, deletedAt: null, status: 'active' },
      }),

      // Active clients count
      prisma.client.count({
        where: { accountId, deletedAt: null, isActive: true },
      }),

      // Pending invoices
      prisma.invoice.findMany({
        where: {
          accountId,
          status: { in: ['sent', 'partial', 'overdue'] },
        },
        select: { totalAmount: true, paidAmount: true },
      }),

      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          invoice: { accountId },
          paymentDate: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),

      // Upcoming vaccinations (alerts)
      prisma.animalVaccination.count({
        where: {
          animal: { accountId, deletedAt: null, status: 'active' },
          nextDoseDate: { lte: sevenDaysFromNow },
          reminderSent: false,
        },
      }),

      // Pregnant animals with expected calving soon
      prisma.animal.count({
        where: {
          accountId,
          deletedAt: null,
          reproductiveStatus: 'pregnant',
          expectedCalvingDate: { lte: dayjs().add(30, 'day').toDate() },
        },
      }),

      // Recent activities (audit log)
      prisma.auditLog.findMany({
        where: { accountId },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate pending amount
    const pendingAmount = pendingInvoices.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)),
      0
    );

    return {
      todayAppointments,
      activeAnimals,
      activeClients,
      pendingInvoices: pendingInvoices.length,
      pendingAmount,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      upcomingVaccinations,
      pregnantAnimals,
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        user: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System',
        createdAt: a.createdAt,
      })),
    };
  }

  /**
   * Get today's appointments
   */
  async getTodayAppointments(accountId) {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();

    return prisma.appointment.findMany({
      where: {
        accountId,
        scheduledDate: { gte: today, lt: tomorrow },
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        appointmentServices: {
          include: { service: { select: { name: true, category: true } } },
        },
        _count: { select: { appointmentAnimals: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Get alerts (vaccinations, reproductive, overdue invoices)
   */
  async getAlerts(accountId) {
    const sevenDaysFromNow = dayjs().add(7, 'day').toDate();
    const thirtyDaysFromNow = dayjs().add(30, 'day').toDate();

    const [vaccinationAlerts, reproductiveAlerts, overdueInvoices] = await Promise.all([
      // Vaccination alerts
      prisma.animalVaccination.findMany({
        where: {
          animal: { accountId, deletedAt: null, status: 'active' },
          nextDoseDate: { lte: sevenDaysFromNow },
        },
        include: {
          vaccination: { select: { name: true } },
          animal: {
            select: {
              id: true,
              identifier: true,
              name: true,
              client: { select: { name: true } },
            },
          },
        },
        orderBy: { nextDoseDate: 'asc' },
        take: 10,
      }),

      // Reproductive alerts (expected calvings)
      prisma.animal.findMany({
        where: {
          accountId,
          deletedAt: null,
          reproductiveStatus: 'pregnant',
          expectedCalvingDate: { lte: thirtyDaysFromNow },
        },
        select: {
          id: true,
          identifier: true,
          name: true,
          expectedCalvingDate: true,
          client: { select: { name: true } },
        },
        orderBy: { expectedCalvingDate: 'asc' },
        take: 10,
      }),

      // Overdue invoices
      prisma.invoice.findMany({
        where: {
          accountId,
          status: { in: ['sent', 'partial'] },
          dueDate: { lt: new Date() },
        },
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          paidAmount: true,
          dueDate: true,
          client: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ]);

    return {
      vaccinations: vaccinationAlerts.map((v) => ({
        type: 'vaccination',
        id: v.id,
        title: `${v.vaccination.name} due`,
        animal: `${v.animal.identifier} - ${v.animal.name || 'N/A'}`,
        client: v.animal.client.name,
        date: v.nextDoseDate,
      })),
      reproductive: reproductiveAlerts.map((a) => ({
        type: 'calving',
        id: a.id,
        title: 'Expected calving',
        animal: `${a.identifier} - ${a.name || 'N/A'}`,
        client: a.client.name,
        date: a.expectedCalvingDate,
      })),
      financial: overdueInvoices.map((i) => ({
        type: 'overdue',
        id: i.id,
        title: `Invoice ${i.invoiceNumber} overdue`,
        client: i.client.name,
        amount: Number(i.totalAmount) - Number(i.paidAmount),
        date: i.dueDate,
      })),
    };
  }

  /**
   * Get quick stats for period
   */
  async getStats(accountId, period = 30) {
    const startDate = dayjs().subtract(period, 'day').toDate();
    const prevStartDate = dayjs().subtract(period * 2, 'day').toDate();

    // Current period stats
    const [currentAppointments, currentRevenue, currentAnimals] = await Promise.all([
      prisma.appointment.count({
        where: {
          accountId,
          scheduledDate: { gte: startDate },
          status: 'completed',
        },
      }),
      prisma.payment.aggregate({
        where: {
          invoice: { accountId },
          paymentDate: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.animal.count({
        where: {
          accountId,
          createdAt: { gte: startDate },
          deletedAt: null,
        },
      }),
    ]);

    // Previous period stats for comparison
    const [prevAppointments, prevRevenue, prevAnimals] = await Promise.all([
      prisma.appointment.count({
        where: {
          accountId,
          scheduledDate: { gte: prevStartDate, lt: startDate },
          status: 'completed',
        },
      }),
      prisma.payment.aggregate({
        where: {
          invoice: { accountId },
          paymentDate: { gte: prevStartDate, lt: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.animal.count({
        where: {
          accountId,
          createdAt: { gte: prevStartDate, lt: startDate },
          deletedAt: null,
        },
      }),
    ]);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      appointments: {
        current: currentAppointments,
        change: calculateChange(currentAppointments, prevAppointments),
      },
      revenue: {
        current: currentRevenue._sum.amount || 0,
        change: calculateChange(
          currentRevenue._sum.amount || 0,
          prevRevenue._sum.amount || 0
        ),
      },
      newAnimals: {
        current: currentAnimals,
        change: calculateChange(currentAnimals, prevAnimals),
      },
      period,
    };
  }
}

module.exports = new DashboardService();
