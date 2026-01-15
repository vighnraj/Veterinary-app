const { PrismaClient } = require('@prisma/client');
const config = require('./index');

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
