const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all services
router.get('/', async (req, res) => {
  try {
    const { search, category, active, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      accountId: req.user.accountId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(category && { category }),
      ...(active !== undefined && { isActive: active === 'true' }),
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.service.count({ where }),
    ]);

    // Map to simpler response format
    const formattedServices = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.defaultPrice ? parseFloat(s.defaultPrice) : null,
      duration: s.estimatedDurationMinutes,
      active: s.isActive,
    }));

    res.json({
      services: formattedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Erro ao buscar serviços' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
    });

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.defaultPrice ? parseFloat(service.defaultPrice) : null,
      priceUnit: service.priceUnit,
      duration: service.estimatedDurationMinutes,
      requiresAnimal: service.requiresAnimal,
      requiresBatch: service.requiresBatch,
      active: service.isActive,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Erro ao buscar serviço' });
  }
});

// Create service
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      priceUnit,
      duration,
      requiresAnimal,
      requiresBatch,
      active
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        category: category || 'clinical',
        defaultPrice: price ? parseFloat(price) : 0,
        priceUnit: priceUnit || 'per_animal',
        estimatedDurationMinutes: duration ? parseInt(duration) : null,
        requiresAnimal: requiresAnimal !== undefined ? requiresAnimal : true,
        requiresBatch: requiresBatch !== undefined ? requiresBatch : false,
        isActive: active !== undefined ? active : true,
        accountId: req.user.accountId,
      },
    });

    res.status(201).json({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.defaultPrice ? parseFloat(service.defaultPrice) : null,
      duration: service.estimatedDurationMinutes,
      active: service.isActive,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Erro ao criar serviço' });
  }
});

// Update service
router.patch('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      priceUnit,
      duration,
      requiresAnimal,
      requiresBatch,
      active
    } = req.body;

    const existing = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { defaultPrice: parseFloat(price) }),
        ...(priceUnit !== undefined && { priceUnit }),
        ...(duration !== undefined && { estimatedDurationMinutes: parseInt(duration) }),
        ...(requiresAnimal !== undefined && { requiresAnimal }),
        ...(requiresBatch !== undefined && { requiresBatch }),
        ...(active !== undefined && { isActive: active }),
      },
    });

    res.json({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.defaultPrice ? parseFloat(service.defaultPrice) : null,
      duration: service.estimatedDurationMinutes,
      active: service.isActive,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Erro ao atualizar serviço' });
  }
});

// Delete service (soft delete by deactivating)
router.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.service.updateMany({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
      },
      data: {
        isActive: false,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json({ message: 'Serviço desativado com sucesso' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Erro ao excluir serviço' });
  }
});

module.exports = router;
