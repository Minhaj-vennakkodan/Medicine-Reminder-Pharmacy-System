'use client';

import { useTransition } from 'react';
import { logReminderStatus } from './actions';

export default function ReminderStatusForm({ reminder, scheduledFor }: { reminder: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, scheduledFor: string }) {
  const [isPending, startTransition] = useTransition();
  const currentStatus = reminder.currentStatus;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'PENDING' | 'COMPLETED' | 'MISSED';
    startTransition(() => {
      logReminderStatus(reminder.id, new Date(scheduledFor), status);
    });
  };

  return (
    <select 
      value={currentStatus} 
      onChange={handleStatusChange}
      disabled={isPending}
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        color: 'var(--color-text)',
        fontSize: '0.875rem'
      }}
    >
      <option value="PENDING">Pending</option>
      <option value="COMPLETED">Completed</option>
      <option value="MISSED">Missed</option>
    </select>
  );
}
