import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Premium Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--color-text-main)', /* Slate 900 */
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Area */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}>
            <div style={{ 
              width: '28px', height: '28px', 
              backgroundColor: 'var(--color-primary)', 
              borderRadius: '6px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.2rem', fontWeight: 'bold' 
            }}>
              +
            </div>
            Rx Admin Pro
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Hospital Management
          </div>
        </div>
        
        {/* Nav Links */}
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <NavItem href="/admin/dashboard" label="Dashboard" />
          <div style={{ margin: '1rem 0 0.5rem 0.75rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: '600', letterSpacing: '0.05em' }}>Inventory</div>
          <NavItem href="/admin/medicines" label="Medicines" />
          
          <div style={{ margin: '1rem 0 0.5rem 0.75rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: '600', letterSpacing: '0.05em' }}>Operations</div>
          <NavItem href="/admin/orders" label="Orders" />
          <NavItem href="/admin/prescriptions" label="Prescriptions" />
          <NavItem href="/admin/customers" label="Patients / Users" />
          
          <div style={{ margin: '1rem 0 0.5rem 0.75rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: '600', letterSpacing: '0.05em' }}>System</div>
          <NavItem href="/admin/reports" label="Reports" />
          <NavItem href="/admin/settings" label="Settings" />
        </nav>
        
        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/api/auth/logout" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.75rem 1rem', 
            color: '#FCA5A5', /* Red 300 */
            textDecoration: 'none', 
            fontSize: '0.875rem', fontWeight: '500',
            borderRadius: 'var(--radius-md)',
            transition: 'background 0.2s'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{ 
          height: '4rem', 
          backgroundColor: 'var(--color-surface)', 
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
              AD
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Administrator</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: 0 }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} style={{ 
      display: 'block', 
      padding: '0.625rem 1rem', 
      color: 'rgba(255,255,255,0.85)', 
      textDecoration: 'none', 
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: 'var(--radius-md)',
      transition: 'all 0.15s ease'
    }}>
      {label}
    </Link>
  );
}
