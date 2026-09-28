"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function MedicineSearch({ initialMedicines, categories }: { initialMedicines: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[], categories: string[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [rxRequired, setRxRequired] = useState('ALL');

  const filtered = initialMedicines.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !(m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase()))) return false;
    if (category !== 'ALL' && m.category !== category) return false;
    if (rxRequired === 'YES' && !m.requiresPrescription) return false;
    if (rxRequired === 'NO' && m.requiresPrescription) return false;
    return true;
  });

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Shop Medicines</h1>
      
      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by name or generic name..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.5rem', flex: 1, minWidth: '200px', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }} 
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }}>
          <option value="ALL">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={rxRequired} onChange={e => setRxRequired(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }}>
          <option value="ALL">Prescription: All</option>
          <option value="YES">Prescription Required</option>
          <option value="NO">No Prescription</option>
        </select>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(med => (
          <div key={med.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {med.requiresPrescription && (
              <span style={{ alignSelf: 'flex-start', backgroundColor: 'var(--color-warning)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                Rx Required
              </span>
            )}
            <h3 style={{ margin: '0 0 0.25rem 0' }}>{med.name}</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{med.genericName || 'Standard'} • {med.category || 'General'}</div>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>{med.description.substring(0, 80)}...</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>${med.price.toFixed(2)}</div>
              <div style={{ fontSize: '0.875rem', color: med.stock > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {med.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
            
            <Link href={`/customer/medicines/${med.id}`} className="btn btn-primary" style={{ textAlign: 'center' }}>
              View Details
            </Link>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No medicines found matching your criteria.
        </div>
      )}
    </div>
  );
}
