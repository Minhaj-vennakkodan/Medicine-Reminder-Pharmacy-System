"use client";

import { useState } from 'react';
import { updateOrderStatus, updatePaymentStatus } from './actions';

export default function OrderManager({ initialOrders }: { initialOrders: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const filtered = orders.filter(o => {
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.user.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (paymentFilter !== 'ALL' && o.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    window.location.reload();
  };

  const handlePaymentChange = async (id: string, paymentStatus: string) => {
    await updatePaymentStatus(id, paymentStatus);
    window.location.reload();
  };

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Order Management</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by Order ID or Customer..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ padding: '0.5rem', flex: 1, borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }} 
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }}>
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Prescription Verified">Prescription Verified</option>
          <option value="Pharmacy Processing">Pharmacy Processing</option>
          <option value="Packed">Packed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }}>
          <option value="ALL">All Payments</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Order Info</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Total</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>
                  <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    <strong>Items:</strong> {order.items.length}
                    {order.prescriptionId && <span style={{ color: 'var(--color-warning)', marginLeft: '0.5rem' }}>[Rx Attached]</span>}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div>{order.user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.user.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.user.phone || 'No phone'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ padding: '0.25rem', borderRadius: '4px' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Prescription Verified">Prescription Verified</option>
                    <option value="Pharmacy Processing">Pharmacy Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={order.paymentStatus} 
                    onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                    style={{ padding: '0.25rem', borderRadius: '4px' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
