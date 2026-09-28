"use client";

import { useState } from 'react';
import { updatePrescriptionStatus } from './actions';

export default function PrescriptionManager({ initialPrescriptions }: { initialPrescriptions: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const filtered = prescriptions.filter(rx => {
    if (search && !rx.user.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && rx.status !== statusFilter) return false;
    return true;
  });

  const handleSelect = (rx: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
    setSelectedRx(rx);
    setNotes(rx.notes || '');
  };

  const handleUpdate = async (status: string) => {
    if (!selectedRx) return;
    await updatePrescriptionStatus(selectedRx.id, status, notes);
    window.location.reload();
  };

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Prescription Verification</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by Customer Name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ padding: '0.5rem', flex: 1, borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }} 
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }}>
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRx ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        
        {/* List */}
        <div className="glass-panel" style={{ overflowX: 'auto', alignSelf: 'start' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rx => (
                <tr key={rx.id} style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: selectedRx?.id === rx.id ? 'var(--color-background)' : 'transparent' }}>
                  <td style={{ padding: '1rem' }}>
                    <strong>{rx.user.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{rx.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{new Date(rx.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: rx.status === 'VERIFIED' ? 'var(--color-success)' : rx.status === 'REJECTED' ? 'var(--color-danger)' : 'var(--color-warning)',
                      fontWeight: 'bold' 
                    }}>
                      {rx.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleSelect(rx)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Review</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No prescriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Details Panel */}
        {selectedRx && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', alignSelf: 'start' }}>
            <h3 style={{ marginBottom: '1rem' }}>Review Prescription</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Customer:</strong> {selectedRx.user.name} <br/>
              <strong>Email:</strong> {selectedRx.user.email} <br/>
              <strong>Phone:</strong> {selectedRx.user.phone || 'N/A'}
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center' }}>
              {selectedRx.fileUrl ? (
                <a href={selectedRx.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                  View Uploaded Document
                </a>
              ) : (
                <span style={{ color: 'var(--color-danger)' }}>No file attached or invalid file.</span>
              )}
            </div>

            {selectedRx.orders && selectedRx.orders.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <strong>Related Orders:</strong>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {selectedRx.orders.map((o: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <li key={o.id}>Order #{o.id.slice(-6).toUpperCase()} - {o.status}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Admin Notes (Verification/Rejection Reason)</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                rows={4}
                placeholder="Add any notes here..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleUpdate('VERIFIED')} className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--color-success)' }}>Verify</button>
              <button onClick={() => handleUpdate('REJECTED')} className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--color-danger)' }}>Reject</button>
              <button onClick={() => setSelectedRx(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
