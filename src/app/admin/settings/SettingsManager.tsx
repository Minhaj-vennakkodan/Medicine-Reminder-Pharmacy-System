"use client";

import { useState } from 'react';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>System Settings</h1>
      
      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '4px', marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px' }}>
          {['Profile', 'General Settings', 'Notifications', 'Order Settings', 'Security', 'System Status'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ justifyContent: 'flex-start', border: activeTab === tab ? 'none' : '1px solid transparent', backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'transparent', textAlign: 'left' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="card" style={{ flex: 1, padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>{activeTab}</h2>
          
          <form onSubmit={handleSave}>
            {activeTab === 'Profile' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pharmacy Name</label>
                  <input type="text" defaultValue="Medicine Reminder & Pharmacy System" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Support Email</label>
                  <input type="email" defaultValue="support@pharmacy.com" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>
            )}

            {activeTab === 'Order Settings' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Standard Delivery Charge ($)</label>
                  <input type="number" step="0.01" defaultValue="5.00" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Free Delivery Threshold ($)</label>
                  <input type="number" step="0.01" defaultValue="50.00" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <input type="checkbox" defaultChecked />
                  Require admin approval for orders over $500
                </label>
              </div>
            )}

            {activeTab === 'System Status' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <p><strong>Database:</strong> SQLite (Connected)</p>
                <p><strong>Authentication:</strong> JWT Secure Cookies (Active)</p>
                <p><strong>Version:</strong> v1.0.0</p>
                <p><strong>Environment:</strong> Development</p>
              </div>
            )}

            {/* Placeholder for unimplemented tabs */}
            {['General Settings', 'Notifications', 'Security'].includes(activeTab) && (
              <p style={{ color: 'var(--color-text-muted)' }}>Configuration options for {activeTab} will be available in a future update.</p>
            )}

            {!['System Status'].includes(activeTab) && (
              <div style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
