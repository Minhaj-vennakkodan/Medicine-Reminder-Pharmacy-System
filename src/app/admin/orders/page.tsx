import prisma from '@/lib/prisma';
import OrderManager from './OrderManager';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: {
          medicine: true
        }
      },
      prescription: true
    }
  });

  return <OrderManager initialOrders={orders} />;
}
