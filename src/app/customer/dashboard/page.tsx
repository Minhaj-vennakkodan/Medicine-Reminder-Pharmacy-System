import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboard() {
  const user = await requireCustomer();

  const [recentOrders, cartItems, activeReminders, popularMedicines] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 3
    }),
    prisma.cartItem.count({
      where: { userId: user.userId }
    }),
    prisma.reminder.findMany({
      where: { userId: user.userId, isActive: true },
      take: 3
    }),
    prisma.medicine.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { stock: 'desc' }, // proxy for popular for now
      take: 4
    })
  ]);

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Welcome back, {user.name}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Here is what's happening with your pharmacy today.</p>
      
      {/* Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <Link href="/customer/medicines" className="glass-panel" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'transform 0.2s' }}>
          <h3 style={{ color: 'var(--color-primary)' }}>Shop Medicines</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Browse our catalog</p>
        </Link>
        <Link href="/customer/prescriptions" className="glass-panel" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'transform 0.2s' }}>
          <h3 style={{ color: 'var(--color-primary)' }}>Upload Rx</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Verify a new prescription</p>
        </Link>
        <Link href="/customer/cart" className="glass-panel" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'transform 0.2s' }}>
          <h3 style={{ color: 'var(--color-primary)' }}>Cart ({cartItems})</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>View your basket</p>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Today&apos;s Reminders */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Today&apos;s Reminders</h3>
          {activeReminders.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No reminders scheduled.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {activeReminders.map(r => (
                <li key={r.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <strong>{r.medicineName}</strong> - {r.dosage} at {r.time}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No recent orders.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recentOrders.map(o => (
                <li key={o.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <Link href={`/customer/orders/${o.id}`} style={{ color: 'var(--color-primary)' }}>
                    #{o.id.slice(-6).toUpperCase()}
                  </Link>
                  <span>{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Popular Medicines */}
      <h3 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Popular Medicines</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {popularMedicines.map(med => (
          <div key={med.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{med.name}</h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{med.category || 'General'}</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>${med.price.toFixed(2)}</div>
            <Link href={`/customer/medicines/${med.id}`} className="btn btn-secondary" style={{ marginTop: 'auto', textAlign: 'center' }}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
