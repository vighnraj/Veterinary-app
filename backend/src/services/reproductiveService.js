const prisma = require('../config/database');
const AppError = require('../utils/appError');
const { parsePagination } = require('../utils/helpers');

class ReproductiveService {
  /**
   * Record heat detection
   */
  async recordHeat(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId, 'female');

    const record = await prisma.reproductiveRecord.create({
      data: {
        animalId: data.animalId,
        type: 'heat',
        date: data.date || new Date(),
        heatIntensity: data.heatIntensity,
        heatDuration: data.heatDuration,
        notes: data.notes,
      },
    });

    // Update animal reproductive status
    await prisma.animal.update({
      where: { id: data.animalId },
      data: { reproductiveStatus: 'open' },
    });

    return record;
  }

  /**
   * Record insemination
   */
  async recordInsemination(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId, 'female');

    const record = await prisma.reproductiveRecord.create({
      data: {
        animalId: data.animalId,
        type: 'insemination',
        date: data.date || new Date(),
        inseminationType: data.inseminationType,
        semenSource: data.semenSource,
        semenBatch: data.semenBatch,
        inseminationTime: data.inseminationTime,
        inseminator: data.inseminator,
        notes: data.notes,
      },
    });

    return record;
  }

  /**
   * Record pregnancy check
   */
  async recordPregnancyCheck(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId, 'female');

    const record = await prisma.reproductiveRecord.create({
      data: {
        animalId: data.animalId,
        type: 'pregnancy_check',
        date: data.date || new Date(),
        pregnancyResult: data.result,
        gestationDays: data.gestationDays,
        fetalCount: data.fetalCount,
        fetalSex: data.fetalSex,
        notes: data.notes,
      },
    });

    // Update animal reproductive status
    if (data.result === 'positive') {
      const expectedCalving = data.gestationDays
        ? new Date(Date.now() + (283 - data.gestationDays) * 24 * 60 * 60 * 1000)
        : null;

      await prisma.animal.update({
        where: { id: data.animalId },
        data: {
          reproductiveStatus: 'pregnant',
          expectedCalvingDate: expectedCalving,
        },
      });
    } else if (data.result === 'negative') {
      await prisma.animal.update({
        where: { id: data.animalId },
        data: {
          reproductiveStatus: 'open',
          expectedCalvingDate: null,
        },
      });
    }

    return record;
  }

  /**
   * Record birth
   */
  async recordBirth(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId, 'female');

    // Create birth record
    const record = await prisma.reproductiveRecord.create({
      data: {
        animalId: data.animalId,
        type: 'birth',
        date: data.date || new Date(),
        birthType: data.birthType,
        birthWeight: data.birthWeight,
        offspringId: data.offspringId,
        notes: data.notes,
      },
    });

    // Update mother's reproductive status
    await prisma.animal.update({
      where: { id: data.animalId },
      data: {
        reproductiveStatus: 'lactating',
        lastCalvingDate: data.date || new Date(),
        expectedCalvingDate: null,
        numberOfCalvings: { increment: 1 },
      },
    });

    // If offspring data provided, create the offspring animal
    if (data.offspring) {
      const offspring = await prisma.animal.create({
        data: {
          accountId,
          clientId: animal.clientId,
          propertyId: animal.propertyId,
          identifier: data.offspring.identifier,
          name: data.offspring.name,
          speciesId: animal.speciesId,
          breedId: animal.breedId,
          sex: data.offspring.sex,
          dateOfBirth: data.date || new Date(),
          birthWeight: data.birthWeight,
          damId: data.animalId,
          sireId: data.offspring.sireId,
          status: 'active',
        },
      });

      // Update birth record with offspring ID
      await prisma.reproductiveRecord.update({
        where: { id: record.id },
        data: { offspringId: offspring.id },
      });

      return { record, offspring };
    }

    return { record };
  }

  /**
   * Record abortion
   */
  async recordAbortion(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId, 'female');

    const record = await prisma.reproductiveRecord.create({
      data: {
        animalId: data.animalId,
        type: 'abortion',
        date: data.date || new Date(),
        gestationDays: data.gestationDays,
        notes: data.notes,
      },
    });

    // Update animal status
    await prisma.animal.update({
      where: { id: data.animalId },
      data: {
        reproductiveStatus: 'open',
        expectedCalvingDate: null,
      },
    });

    return record;
  }

  /**
   * Record andrological evaluation (males)
   */
  async recordAndrologicalEval(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId, 'male');

    const record = await prisma.reproductiveRecord.create({
      data: {
        animalId: data.animalId,
        type: 'andrological',
        date: data.date || new Date(),
        spermMotility: data.spermMotility,
        spermConcentration: data.spermConcentration,
        spermMorphology: data.spermMorphology,
        scrotalCircumference: data.scrotalCircumference,
        notes: data.notes,
      },
    });

    return record;
  }

  /**
   * Create reproductive procedure (AI, FTAI, ET, etc.)
   */
  async createProcedure(accountId, data) {
    const animal = await this.validateAnimal(accountId, data.animalId);

    const procedure = await prisma.reproductiveProcedure.create({
      data: {
        accountId,
        animalId: data.animalId,
        appointmentId: data.appointmentId,
        procedureType: data.procedureType,
        date: data.date || new Date(),
        protocolName: data.protocolName,
        protocolDay: data.protocolDay,
        protocolStartDate: data.protocolStartDate,
        semenBullId: data.semenBullId,
        semenBatch: data.semenBatch,
        embryoId: data.embryoId,
        embryoQuality: data.embryoQuality,
        embryoStage: data.embryoStage,
        result: data.result || 'pending',
        technician: data.technician,
        notes: data.notes,
        attachments: data.attachments,
      },
      include: {
        animal: {
          select: { id: true, identifier: true, name: true },
        },
      },
    });

    return procedure;
  }

  /**
   * Update procedure result
   */
  async updateProcedureResult(accountId, procedureId, data) {
    const procedure = await prisma.reproductiveProcedure.findFirst({
      where: { id: procedureId, accountId },
    });

    if (!procedure) {
      throw AppError.notFound('Procedure not found');
    }

    const updated = await prisma.reproductiveProcedure.update({
      where: { id: procedureId },
      data: {
        result: data.result,
        resultDate: data.resultDate || new Date(),
        embryosCollected: data.embryosCollected,
        embryosViable: data.embryosViable,
        embryosFrozen: data.embryosFrozen,
        notes: data.notes,
      },
    });

    // Update animal status based on result
    if (data.result === 'success' && procedure.procedureType.includes('insemination')) {
      await prisma.animal.update({
        where: { id: procedure.animalId },
        data: { reproductiveStatus: 'pregnant' },
      });
    }

    return updated;
  }

  /**
   * Get reproductive history for an animal
   */
  async getAnimalHistory(accountId, animalId, query) {
    const { page, limit, skip } = parsePagination(query);

    await this.validateAnimal(accountId, animalId);

    const [records, total] = await Promise.all([
      prisma.reproductiveRecord.findMany({
        where: { animalId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reproductiveRecord.count({ where: { animalId } }),
    ]);

    return {
      records,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get procedures for an animal
   */
  async getAnimalProcedures(accountId, animalId, query) {
    const { page, limit, skip } = parsePagination(query);

    await this.validateAnimal(accountId, animalId);

    const [procedures, total] = await Promise.all([
      prisma.reproductiveProcedure.findMany({
        where: { animalId },
        include: {
          appointment: {
            select: { id: true, scheduledDate: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reproductiveProcedure.count({ where: { animalId } }),
    ]);

    return {
      procedures,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get pregnant animals (alerts)
   */
  async getPregnantAnimals(accountId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      accountId,
      deletedAt: null,
      reproductiveStatus: 'pregnant',
    };

    // Filter by expected calving date range
    if (query.daysUntilCalving) {
      const days = parseInt(query.daysUntilCalving, 10);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      where.expectedCalvingDate = { lte: targetDate };
    }

    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
        },
        orderBy: { expectedCalvingDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.animal.count({ where }),
    ]);

    return {
      animals,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get reproductive summary stats
   */
  async getStats(accountId, dateRange) {
    const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();

    const [pregnantCount, inseminationsCount, birthsCount, abortionsCount] = await Promise.all([
      prisma.animal.count({
        where: {
          accountId,
          deletedAt: null,
          reproductiveStatus: 'pregnant',
        },
      }),
      prisma.reproductiveRecord.count({
        where: {
          animal: { accountId },
          type: 'insemination',
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.reproductiveRecord.count({
        where: {
          animal: { accountId },
          type: 'birth',
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.reproductiveRecord.count({
        where: {
          animal: { accountId },
          type: 'abortion',
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    // Calculate conception rate
    const pregnancyChecks = await prisma.reproductiveRecord.findMany({
      where: {
        animal: { accountId },
        type: 'pregnancy_check',
        date: { gte: startDate, lte: endDate },
      },
      select: { pregnancyResult: true },
    });

    const positiveCount = pregnancyChecks.filter((r) => r.pregnancyResult === 'positive').length;
    const conceptionRate = pregnancyChecks.length > 0 ? (positiveCount / pregnancyChecks.length) * 100 : 0;

    return {
      pregnantAnimals: pregnantCount,
      inseminations: inseminationsCount,
      births: birthsCount,
      abortions: abortionsCount,
      conceptionRate: Math.round(conceptionRate * 100) / 100,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  /**
   * Validate animal exists and belongs to account
   */
  async validateAnimal(accountId, animalId, expectedSex = null) {
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        accountId,
        deletedAt: null,
      },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    if (expectedSex && animal.sex !== expectedSex) {
      throw AppError.badRequest(`This procedure requires a ${expectedSex} animal`);
    }

    return animal;
  }
}

module.exports = new ReproductiveService();
