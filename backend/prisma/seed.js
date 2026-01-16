const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: 'plan-basic' },
      update: {},
      create: {
        id: 'plan-basic',
        name: 'Basic',
        description: 'Perfect for small veterinary practices',
        priceMonthly: 99.90,
        priceYearly: 999.90,
        maxUsers: 2,
        maxAnimals: 500,
        maxClients: 100,
        maxStorageGB: 5,
        features: {
          clients: true,
          animals: true,
          appointments: true,
          invoicing: true,
          reproductive: true,
          sanitary: true,
          reports_basic: true,
          reports_advanced: false,
          financial_reports: false,
          api_access: false,
        },
        sortOrder: 1,
      },
    }),
    prisma.plan.upsert({
      where: { id: 'plan-pro' },
      update: {},
      create: {
        id: 'plan-pro',
        name: 'Professional',
        description: 'For growing veterinary practices',
        priceMonthly: 199.90,
        priceYearly: 1999.90,
        maxUsers: 5,
        maxAnimals: 2000,
        maxClients: 500,
        maxStorageGB: 20,
        features: {
          clients: true,
          animals: true,
          appointments: true,
          invoicing: true,
          reproductive: true,
          sanitary: true,
          reports_basic: true,
          reports_advanced: true,
          financial_reports: true,
          api_access: false,
        },
        sortOrder: 2,
      },
    }),
    prisma.plan.upsert({
      where: { id: 'plan-enterprise' },
      update: {},
      create: {
        id: 'plan-enterprise',
        name: 'Enterprise',
        description: 'For large veterinary operations',
        priceMonthly: 499.90,
        priceYearly: 4999.90,
        maxUsers: 20,
        maxAnimals: 10000,
        maxClients: 2000,
        maxStorageGB: 100,
        features: {
          clients: true,
          animals: true,
          appointments: true,
          invoicing: true,
          reproductive: true,
          sanitary: true,
          reports_basic: true,
          reports_advanced: true,
          financial_reports: true,
          api_access: true,
          priority_support: true,
          custom_integrations: true,
        },
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`Created ${plans.length} plans`);

  // Create Species
  const species = await Promise.all([
    prisma.species.upsert({
      where: { name: 'Bovine' },
      update: {},
      create: {
        name: 'Bovine',
        nameScientific: 'Bos taurus',
        description: 'Domestic cattle',
      },
    }),
    prisma.species.upsert({
      where: { name: 'Equine' },
      update: {},
      create: {
        name: 'Equine',
        nameScientific: 'Equus caballus',
        description: 'Domestic horses',
      },
    }),
    prisma.species.upsert({
      where: { name: 'Caprine' },
      update: {},
      create: {
        name: 'Caprine',
        nameScientific: 'Capra aegagrus hircus',
        description: 'Domestic goats',
      },
    }),
    prisma.species.upsert({
      where: { name: 'Ovine' },
      update: {},
      create: {
        name: 'Ovine',
        nameScientific: 'Ovis aries',
        description: 'Domestic sheep',
      },
    }),
    prisma.species.upsert({
      where: { name: 'Swine' },
      update: {},
      create: {
        name: 'Swine',
        nameScientific: 'Sus scrofa domesticus',
        description: 'Domestic pigs',
      },
    }),
    prisma.species.upsert({
      where: { name: 'Bubaline' },
      update: {},
      create: {
        name: 'Bubaline',
        nameScientific: 'Bubalus bubalis',
        description: 'Water buffalo',
      },
    }),
  ]);
  console.log(`Created ${species.length} species`);

  // Create Breeds for Bovine
  const bovine = species.find(s => s.name === 'Bovine');
  const bovineBreeds = await Promise.all([
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Nelore' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Nelore', origin: 'India/Brazil' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Angus' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Angus', origin: 'Scotland' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Brahman' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Brahman', origin: 'United States' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Hereford' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Hereford', origin: 'England' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Gir' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Gir', origin: 'India' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Holstein' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Holstein', origin: 'Netherlands' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Jersey' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Jersey', origin: 'Jersey Island' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Simental' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Simental', origin: 'Switzerland' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Charolais' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Charolais', origin: 'France' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: bovine.id, name: 'Limousin' } },
      update: {},
      create: { speciesId: bovine.id, name: 'Limousin', origin: 'France' },
    }),
  ]);
  console.log(`Created ${bovineBreeds.length} bovine breeds`);

  // Create Breeds for Equine
  const equine = species.find(s => s.name === 'Equine');
  const equineBreeds = await Promise.all([
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: equine.id, name: 'Mangalarga Marchador' } },
      update: {},
      create: { speciesId: equine.id, name: 'Mangalarga Marchador', origin: 'Brazil' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: equine.id, name: 'Quarter Horse' } },
      update: {},
      create: { speciesId: equine.id, name: 'Quarter Horse', origin: 'United States' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: equine.id, name: 'Arabian' } },
      update: {},
      create: { speciesId: equine.id, name: 'Arabian', origin: 'Arabian Peninsula' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: equine.id, name: 'Crioulo' } },
      update: {},
      create: { speciesId: equine.id, name: 'Crioulo', origin: 'South America' },
    }),
    prisma.breed.upsert({
      where: { speciesId_name: { speciesId: equine.id, name: 'Thoroughbred' } },
      update: {},
      create: { speciesId: equine.id, name: 'Thoroughbred', origin: 'England' },
    }),
  ]);
  console.log(`Created ${equineBreeds.length} equine breeds`);

  // Create Test Account and Users for all roles
  const hashedPassword = await bcrypt.hash('Test@123', 12);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const testAccount = await prisma.account.upsert({
    where: { email: 'test@vetsaas.com' },
    update: {},
    create: {
      name: 'Test Veterinary Clinic',
      email: 'test@vetsaas.com',
      phone: '(11) 99999-9999',
      subscriptionStatus: 'trialing',
      trialEndsAt,
    },
  });

  // Create users with different roles
  const testUsers = await Promise.all([
    // Owner
    prisma.user.upsert({
      where: { email: 'owner@vetsaas.com' },
      update: {},
      create: {
        accountId: testAccount.id,
        email: 'owner@vetsaas.com',
        password: hashedPassword,
        firstName: 'Owner',
        lastName: 'User',
        role: 'owner',
        emailVerified: true,
      },
    }),
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@vetsaas.com' },
      update: {},
      create: {
        accountId: testAccount.id,
        email: 'admin@vetsaas.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: true,
      },
    }),
    // User
    prisma.user.upsert({
      where: { email: 'user@vetsaas.com' },
      update: {},
      create: {
        accountId: testAccount.id,
        email: 'user@vetsaas.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        emailVerified: true,
      },
    }),
    // Viewer
    prisma.user.upsert({
      where: { email: 'viewer@vetsaas.com' },
      update: {},
      create: {
        accountId: testAccount.id,
        email: 'viewer@vetsaas.com',
        password: hashedPassword,
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        emailVerified: true,
      },
    }),
  ]);

  console.log('\n=== TEST USERS CREATED ===');
  console.log('Password for all: Test@123\n');
  console.log('1. owner@vetsaas.com  - Role: OWNER (full access)');
  console.log('2. admin@vetsaas.com  - Role: ADMIN (full access)');
  console.log('3. user@vetsaas.com   - Role: USER (standard access)');
  console.log('4. viewer@vetsaas.com - Role: VIEWER (read-only)');
  console.log('==========================\n');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
