import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';
import ReminderStatusForm from './ReminderStatusForm';
import ReminderDeleteForm from './ReminderDeleteForm';

export const dynamic = 'force-dynamic';

export default async function RemindersDashboard() {
  const user = await requireCustomer();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const reminders = await prisma.reminder.findMany({
    where: { userId: user.userId, isActive: true },
    include: {
      logs: {
        where: {
          scheduledFor: {
            gte: today,
            lt: tomorrow
          }
        }
      }
    }
  });

  const getStatus = (reminder: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
    if (reminder.logs && reminder.logs.length > 0) {
      return reminder.logs[0].status;
    }
    // If time is past, missed, else pending
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    if (new Date() > scheduledTime) {
      return 'MISSED';
    }
    return 'PENDING';
  };

  const todayReminders = reminders.map(r => ({ ...r, currentStatus: getStatus(r) }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const pending = todayReminders.filter(r => r.currentStatus === 'PENDING');
  const completed = todayReminders.filter(r => r.currentStatus === 'COMPLETED');
  const missed = todayReminders.filter(r => r.currentStatus === 'MISSED');

  const upcomingReminders = pending.slice(0, 3); // top 3 upcoming

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Medicine Reminders</h1>
        <Link href="/customer/reminders/add" className="btn btn-primary">
          + Add Reminder
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Today&apos;s Schedule</h2>
          {todayReminders.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No reminders scheduled for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pending.length > 0 && <h4 style={{ color: 'var(--color-primary)' }}>Pending</h4>}
              {pending.map(r => <ReminderCard key={r.id} reminder={r} date={today} />)}
              
              {missed.length > 0 && <h4 style={{ color: 'var(--color-error)' }}>Missed</h4>}
              {missed.map(r => <ReminderCard key={r.id} reminder={r} date={today} />)}
              
              {completed.length > 0 && <h4 style={{ color: 'var(--color-success)' }}>Completed</h4>}
              {completed.map(r => <ReminderCard key={r.id} reminder={r} date={today} />)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Upcoming</h2>
            {upcomingReminders.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No upcoming reminders today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingReminders.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <strong>{r.medicineName}</strong>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{r.time} - {r.dosage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Adherence</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                   {todayReminders.length > 0 ? Math.round((completed.length / todayReminders.length) * 100) : 0}%
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>Today&apos;s Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReminderCard({ reminder, date }: { reminder: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, date: Date }) {
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const scheduledFor = new Date(date);
  scheduledFor.setHours(hours, minutes, 0, 0);

  return (
    <div style={{ background: 'var(--glass-bg-alt)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--color-text)' }}>{reminder.medicineName}</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{reminder.dosage} • {reminder.mealTiming.replace('_', ' ')}</p>
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary)' }}>
          {reminder.time}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <ReminderStatusForm reminder={reminder} scheduledFor={scheduledFor.toISOString()} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/customer/reminders/${reminder.id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Edit</Link>
          <ReminderDeleteForm id={reminder.id} />
        </div>
      </div>
    </div>
  );
}
