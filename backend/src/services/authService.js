const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const emailService = require('../utils/email');
const { generateToken, addDays } = require('../utils/helpers');
const AppError = require('../utils/appError');

class AuthService {
  /**
   * Register new account and user
   */
  async register({ email, password, firstName, lastName, accountName, phone }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerifyToken = generateToken();
    const emailVerifyExpires = addDays(new Date(), 1);

    // Calculate trial end date
    const trialEndsAt = addDays(new Date(), config.trialDays);

    // Create account and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create account
      const account = await tx.account.create({
        data: {
          name: accountName || `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          phone,
          subscriptionStatus: 'trialing',
          trialEndsAt,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          accountId: account.id,
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'owner',
          emailVerifyToken,
          emailVerifyExpires,
        },
      });

      return { account, user };
    });

    // Send verification email (don't wait)
    emailService
      .sendVerificationEmail(email, emailVerifyToken, firstName)
      .catch((err) => console.error('Email send error:', err));

    return {
      user: this.sanitizeUser(result.user),
      account: this.sanitizeAccount(result.account),
    };
  }

  /**
   * Login user
   */
  async login({ email, password, ipAddress, userAgent }) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        account: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive || user.deletedAt) {
      throw AppError.unauthorized('Account is deactivated');
    }

    // Check if account is active
    if (!user.account.isActive) {
      throw AppError.forbidden('Account is suspended');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Update user with refresh token and login info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokens.refreshToken,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        accountId: user.accountId,
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return {
      user: this.sanitizeUser(user),
      account: this.sanitizeAccount(user.account),
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        account: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    if (!user.isActive || user.deletedAt) {
      throw AppError.unauthorized('Account is deactivated');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user);

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: this.sanitizeUser(user),
      account: this.sanitizeAccount(user.account),
      tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    // Send welcome email
    emailService
      .sendWelcomeEmail(user.email, user.firstName, config.trialDays)
      .catch((err) => console.error('Welcome email error:', err));

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.emailVerified) {
      throw AppError.badRequest('Email is already verified');
    }

    const emailVerifyToken = generateToken();
    const emailVerifyExpires = addDays(new Date(), 1);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpires },
    });

    await emailService.sendVerificationEmail(user.email, emailVerifyToken, user.firstName);

    return { message: 'Verification email sent' };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const passwordResetToken = generateToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpires },
    });

    await emailService.sendPasswordResetEmail(user.email, passwordResetToken, user.firstName);

    return { message: 'Password reset email sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null, // Invalidate existing sessions
      },
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Change password (logged in user)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null, // Invalidate other sessions
      },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      user: this.sanitizeUser(user),
      account: this.sanitizeAccount(user.account),
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
      },
      include: {
        account: true,
      },
    });

    return this.sanitizeUser(user);
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(user) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        accountId: user.accountId,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Remove sensitive fields from user object
   */
  sanitizeUser(user) {
    const { password, refreshToken, emailVerifyToken, passwordResetToken, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Remove sensitive fields from account object
   */
  sanitizeAccount(account) {
    const { fiscalPassword, fiscalCertificate, ...sanitized } = account;
    return sanitized;
  }
}

module.exports = new AuthService();
