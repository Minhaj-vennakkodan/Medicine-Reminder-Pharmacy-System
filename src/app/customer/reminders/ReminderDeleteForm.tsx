'use client';

import { useState, useTransition } from 'react';
import { deleteReminder } from './actions';
import ConfirmModal from '@/components/ConfirmModal';
import { showAppToast } from '@/components/Toast';

export default function ReminderDeleteForm({ id, medicineName }: { id: string; medicineName?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteReminder(id);
        setIsModalOpen(false);
        showAppToast(
          medicineName ? `"${medicineName}" reminder deleted successfully` : 'Reminder deleted successfully',
          'success'
        );
      } catch (err) {
        showAppToast(err instanceof Error ? err.message : 'Failed to delete reminder', 'error');
      }
    });
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className="btn"
        style={{
          padding: '0.25rem 0.75rem',
          fontSize: '0.8rem',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#DC2626';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FEE2E2';
          e.currentTarget.style.color = '#DC2626';
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
        <span>Delete</span>
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => !isPending && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Reminder"
        message={
          medicineName 
            ? `Are you sure you want to delete the reminder for "${medicineName}"? This medicine will be removed from your daily schedule.`
            : 'Are you sure you want to delete this reminder? This action cannot be undone.'
        }
        confirmText="Yes, Delete"
        cancelText="Keep Reminder"
        variant="danger"
        loading={isPending}
      />
    </>
  );
}
