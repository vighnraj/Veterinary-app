const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

/**
 * Email Service
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  /**
   * Send email
   */
  async send(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Email error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email, token, firstName) {
    const verificationUrl = `${config.urls.frontend}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VetSaaS</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Hello ${firstName},</p>
            <p>Thank you for registering with VetSaaS. Please click the button below to verify your email address:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VetSaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(email, 'Verify Your Email - VetSaaS', html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token, firstName) {
    const resetUrl = `${config.urls.frontend}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VetSaaS</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${firstName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VetSaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(email, 'Reset Your Password - VetSaaS', html);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, firstName, trialDays) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { padding: 10px 0; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to VetSaaS!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Welcome to VetSaaS - your complete veterinary management solution for large animals.</p>
            <p>You have <strong>${trialDays} days</strong> of free trial to explore all our features:</p>
            <div class="feature">✓ Client & Property Management</div>
            <div class="feature">✓ Animal Registry with Genealogy</div>
            <div class="feature">✓ Reproductive Management (AI, FTAI, ET)</div>
            <div class="feature">✓ Sanitary Control & Campaigns</div>
            <div class="feature">✓ Appointment Scheduling</div>
            <div class="feature">✓ Financial Control & Invoicing</div>
            <div class="feature">✓ PDF Reports</div>
            <p style="text-align: center;">
              <a href="${config.urls.frontend}/dashboard" class="button">Get Started</a>
            </p>
            <p>Need help? Our support team is here for you.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VetSaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(email, 'Welcome to VetSaaS!', html);
  }

  /**
   * Send trial ending reminder
   */
  async sendTrialEndingEmail(email, firstName, daysLeft) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Trial Ending Soon</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Your VetSaaS trial will expire in <strong>${daysLeft} days</strong>.</p>
            <p>Don't lose access to all your data and features. Subscribe now to continue using VetSaaS.</p>
            <p style="text-align: center;">
              <a href="${config.urls.frontend}/subscription" class="button">Choose a Plan</a>
            </p>
            <p>Questions? Contact our support team anytime.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VetSaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(email, 'Your VetSaaS Trial is Ending Soon', html);
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(email, firstName, appointment) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>This is a reminder for your upcoming appointment:</p>
            <div class="info-box">
              <p><strong>Date:</strong> ${appointment.date}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
              <p><strong>Client:</strong> ${appointment.clientName}</p>
              <p><strong>Service:</strong> ${appointment.serviceName}</p>
              ${appointment.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ''}
            </div>
            <p>See you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VetSaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(email, `Appointment Reminder - ${appointment.date}`, html);
  }
}

module.exports = new EmailService();
