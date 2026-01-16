const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middlewares/auth');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get team members
router.get('/members', async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: {
        accountId: req.user.accountId,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Format response with combined name
    const formattedMembers = members.map(m => ({
      ...m,
      name: `${m.firstName} ${m.lastName}`.trim(),
    }));

    res.json({ members: formattedMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Erro ao buscar membros da equipe' });
  }
});

// Invite team member
router.post('/invite', requireRole('admin', 'owner'), async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está cadastrado no sistema' });
    }

    // Check account limits
    const account = await prisma.account.findUnique({
      where: { id: req.user.accountId },
      include: {
        plan: true,
        _count: { select: { users: true } },
      },
    });

    const maxUsers = account.plan?.maxUsers || 1;
    if (account._count.users >= maxUsers) {
      return res.status(400).json({
        message: `Limite de usuários atingido (${maxUsers}). Faça upgrade do plano.`,
      });
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invite = await prisma.teamInvite.create({
      data: {
        email,
        role: role || 'assistant',
        token,
        expiresAt,
        accountId: req.user.accountId,
        invitedById: req.user.id,
      },
    });

    // TODO: Send invitation email
    // await sendInvitationEmail(email, token, req.user.firstName);

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    res.status(500).json({ message: 'Erro ao enviar convite' });
  }
});

// Get pending invites
router.get('/invites/pending', requireRole('admin', 'owner'), async (req, res) => {
  try {
    const invites = await prisma.teamInvite.findMany({
      where: {
        accountId: req.user.accountId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invites });
  } catch (error) {
    console.error('Error fetching pending invites:', error);
    res.status(500).json({ message: 'Erro ao buscar convites pendentes' });
  }
});

// Cancel invite
router.delete('/invites/:id', requireRole('admin', 'owner'), async (req, res) => {
  try {
    const result = await prisma.teamInvite.deleteMany({
      where: {
        id: req.params.id,
        accountId: req.user.accountId,
        acceptedAt: null,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Convite não encontrado' });
    }

    res.json({ message: 'Convite cancelado' });
  } catch (error) {
    console.error('Error canceling invite:', error);
    res.status(500).json({ message: 'Erro ao cancelar convite' });
  }
});

// Update member role
router.patch('/members/:userId/role', requireRole('admin', 'owner'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'veterinarian', 'assistant', 'receptionist', 'user', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Função inválida' });
    }

    // Can't change own role
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'Você não pode alterar sua própria função' });
    }

    const result = await prisma.user.updateMany({
      where: {
        id: req.params.userId,
        accountId: req.user.accountId,
      },
      data: { role },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Membro não encontrado' });
    }

    res.json({ message: 'Função atualizada com sucesso' });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Erro ao atualizar função' });
  }
});

// Remove team member
router.delete('/members/:userId', requireRole('admin', 'owner'), async (req, res) => {
  try {
    // Can't remove yourself
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'Você não pode se remover da equipe' });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.params.userId,
        accountId: req.user.accountId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Membro não encontrado' });
    }

    // Can't remove owner
    if (user.role === 'owner') {
      return res.status(400).json({ message: 'Não é possível remover o proprietário da conta' });
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: req.params.userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    res.json({ message: 'Membro removido da equipe' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Erro ao remover membro' });
  }
});

module.exports = router;
