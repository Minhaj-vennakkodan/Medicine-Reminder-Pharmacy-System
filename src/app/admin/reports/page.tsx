import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await requireAdmin();

  const [
    totalOrders,
    totalSalesResult,
    newCustomers,
    prescriptionOrders,
    inventoryCount,
    topMedicines,
    orderStatusGroups
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count({ where: { prescriptionId: { not: null } } }),
    prisma.medicine.count(),
    prisma.orderItem.groupBy({
      by: ['medicineId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    })
  ]);

  const totalSales = totalSalesResult._sum.totalAmount || 0;

  // Enhance top medicines with names
  const topMedicinesWithNames = await Promise.all(
    topMedicines.map(async (tm) => {
      const med = await prisma.medicine.findUnique({ where: { id: tm.medicineId } });
      return {
        name: med?.name || 'Unknown',
        quantity: tm._sum.quantity || 0
      };
    })
  );

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Reports & Analytics</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Sales" value={`$${totalSales.toFixed(2)}`} color="var(--color-success)" />
        <StatCard title="Total Orders" value={totalOrders.toString()} color="var(--color-primary)" />
        <StatCard title="New Customers" value={newCustomers.toString()} color="var(--color-secondary)" />
        <StatCard title="Prescription Orders" value={prescriptionOrders.toString()} color="var(--color-warning)" />
        <StatCard title="Total Inventory items" value={inventoryCount.toString()} color="var(--color-text-muted)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Top Selling Medicines */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Top Selling Medicines</h3>
          {topMedicinesWithNames.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No sales data available yet.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Medicine Name</th>
                  <th style={{ padding: '0.5rem 0' }}>Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {topMedicinesWithNames.map((med, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{med.name}</td>
                    <td style={{ padding: '0.75rem 0' }}>{med.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Status Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Order Status Summary</h3>
          {orderStatusGroups.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orderStatusGroups.map((group, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 500 }}>{group.status}</span>
                  <span style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                    {group._count.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderTop: `4px solid ${color}` }}>
      <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</h4>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{value}</div>
    </div>
  );
}
