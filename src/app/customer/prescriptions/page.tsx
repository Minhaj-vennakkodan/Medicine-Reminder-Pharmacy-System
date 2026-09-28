import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import PrescriptionManager from './PrescriptionManager';

export const dynamic = 'force-dynamic';

export default async function PrescriptionsPage() {
  const user = await requireCustomer();

  const prescriptions = await prisma.prescription.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' }
  });

  return <PrescriptionManager prescriptions={prescriptions} />;
}
