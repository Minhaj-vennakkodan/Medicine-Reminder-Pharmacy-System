import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import OrdersListClient from './OrdersListClient';

export const dynamic = 'force-dynamic';

export default async function OrdersListPage() {
  const user = await requireCustomer();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  const formattedOrders = orders.map(o => ({
    id: o.id,
    createdAt: new Date(o.createdAt).toISOString(),
    status: o.status,
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus || 'PENDING',
  }));

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Orders</h1>
      <OrdersListClient initialOrders={formattedOrders} />
    </div>
  );
}
