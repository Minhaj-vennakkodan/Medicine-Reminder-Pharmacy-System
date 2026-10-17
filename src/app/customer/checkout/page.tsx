import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await requireCustomer();

  const [cartItems, verifiedPrescriptions] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { medicine: true }
    }),
    prisma.prescription.findMany({
      where: { userId: user.id, status: 'VERIFIED' }
    })
  ]);

  return (
    <CheckoutClient 
      cartItems={cartItems} 
      verifiedPrescriptions={verifiedPrescriptions} 
      user={{ id: user.id, name: user.name, email: user.email, phone: user.phone || '' }} 
    />
  );
}
