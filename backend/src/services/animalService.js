const prisma = require('../config/database');
const AppError = require('../utils/appError');
const { parsePagination, parseSort, buildWhereClause } = require('../utils/helpers');

class AnimalService {
  /**
   * Create a new animal
   */
  async create(accountId, data) {
    // Check animal limit based on plan
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { plan: true },
    });

    if (account.plan) {
      const animalCount = await prisma.animal.count({
        where: { accountId, deletedAt: null },
      });

      if (animalCount >= account.plan.maxAnimals) {
        throw AppError.forbidden(
          `Animal limit reached (${account.plan.maxAnimals}). Please upgrade your plan.`
        );
      }
    }

    // Verify client belongs to account
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, accountId, deletedAt: null },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    // Verify property if provided
    if (data.propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: data.propertyId, clientId: data.clientId, deletedAt: null },
      });

      if (!property) {
        throw AppError.notFound('Property not found');
      }
    }

    // Check for duplicate identifier
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        accountId,
        identifier: data.identifier,
        deletedAt: null,
      },
    });

    if (existingAnimal) {
      throw AppError.conflict('An animal with this identifier already exists');
    }

    const animal = await prisma.animal.create({
      data: {
        accountId,
        ...data,
      },
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
        species: true,
        breed: true,
        batch: { select: { id: true, name: true } },
        sire: { select: { id: true, identifier: true, name: true } },
        dam: { select: { id: true, identifier: true, name: true } },
      },
    });

    // Update batch animal count if assigned
    if (data.batchId) {
      await this.updateBatchCount(data.batchId);
    }

    return animal;
  }

  /**
   * Get all animals with pagination and filters
   */
  async findAll(accountId, query) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, ['identifier', 'name', 'createdAt', 'dateOfBirth']);

    const filters = {
      search: query.search,
      clientId: query.clientId,
      propertyId: query.propertyId,
      batchId: query.batchId,
      speciesId: query.speciesId,
      breedId: query.breedId,
      sex: query.sex,
      status: query.status,
      reproductiveStatus: query.reproductiveStatus,
      isActive: query.isActive,
    };

    const where = {
      accountId,
      deletedAt: null,
      ...buildWhereClause(filters, ['identifier', 'name', 'registrationNumber']),
    };

    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
          species: { select: { id: true, name: true } },
          breed: { select: { id: true, name: true } },
          batch: { select: { id: true, name: true } },
        },
        orderBy,
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
   * Get animal by ID
   */
  async findById(accountId, animalId) {
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        accountId,
        deletedAt: null,
      },
      include: {
        client: true,
        property: true,
        species: true,
        breed: true,
        batch: true,
        sire: {
          select: {
            id: true,
            identifier: true,
            name: true,
            sex: true,
            species: { select: { name: true } },
            breed: { select: { name: true } },
          },
        },
        dam: {
          select: {
            id: true,
            identifier: true,
            name: true,
            sex: true,
            species: { select: { name: true } },
            breed: { select: { name: true } },
          },
        },
        offspringSire: {
          where: { deletedAt: null },
          select: {
            id: true,
            identifier: true,
            name: true,
            sex: true,
            dateOfBirth: true,
          },
          take: 20,
        },
        offspringDam: {
          where: { deletedAt: null },
          select: {
            id: true,
            identifier: true,
            name: true,
            sex: true,
            dateOfBirth: true,
          },
          take: 20,
        },
        weightRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        healthRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        vaccinations: {
          include: { vaccination: true },
          orderBy: { applicationDate: 'desc' },
          take: 10,
        },
        reproductiveRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    return animal;
  }

  /**
   * Update animal
   */
  async update(accountId, animalId, data) {
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

    // Check for duplicate identifier if changed
    if (data.identifier && data.identifier !== animal.identifier) {
      const existingAnimal = await prisma.animal.findFirst({
        where: {
          accountId,
          identifier: data.identifier,
          deletedAt: null,
          id: { not: animalId },
        },
      });

      if (existingAnimal) {
        throw AppError.conflict('An animal with this identifier already exists');
      }
    }

    const oldBatchId = animal.batchId;

    const updated = await prisma.animal.update({
      where: { id: animalId },
      data,
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
        species: true,
        breed: true,
        batch: { select: { id: true, name: true } },
        sire: { select: { id: true, identifier: true, name: true } },
        dam: { select: { id: true, identifier: true, name: true } },
      },
    });

    // Update batch counts if changed
    if (oldBatchId !== data.batchId) {
      if (oldBatchId) await this.updateBatchCount(oldBatchId);
      if (data.batchId) await this.updateBatchCount(data.batchId);
    }

    return updated;
  }

  /**
   * Delete animal (soft delete)
   */
  async delete(accountId, animalId) {
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

    await prisma.animal.update({
      where: { id: animalId },
      data: { deletedAt: new Date(), isActive: false },
    });

    // Update batch count if was assigned
    if (animal.batchId) {
      await this.updateBatchCount(animal.batchId);
    }

    return { message: 'Animal deleted successfully' };
  }

  /**
   * Update animal status
   */
  async updateStatus(accountId, animalId, status, reason) {
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

    const updated = await prisma.animal.update({
      where: { id: animalId },
      data: {
        status,
        statusReason: reason,
        statusDate: new Date(),
        isActive: status === 'active',
      },
    });

    return updated;
  }

  /**
   * Record weight
   */
  async recordWeight(accountId, animalId, data) {
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

    const [weightRecord] = await prisma.$transaction([
      prisma.weightRecord.create({
        data: {
          animalId,
          weight: data.weight,
          unit: data.unit || 'kg',
          date: data.date || new Date(),
          bodyConditionScore: data.bodyConditionScore,
          notes: data.notes,
        },
      }),
      prisma.animal.update({
        where: { id: animalId },
        data: {
          currentWeight: data.weight,
          lastWeighingDate: data.date || new Date(),
          bodyConditionScore: data.bodyConditionScore,
        },
      }),
    ]);

    return weightRecord;
  }

  /**
   * Get weight history
   */
  async getWeightHistory(accountId, animalId, query) {
    const { page, limit, skip } = parsePagination(query);

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

    const [records, total] = await Promise.all([
      prisma.weightRecord.findMany({
        where: { animalId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.weightRecord.count({ where: { animalId } }),
    ]);

    return {
      records,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get animal genealogy tree
   */
  async getGenealogy(accountId, animalId, generations = 3) {
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        accountId,
        deletedAt: null,
      },
      include: {
        species: { select: { name: true } },
        breed: { select: { name: true } },
      },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    // Build ancestry tree recursively
    const buildAncestry = async (id, currentGen) => {
      if (!id || currentGen > generations) return null;

      const a = await prisma.animal.findUnique({
        where: { id },
        select: {
          id: true,
          identifier: true,
          name: true,
          sex: true,
          dateOfBirth: true,
          sireId: true,
          damId: true,
          species: { select: { name: true } },
          breed: { select: { name: true } },
        },
      });

      if (!a) return null;

      return {
        ...a,
        sire: await buildAncestry(a.sireId, currentGen + 1),
        dam: await buildAncestry(a.damId, currentGen + 1),
      };
    };

    // Get offspring
    const offspring = await prisma.animal.findMany({
      where: {
        deletedAt: null,
        OR: [{ sireId: animalId }, { damId: animalId }],
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        sex: true,
        dateOfBirth: true,
        species: { select: { name: true } },
        breed: { select: { name: true } },
      },
      orderBy: { dateOfBirth: 'desc' },
    });

    return {
      animal: {
        ...animal,
        sire: await buildAncestry(animal.sireId, 1),
        dam: await buildAncestry(animal.damId, 1),
      },
      offspring,
    };
  }

  // ==================== BATCH METHODS ====================

  /**
   * Create batch
   */
  async createBatch(accountId, data) {
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, accountId, deletedAt: null },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    const batch = await prisma.batch.create({
      data: {
        accountId,
        ...data,
      },
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return batch;
  }

  /**
   * Get all batches
   */
  async findAllBatches(accountId, query) {
    const { page, limit, skip } = parsePagination(query);

    const where = {
      accountId,
      deletedAt: null,
      ...(query.clientId && { clientId: query.clientId }),
      ...(query.propertyId && { propertyId: query.propertyId }),
      ...(query.category && { category: query.category }),
    };

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
          _count: {
            select: { animals: { where: { deletedAt: null } } },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.batch.count({ where }),
    ]);

    return {
      batches,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get batch by ID
   */
  async findBatchById(accountId, batchId) {
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        accountId,
        deletedAt: null,
      },
      include: {
        client: true,
        property: true,
        animals: {
          where: { deletedAt: null },
          include: {
            species: { select: { name: true } },
            breed: { select: { name: true } },
          },
        },
      },
    });

    if (!batch) {
      throw AppError.notFound('Batch not found');
    }

    return batch;
  }

  /**
   * Update batch
   */
  async updateBatch(accountId, batchId, data) {
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        accountId,
        deletedAt: null,
      },
    });

    if (!batch) {
      throw AppError.notFound('Batch not found');
    }

    const updated = await prisma.batch.update({
      where: { id: batchId },
      data,
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  /**
   * Delete batch
   */
  async deleteBatch(accountId, batchId) {
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        accountId,
        deletedAt: null,
      },
    });

    if (!batch) {
      throw AppError.notFound('Batch not found');
    }

    // Remove animals from batch before deleting
    await prisma.$transaction([
      prisma.animal.updateMany({
        where: { batchId },
        data: { batchId: null },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { deletedAt: new Date(), isActive: false },
      }),
    ]);

    return { message: 'Batch deleted successfully' };
  }

  /**
   * Add animals to batch
   */
  async addAnimalsToBatch(accountId, batchId, animalIds) {
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        accountId,
        deletedAt: null,
      },
    });

    if (!batch) {
      throw AppError.notFound('Batch not found');
    }

    // Update animals
    await prisma.animal.updateMany({
      where: {
        id: { in: animalIds },
        accountId,
        deletedAt: null,
      },
      data: { batchId },
    });

    await this.updateBatchCount(batchId);

    return { message: 'Animals added to batch successfully' };
  }

  /**
   * Remove animals from batch
   */
  async removeAnimalsFromBatch(accountId, batchId, animalIds) {
    await prisma.animal.updateMany({
      where: {
        id: { in: animalIds },
        batchId,
        deletedAt: null,
      },
      data: { batchId: null },
    });

    await this.updateBatchCount(batchId);

    return { message: 'Animals removed from batch successfully' };
  }

  /**
   * Update batch animal count
   */
  async updateBatchCount(batchId) {
    const count = await prisma.animal.count({
      where: { batchId, deletedAt: null },
    });

    await prisma.batch.update({
      where: { id: batchId },
      data: { totalAnimals: count },
    });
  }

  // ==================== SPECIES & BREEDS ====================

  /**
   * Get all species
   */
  async getSpecies() {
    return prisma.species.findMany({
      where: { isActive: true },
      include: {
        breeds: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get breeds by species
   */
  async getBreedsBySpecies(speciesId) {
    return prisma.breed.findMany({
      where: { speciesId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

module.exports = new AnimalService();
