"use client";

import { useState } from 'react';
import { uploadPrescription } from './actions';

export default function PrescriptionManager({ prescriptions }: { prescriptions: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadPrescription(formData);
      alert('Prescription uploaded successfully!');
      setFile(null);
      // reset file input
      (document.getElementById('fileInput') as HTMLInputElement).value = '';
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Prescriptions</h1>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Upload New Prescription</h3>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            id="fileInput"
            type="file" 
            accept=".jpg,.jpeg,.png,.pdf" 
            onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', flex: 1, minWidth: '250px' }}
          />
          <button type="submit" disabled={!file || loading} className="btn btn-primary">
            {loading ? 'Uploading...' : 'Upload Prescription'}
          </button>
        </form>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          Supported formats: JPG, PNG, PDF. Max size: 5MB.
        </p>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Uploaded Prescriptions</h3>
      
      {prescriptions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          You have not uploaded any prescriptions yet.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Date Uploaded</th>
                <th style={{ padding: '1rem' }}>Document</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Admin Notes</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(rx => (
                <tr key={rx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(rx.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <a href={rx.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>View File</a>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: rx.status === 'VERIFIED' ? 'var(--color-success)' : rx.status === 'REJECTED' ? 'var(--color-danger)' : 'var(--color-warning)',
                      fontWeight: 'bold', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px'
                    }}>
                      {rx.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {rx.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
