import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({ searchParams }: { searchParams: { orderId: string } }) {
  const user = await requireCustomer();
  const orderId = searchParams.orderId;

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.userId !== user.userId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: 'var(--color-danger)' }}>Order Not Found</h2>
        <Link href="/customer/orders" className="btn btn-primary">View My Orders</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem', borderTop: '4px solid var(--color-success)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Order Confirmed!</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
          Thank you for your purchase. Your order has been placed successfully and is now being processed.
        </p>

        <div style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: '4px', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div><strong>Order ID:</strong> #{order.id.slice(-6).toUpperCase()}</div>
            <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
            <div><strong>Payment Status:</strong> {order.paymentStatus}</div>
            <div><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</div>
            <div><strong>Current Status:</strong> <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{order.status}</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href={`/customer/orders/${order.id}`} className="btn btn-primary">Track Order</Link>
          <Link href="/customer/medicines" className="btn btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
