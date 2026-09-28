import prisma from '@/lib/prisma';
import CustomerManager from './CustomerManager';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  await requireAdmin();

  // Fetch only users with role CUSTOMER, excluding passwords
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      orders: true,
      prescriptions: true,
      reminders: {
        where: { isActive: true }
      }
    }
  });

  return <CustomerManager initialCustomers={customers} />;
}
