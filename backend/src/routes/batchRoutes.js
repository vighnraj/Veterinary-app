const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all batches
router.get('/', async (req, res) => {
  try {
    const { search, clientId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      accountId: req.user.accountId,
      deletedAt: null,
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true },
          },
          property: {
            select: { id: true, name: true },
          },
          _count: { select: { animals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.batch.count({ where }),
    ]);

    res.json({
      batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Erro ao buscar lotes' });
  }
});

// Get batch by ID
router.get('/:id', async (req, res) => {
  try {
    const batch = await prisma.batch.findFirst({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        property: {
          select: { id: true, name: true },
        },
        animals: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            identifier: true,
            sex: true,
            species: { select: { name: true } },
            breed: { select: { name: true } },
          },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }

    res.json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ message: 'Erro ao buscar lote' });
  }
});

// Create batch
router.post('/', async (req, res) => {
  try {
    const { name, description, clientId, propertyId, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente é obrigatório' });
    }

    // Verify client belongs to account
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        accountId: req.user.accountId,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        description,
        category,
        clientId,
        propertyId: propertyId || null,
        accountId: req.user.accountId,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(batch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Erro ao criar lote' });
  }
});

// Update batch
router.patch('/:id', async (req, res) => {
  try {
    const { name, description, category, propertyId } = req.body;

    const existing = await prisma.batch.findFirst({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }

    const batch = await prisma.batch.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(propertyId !== undefined && { propertyId }),
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    res.json(batch);
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ message: 'Erro ao atualizar lote' });
  }
});

// Delete batch (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    // First, remove all animals from the batch
    await prisma.animal.updateMany({
      where: {
        batchId: req.params.id,
        accountId: req.user.accountId,
      },
      data: {
        batchId: null,
      },
    });

    // Soft delete the batch
    const result = await prisma.batch.updateMany({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }

    res.json({ message: 'Lote excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Erro ao excluir lote' });
  }
});

// Add animals to batch
router.post('/:id/animals', async (req, res) => {
  try {
    const { animalIds } = req.body;

    if (!animalIds || !Array.isArray(animalIds) || animalIds.length === 0) {
      return res.status(400).json({ message: 'Lista de animais é obrigatória' });
    }

    // Verify batch exists
    const batch = await prisma.batch.findFirst({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
    });

    if (!batch) {
      return res.status(404).json({ message: 'Lote não encontrado' });
    }

    await prisma.animal.updateMany({
      where: {
        id: { in: animalIds },
        accountId: req.user.accountId,
      },
      data: {
        batchId: req.params.id,
      },
    });

    // Update batch animal count
    const count = await prisma.animal.count({
      where: { batchId: req.params.id },
    });

    await prisma.batch.update({
      where: { id: req.params.id },
      data: { totalAnimals: count },
    });

    const updatedBatch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        animals: {
          select: {
            id: true,
            name: true,
            identifier: true,
          },
        },
        _count: { select: { animals: true } },
      },
    });

    res.json(updatedBatch);
  } catch (error) {
    console.error('Error adding animals to batch:', error);
    res.status(500).json({ message: 'Erro ao adicionar animais ao lote' });
  }
});

// Remove animal from batch
router.delete('/:id/animals/:animalId', async (req, res) => {
  try {
    const result = await prisma.animal.updateMany({
      where: {
        id: req.params.animalId,
        batchId: req.params.id,
        accountId: req.user.accountId,
      },
      data: {
        batchId: null,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Animal não encontrado no lote' });
    }

    // Update batch animal count
    const count = await prisma.animal.count({
      where: { batchId: req.params.id },
    });

    await prisma.batch.update({
      where: { id: req.params.id },
      data: { totalAnimals: count },
    });

    res.json({ message: 'Animal removido do lote' });
  } catch (error) {
    console.error('Error removing animal from batch:', error);
    res.status(500).json({ message: 'Erro ao remover animal do lote' });
  }
});

module.exports = router;
