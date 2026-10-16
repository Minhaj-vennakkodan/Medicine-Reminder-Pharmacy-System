import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import MedicineDetailsClient from './MedicineDetailsClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MedicineDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCustomer();
  const { id } = await params;

  const medicine = await prisma.medicine.findUnique({
    where: { id }
  });

  if (!medicine) {
    notFound();
  }

  return (
    <div>
      <Link href="/customer/medicines" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
        ← Back to Search
      </Link>
      <MedicineDetailsClient medicine={medicine} />
    </div>
  );
}
