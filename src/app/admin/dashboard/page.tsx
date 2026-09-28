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
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Medicines" value={totalMedicines} color="var(--color-primary)" />
        <StatCard title="Low Stock" value={lowStockMedicines} color="var(--color-warning)" />
        <StatCard title="Out of Stock" value={outOfStockMedicines} color="var(--color-danger)" />
        <StatCard title="Pending Orders" value={pendingOrders} color="var(--color-secondary)" />
        <StatCard title="Pending Prescriptions" value={pendingPrescriptions} color="var(--color-warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Recent Orders */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>View All</Link>
          </div>
          {recentOrders.length === 0 ? <p>No recent orders.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recentOrders.map(order => (
                <li key={order.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Order #{order.id.slice(-6).toUpperCase()}</strong>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{order.user.name} - {order.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Verification Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Recent Verifications</h3>
            <Link href="/admin/prescriptions" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>View All</Link>
          </div>
          {recentPrescriptions.length === 0 ? <p>No recent verification activity.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recentPrescriptions.map(rx => (
                <li key={rx.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Rx for {rx.user.name}</strong>
                    <span style={{ color: rx.status === 'VERIFIED' ? 'var(--color-success)' : 'var(--color-danger)' }}>{rx.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
      <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</h4>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{value}</div>
    </div>
  );
}
