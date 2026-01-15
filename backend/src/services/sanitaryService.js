const prisma = require('../config/database');
const AppError = require('../utils/appError');
const { parsePagination } = require('../utils/helpers');

class SanitaryService {
  // ==================== VACCINATIONS ====================

  /**
   * Create vaccination type
   */
  async createVaccination(accountId, data) {
    const vaccination = await prisma.vaccination.create({
      data: {
        accountId,
        name: data.name,
        description: data.description,
        manufacturer: data.manufacturer,
        targetDiseases: data.targetDiseases,
        doseIntervalDays: data.doseIntervalDays,
        boosterIntervalDays: data.boosterIntervalDays,
      },
    });

    return vaccination;
  }

  /**
   * Get all vaccination types
   */
  async getVaccinations(accountId) {
    return prisma.vaccination.findMany({
      where: { accountId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Apply vaccination to animal
   */
  async applyVaccination(accountId, data) {
    const animal = await prisma.animal.findFirst({
      where: { id: data.animalId, accountId, deletedAt: null },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    const vaccination = await prisma.vaccination.findFirst({
      where: { id: data.vaccinationId, accountId },
    });

    if (!vaccination) {
      throw AppError.notFound('Vaccination type not found');
    }

    // Calculate next dose date
    let nextDoseDate = null;
    if (vaccination.doseIntervalDays) {
      nextDoseDate = new Date(data.applicationDate || Date.now());
      nextDoseDate.setDate(nextDoseDate.getDate() + vaccination.doseIntervalDays);
    }

    const record = await prisma.animalVaccination.create({
      data: {
        animalId: data.animalId,
        vaccinationId: data.vaccinationId,
        applicationDate: data.applicationDate || new Date(),
        doseNumber: data.doseNumber || 1,
        batchNumber: data.batchNumber,
        expirationDate: data.expirationDate,
        applicationSite: data.applicationSite,
        applicator: data.applicator,
        nextDoseDate,
        notes: data.notes,
      },
      include: {
        vaccination: true,
        animal: {
          select: { id: true, identifier: true, name: true },
        },
      },
    });

    return record;
  }

  /**
   * Apply vaccination to multiple animals (batch)
   */
  async applyBatchVaccination(accountId, data) {
    const vaccination = await prisma.vaccination.findFirst({
      where: { id: data.vaccinationId, accountId },
    });

    if (!vaccination) {
      throw AppError.notFound('Vaccination type not found');
    }

    // Calculate next dose date
    let nextDoseDate = null;
    if (vaccination.doseIntervalDays) {
      nextDoseDate = new Date(data.applicationDate || Date.now());
      nextDoseDate.setDate(nextDoseDate.getDate() + vaccination.doseIntervalDays);
    }

    const records = await prisma.$transaction(
      data.animalIds.map((animalId) =>
        prisma.animalVaccination.create({
          data: {
            animalId,
            vaccinationId: data.vaccinationId,
            applicationDate: data.applicationDate || new Date(),
            doseNumber: data.doseNumber || 1,
            batchNumber: data.batchNumber,
            expirationDate: data.expirationDate,
            applicationSite: data.applicationSite,
            applicator: data.applicator,
            nextDoseDate,
            notes: data.notes,
          },
        })
      )
    );

    return { count: records.length, records };
  }

  /**
   * Get vaccination history for animal
   */
  async getAnimalVaccinations(accountId, animalId, query) {
    const { page, limit, skip } = parsePagination(query);

    const animal = await prisma.animal.findFirst({
      where: { id: animalId, accountId, deletedAt: null },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    const [records, total] = await Promise.all([
      prisma.animalVaccination.findMany({
        where: { animalId },
        include: { vaccination: true },
        orderBy: { applicationDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.animalVaccination.count({ where: { animalId } }),
    ]);

    return {
      records,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get animals due for vaccination
   */
  async getVaccinationAlerts(accountId, query) {
    const { page, limit, skip } = parsePagination(query);

    const daysAhead = parseInt(query.daysAhead, 10) || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const where = {
      nextDoseDate: { lte: targetDate },
      reminderSent: false,
      animal: {
        accountId,
        deletedAt: null,
        status: 'active',
      },
    };

    const [records, total] = await Promise.all([
      prisma.animalVaccination.findMany({
        where,
        include: {
          vaccination: true,
          animal: {
            select: {
              id: true,
              identifier: true,
              name: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { nextDoseDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.animalVaccination.count({ where }),
    ]);

    return {
      alerts: records,
      pagination: { page, limit, total },
    };
  }

  // ==================== HEALTH RECORDS ====================

  /**
   * Create health record (treatment, deworming, examination)
   */
  async createHealthRecord(accountId, data) {
    const animal = await prisma.animal.findFirst({
      where: { id: data.animalId, accountId, deletedAt: null },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    const record = await prisma.healthRecord.create({
      data: {
        animalId: data.animalId,
        type: data.type,
        date: data.date || new Date(),
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        treatment: data.treatment,
        medications: data.medications,
        followUpDate: data.followUpDate,
        followUpNotes: data.followUpNotes,
        outcome: data.outcome,
        veterinarian: data.veterinarian,
        attachments: data.attachments,
        notes: data.notes,
      },
      include: {
        animal: {
          select: { id: true, identifier: true, name: true },
        },
      },
    });

    return record;
  }

  /**
   * Get health records for animal
   */
  async getAnimalHealthRecords(accountId, animalId, query) {
    const { page, limit, skip } = parsePagination(query);

    const animal = await prisma.animal.findFirst({
      where: { id: animalId, accountId, deletedAt: null },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    const where = {
      animalId,
      ...(query.type && { type: query.type }),
    };

    const [records, total] = await Promise.all([
      prisma.healthRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.healthRecord.count({ where }),
    ]);

    return {
      records,
      pagination: { page, limit, total },
    };
  }

  // ==================== SANITARY CAMPAIGNS ====================

  /**
   * Create sanitary campaign
   */
  async createCampaign(accountId, data) {
    const campaign = await prisma.sanitaryCampaign.create({
      data: {
        accountId,
        name: data.name,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'planned',
        notes: data.notes,
      },
    });

    // Add vaccinations to campaign if provided
    if (data.vaccinationIds && data.vaccinationIds.length > 0) {
      await prisma.$transaction(
        data.vaccinationIds.map((vaccinationId) =>
          prisma.campaignVaccination.create({
            data: {
              campaignId: campaign.id,
              vaccinationId,
              targetCount: data.targetCount,
            },
          })
        )
      );
    }

    return this.getCampaign(accountId, campaign.id);
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(accountId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      accountId,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.sanitaryCampaign.findMany({
        where,
        include: {
          vaccinations: {
            include: {
              vaccination: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sanitaryCampaign.count({ where }),
    ]);

    return {
      campaigns,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(accountId, campaignId) {
    const campaign = await prisma.sanitaryCampaign.findFirst({
      where: { id: campaignId, accountId },
      include: {
        vaccinations: {
          include: {
            vaccination: true,
          },
        },
      },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    return campaign;
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(accountId, campaignId, status) {
    const campaign = await prisma.sanitaryCampaign.findFirst({
      where: { id: campaignId, accountId },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    const updated = await prisma.sanitaryCampaign.update({
      where: { id: campaignId },
      data: { status },
    });

    return updated;
  }

  /**
   * Get sanitary statistics
   */
  async getStats(accountId, dateRange) {
    const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

    const [vaccinations, treatments, dewormings, activeCampaigns] = await Promise.all([
      prisma.animalVaccination.count({
        where: {
          animal: { accountId },
          applicationDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.healthRecord.count({
        where: {
          animal: { accountId },
          type: 'treatment',
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.healthRecord.count({
        where: {
          animal: { accountId },
          type: 'deworming',
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.sanitaryCampaign.count({
        where: {
          accountId,
          status: 'active',
        },
      }),
    ]);

    // Get upcoming vaccination alerts
    const alertCount = await prisma.animalVaccination.count({
      where: {
        animal: { accountId, deletedAt: null, status: 'active' },
        nextDoseDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        reminderSent: false,
      },
    });

    return {
      vaccinationsApplied: vaccinations,
      treatments,
      dewormings,
      activeCampaigns,
      upcomingAlerts: alertCount,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }
}

module.exports = new SanitaryService();
