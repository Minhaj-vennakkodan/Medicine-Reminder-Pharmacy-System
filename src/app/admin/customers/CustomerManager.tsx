"use client";

import { useState } from 'react';

export default function CustomerManager({ initialCustomers }: { initialCustomers: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filtered = customers.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Customer Management</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by Name or Email..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ padding: '0.5rem', flex: 1, borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        
        {/* List */}
        <div className="card" style={{ overflowX: 'auto', alignSelf: 'start' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Joined</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedUser?.id === user.id ? 'var(--color-background)' : 'transparent' }}>
                  <td style={{ padding: '1rem' }}>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => setSelectedUser(user)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>View Details</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Details Panel */}
        {selectedUser && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Customer Details</h3>
              <button onClick={() => setSelectedUser(null)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>Close</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', display: 'grid', gap: '0.5rem' }}>
              <div><strong>ID:</strong> {selectedUser.id}</div>
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '1.5rem 0' }} />
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Orders ({selectedUser.orders.length})</h4>
              {selectedUser.orders.length > 0 ? (
                <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  {selectedUser.orders.map((o: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <li key={o.id}>Order #{o.id.slice(-6).toUpperCase()} - ${o.totalAmount.toFixed(2)} - {o.status}</li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No orders placed.</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Prescriptions ({selectedUser.prescriptions.length})</h4>
              {selectedUser.prescriptions.length > 0 ? (
                <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  {selectedUser.prescriptions.map((rx: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <li key={rx.id}>Date: {new Date(rx.createdAt).toLocaleDateString()} - {rx.status}</li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No prescriptions uploaded.</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Active Reminders ({selectedUser.reminders.length})</h4>
              {selectedUser.reminders.length > 0 ? (
                <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  {selectedUser.reminders.map((r: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <li key={r.id}>{r.medicineName} - {r.dosage} at {r.time}</li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No active reminders.</p>}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
