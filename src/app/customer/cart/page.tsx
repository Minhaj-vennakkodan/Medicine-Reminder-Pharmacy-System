import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import CartManager from './CartManager';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const user = await requireCustomer();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: {
      medicine: true
    },
    orderBy: { id: 'desc' }
  });

  return <CartManager cartItems={cartItems} />;
}
