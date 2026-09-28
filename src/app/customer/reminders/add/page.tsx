import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';
import { createReminder } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AddReminderPage() {
  await requireCustomer();
  
  const medicines = await prisma.medicine.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Add Medicine Reminder</h1>
        <Link href="/customer/reminders" className="btn btn-secondary">
          Back to Reminders
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <form action={createReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="medicineName" style={{ fontWeight: 'bold' }}>Medicine Name *</label>
            <input 
              type="text" 
              id="medicineName" 
              name="medicineName" 
              required 
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
              placeholder="e.g. Paracetamol"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="medicineId" style={{ fontWeight: 'bold' }}>Link to Database Medicine (Optional)</label>
            <select 
              id="medicineId" 
              name="medicineId"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
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
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
                placeholder="e.g. 1 pill, 500mg"
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="time" style={{ fontWeight: 'bold' }}>Time *</label>
              <input 
                type="time" 
                id="time" 
                name="time" 
                required 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="frequency" style={{ fontWeight: 'bold' }}>Frequency</label>
              <select 
                id="frequency" 
                name="frequency"
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
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
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
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
                defaultValue={new Date().toISOString().split('T')[0]}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="endDate" style={{ fontWeight: 'bold' }}>End Date (Optional)</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="notificationPref" style={{ fontWeight: 'bold' }}>Notification Preference</label>
            <select 
              id="notificationPref" 
              name="notificationPref"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
            >
              <option value="APP">App Only</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="notes" style={{ fontWeight: 'bold' }}>Notes (Optional)</label>
            <textarea 
              id="notes" 
              name="notes" 
              rows={3}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--color-text)' }} 
              placeholder="Any special instructions..."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            Save Reminder
          </button>
        </form>
      </div>
    </div>
  );
}
