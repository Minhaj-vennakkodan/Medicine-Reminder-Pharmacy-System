/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdmin() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);

  await prisma.user.update({
    where: { email: 'admin@pharmacy.com' },
    data: { passwordHash: hash }
  });

  console.log('Admin password updated to "admin123"');
}

updateAdmin()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
