const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get profile
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        account: {
          select: {
            id: true,
            name: true,
            subscriptionStatus: true,
            plan: {
              select: {
                id: true,
                name: true,
                maxUsers: true,
                maxAnimals: true,
                maxClients: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Format response with combined name
    const response = {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// Update profile
router.patch('/', async (req, res) => {
  try {
    const { firstName, lastName, phone, name } = req.body;

    // If name is provided, split it into firstName and lastName
    let updateData = {};
    if (name) {
      const nameParts = name.trim().split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });

    res.json({
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Nova senha deve ter no mínimo 8 caracteres' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

// Upload avatar
router.post('/avatar', async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: 'URL do avatar é obrigatória' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Erro ao atualizar avatar' });
  }
});

// Delete account request
router.post('/delete-account', async (req, res) => {
  try {
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Senha é obrigatória para confirmar exclusão' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true, role: true },
    });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Create deletion request
    await prisma.accountDeletionRequest.create({
      data: {
        userId: req.user.id,
        accountId: req.user.accountId,
        reason,
        scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: 'Solicitação de exclusão registrada. Sua conta será excluída em 30 dias.',
    });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ message: 'Erro ao solicitar exclusão da conta' });
  }
});

module.exports = router;
