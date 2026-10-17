import Link from 'next/link';
import { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import ToastContainer from '@/components/Toast';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer />
      {/* Premium Top Navigation */}
      <header style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <Link href="/customer/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ 
                width: '32px', height: '32px', 
                backgroundColor: 'var(--color-primary)', 
                color: 'white', 
                borderRadius: '8px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '1.25rem'
              }}>
                +
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text-main)', letterSpacing: '-0.025em' }}>
                HealthCare Rx
              </span>
            </Link>
            
            {/* Desktop Nav */}
            <nav style={{ gap: '2rem', alignItems: 'center' }} className="desktop-nav">
              <Link href="/customer/dashboard" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Dashboard</Link>
              <Link href="/customer/medicines" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Pharmacy</Link>
              <Link href="/customer/prescriptions" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Prescriptions</Link>
              <Link href="/customer/reminders" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Reminders</Link>
              <Link href="/customer/profile" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Profile</Link>
            </nav>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <Link href="/customer/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.875rem', fontWeight: '500' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Cart</span>
            </Link>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>
            <Link href="/customer/orders" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Orders</Link>
            <Link href="/customer/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-primary)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path>
              </svg>
              <span>Profile</span>
            </Link>
            <a href="/api/auth/logout" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-danger)' }}>Logout</a>
          </div>
        </div>
      </header>
      
      {/* Mobile Nav Fallback (Very simple for now) */}
      <div className="mobile-nav" style={{ 
        display: 'none', 
        padding: '0.75rem 1rem', 
        backgroundColor: 'var(--color-surface)', 
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/customer/dashboard" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Dashboard</Link>
          <Link href="/customer/medicines" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Pharmacy</Link>
          <Link href="/customer/prescriptions" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Prescriptions</Link>
          <Link href="/customer/reminders" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Reminders</Link>
          <Link href="/customer/notifications" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Notifications</Link>
          <Link href="/customer/profile" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Profile</Link>
        </nav>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
      `}} />

      {/* Main Content */}
      <main className="page-wrapper" style={{ flex: 1 }}>
        <div className="container animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
