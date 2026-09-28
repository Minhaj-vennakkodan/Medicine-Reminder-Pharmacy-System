import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    totalMedicines,
    lowStockMedicines,
    outOfStockMedicines,
    pendingOrders,
    pendingPrescriptions,
    recentOrders,
    recentPrescriptions
  ] = await Promise.all([
    prisma.medicine.count(),
    prisma.medicine.count({ where: { stock: { gt: 0, lte: 20 } } }),
    prisma.medicine.count({ where: { stock: { equals: 0 } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),
    prisma.prescription.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      where: { status: { not: 'PENDING' } },
      include: { user: true }
    })
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Overview of pharmacy inventory, orders, and verifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/medicines" className="btn btn-primary">Manage Inventory</Link>
          <Link href="/admin/orders" className="btn btn-secondary">Review Orders</Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard title="Total Medicines" value={totalMedicines} type="info" />
        <StatCard title="Low Stock" value={lowStockMedicines} type="warning" />
        <StatCard title="Out of Stock" value={outOfStockMedicines} type="danger" />
        <StatCard title="Pending Prescriptions" value={pendingPrescriptions} type="warning" />
      </div>

      <div className="grid-cols-2" style={{ gap: '2rem' }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)' }}>View All</Link>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', boxShadow: 'none' }}>
            {recentOrders.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No recent orders.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '500' }}>#{order.id.slice(-6).toUpperCase()}</td>
                      <td>{order.user.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>${order.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Verification Activity */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Recent Verifications</h3>
            <Link href="/admin/prescriptions" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)' }}>View All</Link>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', boxShadow: 'none' }}>
            {recentPrescriptions.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No recent verification activity.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrescriptions.map(rx => (
                    <tr key={rx.id}>
                      <td style={{ fontWeight: '500' }}>{rx.user.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{new Date(rx.updatedAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${rx.status === 'VERIFIED' ? 'badge-success' : 'badge-danger'}`}>
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, type }: { title: string, value: number, type: 'info' | 'warning' | 'danger' }) {
  const getColors = () => {
    switch (type) {
      case 'info': return { bg: 'var(--color-info-bg)', color: 'var(--color-info)' };
      case 'warning': return { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
      case 'danger': return { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
    }
  };
  
  const colors = getColors();

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
      <div style={{ 
        width: '56px', height: '56px', 
        borderRadius: 'var(--radius-md)', 
        backgroundColor: colors.bg, 
        color: colors.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{title}</h4>
        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-main)', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}
