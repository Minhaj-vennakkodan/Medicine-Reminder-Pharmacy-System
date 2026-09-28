'use client';

import { useTransition } from 'react';
import { deleteReminder } from './actions';

export default function ReminderDeleteForm({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      startTransition(() => {
        deleteReminder(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="btn btn-primary"
      style={{
        padding: '0.25rem 0.75rem',
        fontSize: '0.8rem',
        background: 'var(--color-error)'
      }}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
