"use client";

import { useState } from 'react';
import { addMedicine, updateMedicine, deleteMedicine } from './actions';

export default function MedicineManager({ initialMedicines }: { initialMedicines: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentMed, setCurrentMed] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', genericName: '', category: '', description: '', price: '', stock: '', requiresPrescription: false, expiryDate: ''
  });

  const filtered = medicines.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStock === 'IN_STOCK' && m.stock <= 20) return false;
    if (filterStock === 'LOW_STOCK' && (m.stock > 20 || m.stock === 0)) return false;
    if (filterStock === 'OUT_OF_STOCK' && m.stock > 0) return false;
    return true;
  });

  const handleEdit = (med: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
    setCurrentMed(med);
    setIsEditing(true);
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      category: med.category || '',
      description: med.description,
      price: med.price.toString(),
      stock: med.stock.toString(),
      requiresPrescription: med.requiresPrescription,
      expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentMed(null);
    setFormData({ name: '', genericName: '', category: '', description: '', price: '', stock: '', requiresPrescription: false, expiryDate: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentMed) {
      await updateMedicine(currentMed.id, formData);
    } else {
      await addMedicine(formData);
    }
    window.location.reload(); // Simple refresh for MVP
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      await deleteMedicine(id);
      window.location.reload();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Medicine Inventory</h1>
        <button onClick={() => { handleCancel(); setIsEditing(true); }} className="btn btn-primary">+ Add Medicine</button>
      </div>

      {isEditing && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>{currentMed ? 'Edit Medicine' : 'Add New Medicine'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.5rem' }} />
            <input placeholder="Generic Name" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})} style={{ padding: '0.5rem' }} />
            <input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.5rem' }} />
            <input required type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '0.5rem' }} />
            <input required type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ padding: '0.5rem' }} />
            <input type="date" placeholder="Expiry Date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} style={{ padding: '0.5rem' }} />
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea required placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} rows={3} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={formData.requiresPrescription} onChange={e => setFormData({...formData, requiresPrescription: e.target.checked})} />
              Requires Prescription
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Medicine</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input type="text" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem', flex: 1, borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }} />
        <select value={filterStock} onChange={e => setFilterStock(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ccc' }}>
          <option value="ALL">All Stock Levels</option>
          <option value="IN_STOCK">In Stock (&gt;20)</option>
          <option value="LOW_STOCK">Low Stock (1-20)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0)</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Rx Required</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(med => (
              <tr key={med.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '1rem' }}>
                  <strong>{med.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{med.category || 'Uncategorized'}</div>
                </td>
                <td style={{ padding: '1rem' }}>${med.price.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    color: med.stock === 0 ? 'var(--color-danger)' : med.stock <= 20 ? 'var(--color-warning)' : 'var(--color-success)',
                    fontWeight: 'bold' 
                  }}>
                    {med.stock}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{med.requiresPrescription ? 'Yes' : 'No'}</td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(med)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Edit</button>
                  <button onClick={() => handleDelete(med.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', backgroundColor: 'var(--color-danger)' }}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No medicines found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
