import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)' }}>
      {/* Premium Header */}
      <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700', fontSize: '1.25rem', color: 'var(--color-text-main)' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            +
          </div>
          HealthCare Rx
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" className="btn btn-secondary">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Create Account</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4rem 2rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          
          <div className="animate-fade-in">
            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Next-Generation Pharmacy Platform
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-text-main)', lineHeight: '1.1', letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>
              Manage your <span style={{ color: 'var(--color-primary)' }}>health</span> with enterprise precision.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '480px', lineHeight: '1.6' }}>
              The complete solution for ordering medicines, uploading prescriptions, and tracking your daily health reminders in one secure place.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Get Started</Link>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Access Dashboard</Link>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ 
              backgroundColor: 'var(--color-background)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-xl)', 
              boxShadow: 'var(--shadow-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E2E8F0' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E2E8F0' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E2E8F0' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'var(--color-primary-light)' }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  <div style={{ width: '60%', height: '12px', borderRadius: '4px', backgroundColor: 'var(--color-border)' }}></div>
                  <div style={{ width: '40%', height: '12px', borderRadius: '4px', backgroundColor: 'var(--color-border)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ flex: 1, height: '120px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}></div>
                <div style={{ flex: 1, height: '120px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}></div>
              </div>
              <div style={{ width: '100%', height: '200px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', marginTop: '1rem' }}></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
