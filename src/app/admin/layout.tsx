import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--glass-border)', padding: '2rem 1rem' }}>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem', textAlign: 'center' }}>Pharmacy Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin/dashboard" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Dashboard</Link>
          <Link href="/admin/medicines" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Medicines</Link>
          <Link href="/admin/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Orders</Link>
          <Link href="/admin/prescriptions" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Prescriptions</Link>
          <Link href="/admin/customers" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Customers</Link>
          <Link href="/admin/reports" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Reports</Link>
          <Link href="/admin/settings" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Settings</Link>
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
