import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersListPage() {
  const user = await requireCustomer();

  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>You haven&apos;t placed any orders yet.</h3>
          <Link href="/customer/medicines" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '0.875rem' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/customer/orders/${order.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
