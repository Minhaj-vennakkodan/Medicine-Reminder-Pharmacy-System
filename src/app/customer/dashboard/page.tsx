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
      orderBy: { stock: 'desc' },
      take: 4
    })
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user.name}</h1>
          <p className="page-subtitle">Manage your prescriptions, orders, and health reminders in one place.</p>
        </div>
      </div>
      
      {/* Quick Stats & Actions */}
      <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        <Link href="/customer/medicines" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-main)', margin: 0 }}>Shop Medicines</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Browse pharmacy catalog</span>
          </div>
        </Link>
        
        <Link href="/customer/reminders" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-main)', margin: 0 }}>Health Reminders</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{activeReminders.length} active schedules</span>
          </div>
        </Link>

        <Link href="/customer/cart" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-main)', margin: 0 }}>Shopping Cart</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{cartItems} items pending</span>
          </div>
        </Link>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        {/* Today&apos;s Reminders */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Today&apos;s Reminders</h3>
            <Link href="/customer/reminders" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>View All</Link>
          </div>
          {activeReminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              <p>No reminders scheduled for today.</p>
              <Link href="/customer/reminders/add" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Reminder</Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeReminders.map(r => (
                <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: '4px', height: '100%', minHeight: '32px', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{r.medicineName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{r.dosage} • {r.frequency}</div>
                  </div>
                  <div className="badge badge-info">{r.time}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Recent Orders</h3>
            <Link href="/customer/orders" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>History</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              <p>No recent orders found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/customer/orders/${o.id}`} style={{ fontWeight: '500' }}>
                          #{o.id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${o.status === 'PENDING' ? 'badge-warning' : o.status === 'DELIVERED' ? 'badge-success' : 'badge-neutral'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Popular Medicines */}
      <div>
        <div className="page-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          <h3 className="card-title">Featured Products</h3>
          <Link href="/customer/medicines" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Browse full catalog &rarr;</Link>
        </div>
        
        <div className="grid-cols-4">
          {popularMedicines.map(med => (
            <div key={med.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <div style={{ height: '120px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="40" height="40" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
              </div>
              <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{med.name}</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{med.category || 'General'}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--color-primary)' }}>${med.price.toFixed(2)}</div>
                <Link href={`/customer/medicines/${med.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
