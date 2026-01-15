const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');
const config = require('../config');
const AppError = require('../utils/appError');
const { formatCurrency } = require('../utils/helpers');
const dayjs = require('dayjs');

class ReportService {
  /**
   * Generate appointment report PDF
   */
  async generateAppointmentReport(accountId, appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, accountId },
      include: {
        client: true,
        user: true,
        appointmentAnimals: {
          include: {
            animal: {
              include: {
                species: true,
                breed: true,
              },
            },
          },
        },
        appointmentServices: {
          include: { service: true },
        },
        reproductiveProcedures: true,
      },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    const filename = `appointment-${appointmentId}-${Date.now()}.pdf`;
    const filepath = path.join(config.upload.path, 'reports', filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(account.name, { align: 'center' });
      doc.fontSize(12).text('Technical Report', { align: 'center' });
      doc.moveDown();

      // Report info
      doc.fontSize(14).text('Appointment Details', { underline: true });
      doc.fontSize(10);
      doc.text(`Date: ${dayjs(appointment.scheduledDate).format('DD/MM/YYYY HH:mm')}`);
      doc.text(`Status: ${appointment.status}`);
      doc.text(`Veterinarian: ${appointment.user?.firstName} ${appointment.user?.lastName || ''}`);
      doc.moveDown();

      // Client info
      doc.fontSize(14).text('Client Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Name: ${appointment.client.name}`);
      doc.text(`Phone: ${appointment.client.phone || 'N/A'}`);
      doc.text(`Email: ${appointment.client.email || 'N/A'}`);
      if (appointment.client.address) {
        doc.text(`Address: ${appointment.client.address}`);
      }
      doc.moveDown();

      // Animals
      if (appointment.appointmentAnimals.length > 0) {
        doc.fontSize(14).text('Animals', { underline: true });
        doc.fontSize(10);

        appointment.appointmentAnimals.forEach((aa, index) => {
          const animal = aa.animal;
          doc.text(`${index + 1}. ${animal.identifier} - ${animal.name || 'N/A'}`);
          doc.text(`   Species: ${animal.species?.name || 'N/A'}, Breed: ${animal.breed?.name || 'N/A'}`);
          doc.text(`   Sex: ${animal.sex}, Status: ${animal.status}`);
          if (aa.notes) {
            doc.text(`   Notes: ${aa.notes}`);
          }
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Services
      if (appointment.appointmentServices.length > 0) {
        doc.fontSize(14).text('Services Performed', { underline: true });
        doc.fontSize(10);

        appointment.appointmentServices.forEach((as) => {
          doc.text(`• ${as.service.name}`);
          doc.text(`  Quantity: ${as.quantity}, Price: ${formatCurrency(as.totalPrice)}`);
        });
        doc.moveDown();
      }

      // Procedures
      if (appointment.reproductiveProcedures.length > 0) {
        doc.fontSize(14).text('Reproductive Procedures', { underline: true });
        doc.fontSize(10);

        appointment.reproductiveProcedures.forEach((proc) => {
          doc.text(`• ${proc.procedureType} - ${dayjs(proc.date).format('DD/MM/YYYY')}`);
          if (proc.result) doc.text(`  Result: ${proc.result}`);
          if (proc.notes) doc.text(`  Notes: ${proc.notes}`);
        });
        doc.moveDown();
      }

      // Notes
      if (appointment.notes) {
        doc.fontSize(14).text('Notes', { underline: true });
        doc.fontSize(10).text(appointment.notes);
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8)
        .text(`Generated on ${dayjs().format('DD/MM/YYYY HH:mm')}`, 50, doc.page.height - 50, {
          align: 'center',
        });

      doc.end();

      stream.on('finish', async () => {
        // Update appointment with report URL
        const reportUrl = `${config.urls.backend}/uploads/reports/${filename}`;
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { reportGenerated: true, reportUrl },
        });

        resolve({ filename, filepath, url: reportUrl });
      });

      stream.on('error', reject);
    });
  }

  /**
   * Generate animal report PDF
   */
  async generateAnimalReport(accountId, animalId) {
    const animal = await prisma.animal.findFirst({
      where: { id: animalId, accountId, deletedAt: null },
      include: {
        client: true,
        property: true,
        species: true,
        breed: true,
        sire: { select: { identifier: true, name: true } },
        dam: { select: { identifier: true, name: true } },
        weightRecords: { orderBy: { date: 'desc' }, take: 10 },
        vaccinations: {
          include: { vaccination: true },
          orderBy: { applicationDate: 'desc' },
          take: 10,
        },
        reproductiveRecords: { orderBy: { date: 'desc' }, take: 10 },
        healthRecords: { orderBy: { date: 'desc' }, take: 10 },
      },
    });

    if (!animal) {
      throw AppError.notFound('Animal not found');
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    const filename = `animal-${animalId}-${Date.now()}.pdf`;
    const filepath = path.join(config.upload.path, 'reports', filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(account.name, { align: 'center' });
      doc.fontSize(12).text('Animal Report', { align: 'center' });
      doc.moveDown();

      // Animal identification
      doc.fontSize(14).text('Identification', { underline: true });
      doc.fontSize(10);
      doc.text(`ID: ${animal.identifier}`);
      doc.text(`Name: ${animal.name || 'N/A'}`);
      doc.text(`Registration: ${animal.registrationNumber || 'N/A'}`);
      doc.text(`Species: ${animal.species?.name || 'N/A'}`);
      doc.text(`Breed: ${animal.breed?.name || animal.crossBreed || 'N/A'}`);
      doc.text(`Sex: ${animal.sex}`);
      doc.text(`Date of Birth: ${animal.dateOfBirth ? dayjs(animal.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}`);
      doc.text(`Status: ${animal.status}`);
      doc.moveDown();

      // Owner
      doc.fontSize(14).text('Owner', { underline: true });
      doc.fontSize(10);
      doc.text(`Client: ${animal.client.name}`);
      doc.text(`Property: ${animal.property?.name || 'N/A'}`);
      doc.moveDown();

      // Genealogy
      doc.fontSize(14).text('Genealogy', { underline: true });
      doc.fontSize(10);
      doc.text(`Sire: ${animal.sire ? `${animal.sire.identifier} - ${animal.sire.name || 'N/A'}` : 'Unknown'}`);
      doc.text(`Dam: ${animal.dam ? `${animal.dam.identifier} - ${animal.dam.name || 'N/A'}` : 'Unknown'}`);
      doc.moveDown();

      // Physical characteristics
      doc.fontSize(14).text('Physical Characteristics', { underline: true });
      doc.fontSize(10);
      doc.text(`Current Weight: ${animal.currentWeight ? `${animal.currentWeight} kg` : 'N/A'}`);
      doc.text(`Body Condition Score: ${animal.bodyConditionScore || 'N/A'}`);
      doc.text(`Coat Color: ${animal.coatColor || 'N/A'}`);
      if (animal.markings) doc.text(`Markings: ${animal.markings}`);
      doc.moveDown();

      // Weight history
      if (animal.weightRecords.length > 0) {
        doc.fontSize(14).text('Weight History (Last 10)', { underline: true });
        doc.fontSize(10);
        animal.weightRecords.forEach((wr) => {
          doc.text(`${dayjs(wr.date).format('DD/MM/YYYY')}: ${wr.weight} ${wr.unit}`);
        });
        doc.moveDown();
      }

      // Vaccination history
      if (animal.vaccinations.length > 0) {
        doc.fontSize(14).text('Vaccination History', { underline: true });
        doc.fontSize(10);
        animal.vaccinations.forEach((v) => {
          doc.text(`${dayjs(v.applicationDate).format('DD/MM/YYYY')}: ${v.vaccination.name} (Dose ${v.doseNumber})`);
        });
        doc.moveDown();
      }

      // Reproductive status (females)
      if (animal.sex === 'female') {
        doc.fontSize(14).text('Reproductive Status', { underline: true });
        doc.fontSize(10);
        doc.text(`Status: ${animal.reproductiveStatus || 'N/A'}`);
        doc.text(`Number of Calvings: ${animal.numberOfCalvings}`);
        doc.text(`Last Calving: ${animal.lastCalvingDate ? dayjs(animal.lastCalvingDate).format('DD/MM/YYYY') : 'N/A'}`);
        doc.text(`Expected Calving: ${animal.expectedCalvingDate ? dayjs(animal.expectedCalvingDate).format('DD/MM/YYYY') : 'N/A'}`);
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8)
        .text(`Generated on ${dayjs().format('DD/MM/YYYY HH:mm')}`, 50, doc.page.height - 50, {
          align: 'center',
        });

      doc.end();

      stream.on('finish', () => {
        const url = `${config.urls.backend}/uploads/reports/${filename}`;
        resolve({ filename, filepath, url });
      });

      stream.on('error', reject);
    });
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(accountId, invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, accountId },
      include: {
        client: true,
        items: {
          include: {
            service: true,
            animal: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
    const filepath = path.join(config.upload.path, 'reports', filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(account.name, { align: 'center' });
      doc.fontSize(12).text('INVOICE', { align: 'center' });
      doc.moveDown();

      // Invoice info
      doc.fontSize(10);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`);
      doc.text(`Issue Date: ${dayjs(invoice.issueDate).format('DD/MM/YYYY')}`);
      doc.text(`Due Date: ${dayjs(invoice.dueDate).format('DD/MM/YYYY')}`);
      doc.text(`Status: ${invoice.status.toUpperCase()}`);
      doc.moveDown();

      // Client info
      doc.fontSize(12).text('Bill To:', { underline: true });
      doc.fontSize(10);
      doc.text(invoice.client.name);
      if (invoice.client.document) doc.text(`Document: ${invoice.client.document}`);
      if (invoice.client.address) doc.text(invoice.client.address);
      if (invoice.client.phone) doc.text(`Phone: ${invoice.client.phone}`);
      doc.moveDown();

      // Items table
      doc.fontSize(12).text('Items:', { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(9);
      doc.text('Description', 50, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Unit Price', 350, tableTop);
      doc.text('Total', 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 25;
      invoice.items.forEach((item) => {
        doc.text(item.description, 50, y);
        doc.text(String(item.quantity), 300, y);
        doc.text(formatCurrency(item.unitPrice), 350, y);
        doc.text(formatCurrency(item.totalPrice), 450, y);
        y += 20;
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 15;

      // Totals
      doc.text('Subtotal:', 350, y);
      doc.text(formatCurrency(invoice.subtotal), 450, y);
      y += 15;

      if (Number(invoice.discountAmount) > 0) {
        doc.text(`Discount (${invoice.discountPercent}%):`, 350, y);
        doc.text(`-${formatCurrency(invoice.discountAmount)}`, 450, y);
        y += 15;
      }

      if (Number(invoice.taxAmount) > 0) {
        doc.text(`Tax (${invoice.taxPercent}%):`, 350, y);
        doc.text(formatCurrency(invoice.taxAmount), 450, y);
        y += 15;
      }

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total:', 350, y);
      doc.text(formatCurrency(invoice.totalAmount), 450, y);

      doc.font('Helvetica').fontSize(10);
      y += 20;
      doc.text('Paid:', 350, y);
      doc.text(formatCurrency(invoice.paidAmount), 450, y);
      y += 15;
      doc.text('Balance:', 350, y);
      doc.text(formatCurrency(Number(invoice.totalAmount) - Number(invoice.paidAmount)), 450, y);

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(10).text('Notes:', { underline: true });
        doc.text(invoice.notes);
      }

      // Footer
      doc.fontSize(8)
        .text(`Generated on ${dayjs().format('DD/MM/YYYY HH:mm')}`, 50, doc.page.height - 50, {
          align: 'center',
        });

      doc.end();

      stream.on('finish', () => {
        const url = `${config.urls.backend}/uploads/reports/${filename}`;
        resolve({ filename, filepath, url });
      });

      stream.on('error', reject);
    });
  }

  /**
   * Generate financial summary report
   */
  async generateFinancialReport(accountId, startDate, endDate) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        accountId,
        issueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        client: { select: { name: true } },
        items: { include: { service: true } },
      },
      orderBy: { issueDate: 'asc' },
    });

    const filename = `financial-report-${Date.now()}.pdf`;
    const filepath = path.join(config.upload.path, 'reports', filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(account.name, { align: 'center' });
      doc.fontSize(12).text('Financial Report', { align: 'center' });
      doc.fontSize(10).text(
        `Period: ${dayjs(startDate).format('DD/MM/YYYY')} - ${dayjs(endDate).format('DD/MM/YYYY')}`,
        { align: 'center' }
      );
      doc.moveDown();

      // Summary
      const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
      const totalPaid = invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0);
      const totalPending = totalInvoiced - totalPaid;

      doc.fontSize(14).text('Summary', { underline: true });
      doc.fontSize(10);
      doc.text(`Total Invoiced: ${formatCurrency(totalInvoiced)}`);
      doc.text(`Total Received: ${formatCurrency(totalPaid)}`);
      doc.text(`Total Pending: ${formatCurrency(totalPending)}`);
      doc.text(`Number of Invoices: ${invoices.length}`);
      doc.moveDown();

      // Invoice list
      doc.fontSize(14).text('Invoice List', { underline: true });
      doc.moveDown(0.5);

      invoices.forEach((inv) => {
        doc.fontSize(9);
        doc.text(`${inv.invoiceNumber} | ${dayjs(inv.issueDate).format('DD/MM/YYYY')} | ${inv.client.name} | ${formatCurrency(inv.totalAmount)} | ${inv.status}`);
      });

      // Footer
      doc.fontSize(8)
        .text(`Generated on ${dayjs().format('DD/MM/YYYY HH:mm')}`, 50, doc.page.height - 50, {
          align: 'center',
        });

      doc.end();

      stream.on('finish', () => {
        const url = `${config.urls.backend}/uploads/reports/${filename}`;
        resolve({ filename, filepath, url });
      });

      stream.on('error', reject);
    });
  }
}

module.exports = new ReportService();
