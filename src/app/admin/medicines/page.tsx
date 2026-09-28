import prisma from '@/lib/prisma';
import MedicineManager from './MedicineManager';

export const dynamic = 'force-dynamic';

export default async function MedicinesPage() {
  const medicines = await prisma.medicine.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <MedicineManager initialMedicines={medicines} />;
}
