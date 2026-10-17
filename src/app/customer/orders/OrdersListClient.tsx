"use client";

import { useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import { cancelOrder } from './actions';
import { showAppToast } from '@/components/Toast';

export interface OrderRow {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
}

interface OrdersListClientProps {
  initialOrders: OrderRow[];
}

export default function OrdersListClient({ initialOrders }: OrdersListClientProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancellingOrderId) return;
    setLoading(true);
    try {
      await cancelOrder(cancellingOrderId);
      setOrders(prev =>
        prev.map(o =>
          o.id === cancellingOrderId
            ? { ...o, status: 'Cancelled', paymentStatus: o.paymentStatus === 'PAID' ? 'REFUNDED' : 'CANCELLED' }
            : o
        )
      );
      showAppToast(`Order #${cancellingOrderId.slice(-6).toUpperCase()} has been cancelled.`, 'success');
      setCancellingOrderId(null);
    } catch (err) {
      showAppToast(err instanceof Error ? err.message : 'Failed to cancel order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
          You haven&apos;t placed any orders yet.
        </h3>
        <Link href="/customer/medicines" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '1rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Payment</th>
              <th style={{ padding: '1rem' }}>Total</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isDelivered = order.status === 'Delivered';
              const isCancelled = order.status === 'Cancelled';
              const isOutForDelivery = order.status === 'Out for Delivery';
              const canCancel = !isDelivered && !isCancelled;

              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      className={`badge ${
                        isDelivered
                          ? 'badge-success'
                          : isCancelled
                          ? 'badge-danger'
                          : isOutForDelivery
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor:
                          order.paymentStatus === 'PAID'
                            ? '#DCFCE7'
                            : order.paymentStatus === 'REFUNDED'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          order.paymentStatus === 'PAID'
                            ? '#15803D'
                            : order.paymentStatus === 'REFUNDED'
                            ? '#DC2626'
                            : '#B45309',
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                      >
                        Track
                      </Link>
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setCancellingOrderId(order.id)}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8125rem',
                            color: 'var(--color-danger)',
                            borderColor: 'var(--color-danger-bg, #FCA5A5)',
                            backgroundColor: '#FFF5F5',
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!cancellingOrderId}
        onClose={() => !loading && setCancellingOrderId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order #${
          cancellingOrderId ? cancellingOrderId.slice(-6).toUpperCase() : ''
        }? All order processing will be halted and items restored to pharmacy inventory.`}
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
