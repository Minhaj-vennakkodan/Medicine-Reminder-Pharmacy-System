import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import MedicineSearch from './MedicineSearch';

export const dynamic = 'force-dynamic';

export default async function MedicinesPage() {
  await requireCustomer();

  const medicines = await prisma.medicine.findMany({
    orderBy: { name: 'asc' }
  });

  const categories = Array.from(new Set(medicines.map(m => m.category).filter(Boolean))) as string[];

  return <MedicineSearch initialMedicines={medicines} categories={categories} />;
}
