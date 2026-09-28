import prisma from '@/lib/prisma';
import PrescriptionManager from './PrescriptionManager';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function PrescriptionsPage() {
  await requireAdmin();

  const prescriptions = await prisma.prescription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      orders: true
    }
  });

  return <PrescriptionManager initialPrescriptions={prescriptions} />;
}
