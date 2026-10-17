"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import { cancelOrder } from '../actions';
import { showAppToast } from '@/components/Toast';

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await cancelOrder(orderId);
      showAppToast(`Order #${orderId.slice(-6).toUpperCase()} has been cancelled.`, 'success');
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      showAppToast(err instanceof Error ? err.message : 'Failed to cancel order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary"
        style={{
          color: 'var(--color-danger)',
          borderColor: 'var(--color-danger-bg, #FCA5A5)',
          backgroundColor: '#FFF5F5',
          padding: '0.45rem 0.9rem',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        Cancel Order
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => !loading && setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Cancel Order"
        message={`Are you sure you want to cancel this order (#${orderId.slice(-6).toUpperCase()})? All processing will cease and inventory will be returned.`}
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
