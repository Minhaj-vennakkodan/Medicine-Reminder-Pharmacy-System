import Link from 'next/link';
import { ReactNode } from 'react';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--glass-border)', padding: '2rem 1rem' }}>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem', textAlign: 'center' }}>My Pharmacy</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/customer/dashboard" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Dashboard</Link>
          <Link href="/customer/medicines" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Shop Medicines</Link>
          <Link href="/customer/cart" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Shopping Cart</Link>
          <Link href="/customer/prescriptions" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>My Prescriptions</Link>
          <Link href="/customer/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>My Orders</Link>
          <Link href="/customer/reminders" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Medicine Reminders</Link>
          <a href="/api/auth/logout" className="btn btn-secondary" style={{ justifyContent: 'flex-start', color: 'var(--color-danger)', marginTop: '2rem', display: 'flex', textDecoration: 'none' }}>Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div className="container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
