import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';
import { updateReminder } from '../../actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditReminderPage({ params }: { params: { id: string } }) {
  const user = await requireCustomer();
  
  const reminder = await prisma.reminder.findUnique({
    where: { id: params.id }
  });

  if (!reminder || reminder.userId !== user.userId) {
    notFound();
  }

  const medicines = await prisma.medicine.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  // Client components cannot pass actions with bound arguments directly in Next.js 13 if they are inline,
  // but we can create a bound action here.
  const updateAction = updateReminder.bind(null, reminder.id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Edit Reminder</h1>
        <Link href="/customer/reminders" className="btn btn-secondary">
          Back to Reminders
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
        <form action={updateAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="medicineName" style={{ fontWeight: 'bold' }}>Medicine Name *</label>
            <input 
              type="text" 
              id="medicineName" 
              name="medicineName" 
              required 
              defaultValue={reminder.medicineName}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="medicineId" style={{ fontWeight: 'bold' }}>Link to Database Medicine (Optional)</label>
            <select 
              id="medicineId" 
              name="medicineId"
              defaultValue={reminder.medicineId || ''}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
            >
              <option value="">-- None --</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="dosage" style={{ fontWeight: 'bold' }}>Dosage *</label>
              <input 
                type="text" 
                id="dosage" 
                name="dosage" 
                required 
                defaultValue={reminder.dosage}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="time" style={{ fontWeight: 'bold' }}>Time *</label>
              <input 
                type="time" 
                id="time" 
                name="time" 
                required 
                defaultValue={reminder.time}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="frequency" style={{ fontWeight: 'bold' }}>Frequency</label>
              <select 
                id="frequency" 
                name="frequency"
                defaultValue={reminder.frequency}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="AS_NEEDED">As Needed</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="mealTiming" style={{ fontWeight: 'bold' }}>Meal Timing</label>
              <select 
                id="mealTiming" 
                name="mealTiming"
                defaultValue={reminder.mealTiming || 'ANYTIME'}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              >
                <option value="ANYTIME">Anytime</option>
                <option value="BEFORE_MEAL">Before Meal</option>
                <option value="AFTER_MEAL">After Meal</option>
                <option value="WITH_MEAL">With Meal</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="startDate" style={{ fontWeight: 'bold' }}>Start Date *</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                required 
                defaultValue={reminder.startDate.toISOString().split('T')[0]}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="endDate" style={{ fontWeight: 'bold' }}>End Date (Optional)</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                defaultValue={reminder.endDate ? reminder.endDate.toISOString().split('T')[0] : ''}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="notificationPref" style={{ fontWeight: 'bold' }}>Notification Preference</label>
              <select 
                id="notificationPref" 
                name="notificationPref"
                defaultValue={reminder.notificationPref}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              >
                <option value="APP">App Only</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="isActive" style={{ fontWeight: 'bold' }}>Status</label>
              <select 
                id="isActive" 
                name="isActive"
                defaultValue={reminder.isActive ? 'true' : 'false'}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
              >
                <option value="true">Active</option>
                <option value="false">Paused</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="notes" style={{ fontWeight: 'bold' }}>Notes (Optional)</label>
            <textarea 
              id="notes" 
              name="notes" 
              rows={3}
              defaultValue={reminder.notes || ''}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            Update Reminder
          </button>
        </form>
      </div>
    </div>
  );
}
