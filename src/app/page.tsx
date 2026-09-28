import Link from 'next/link';

export default function Home() {
  return (
    <main className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Medicine Reminder & Pharmacy System</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Your premium destination for managing medicines, tracking orders, and setting health reminders seamlessly.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary">Login</Link>
          <Link href="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
    </main>
  );
}
