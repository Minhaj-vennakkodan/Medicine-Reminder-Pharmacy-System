/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmacy.com' },
    update: {},
    create: {
      name: 'Pharmacy Admin',
      email: 'admin@pharmacy.com',
      passwordHash: 'hashed_password_placeholder', // In a real app, hash this!
      role: 'ADMIN',
    },
  })
  console.log(`Created admin user with id: ${admin.id}`)

  // Create Customer
  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'CUSTOMER',
    },
  })
  console.log(`Created customer user with id: ${customer.id}`)

  // Create Medicines
  const med1 = await prisma.medicine.create({
    data: {
      name: 'Paracetamol 500mg',
      description: 'Pain reliever and a fever reducer.',
      price: 5.99,
      stock: 100,
      requiresPrescription: false,
    },
  })

  const med2 = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin 250mg',
      description: 'Penicillin antibiotic used to treat bacterial infections.',
      price: 15.50,
      stock: 50,
      requiresPrescription: true,
    },
  })

  console.log(`Created medicines: ${med1.name}, ${med2.name}`)
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
