"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppNotification,
  INITIAL_NOTIFICATIONS,
  getStoredNotifications,
  saveStoredNotifications,
} from '@/lib/notifications';

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'REMINDERS' | 'ORDERS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Load and listen to notifications sync
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifications(getStoredNotifications());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification[]>;
      if (customEvent.detail) {
        setNotifications(customEvent.detail);
      } else {
        setNotifications(getStoredNotifications());
      }
    };

    window.addEventListener('notifications-changed', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('notifications-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const remindersCount = notifications.filter(n => n.category === 'REMINDER').length;
  const ordersCount = notifications.filter(n => n.category === 'ORDER').length;

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const toggleReadStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map(n => (n.id === id ? { ...n, read: !n.read } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const clearReadNotifications = () => {
    const updated = notifications.filter(n => !n.read);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const resetSampleNotifications = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
    saveStoredNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleItemClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    router.push(notification.link);
  };

  // Filter items
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'UNREAD' && n.read) return false;
    if (activeFilter === 'REMINDERS' && n.category !== 'REMINDER') return false;
    if (activeFilter === 'ORDERS' && n.category !== 'ORDER') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMessage = n.message.toLowerCase().includes(q);
      if (!matchTitle && !matchMessage) return false;
    }

    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'MEDICINE_REMINDER':
        return (
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        );
      case 'UPCOMING_DOSE':
        return (
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'ORDER_UPDATE':
        return (
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: '#EEF2FF', color: '#4F46E5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a1.5 1.5 0 00-1.5-1.5H4.5A1.5 1.5 0 003 4.5v9.75" />
            </svg>
          </div>
        );
      case 'ORDER_DELIVERED':
        return (
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'PRESCRIPTION_UPDATE':
        return (
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
        );
      case 'LOW_STOCK':
        return (
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: AppNotification['category']) => {
    switch (category) {
      case 'REMINDER':
        return <span className="badge badge-info">Medicine Reminder</span>;
      case 'ORDER':
        return <span className="badge badge-neutral">Pharmacy Order</span>;
      case 'PRESCRIPTION':
        return <span className="badge badge-success">Prescription</span>;
      case 'ALERT':
        return <span className="badge badge-warning">Stock Alert</span>;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/customer/dashboard" style={{ color: 'var(--color-text-muted)' }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Notifications</span>
          </div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">
            Stay on top of scheduled dosage alerts, order dispatch updates, and prescription verification notices.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              Mark All as Read
            </button>
          )}

          {notifications.some(n => n.read) && (
            <button
              type="button"
              onClick={clearReadNotifications}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              Clear Read
            </button>
          )}

          {notifications.length === 0 && (
            <button
              type="button"
              onClick={resetSampleNotifications}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              Restore Sample Alerts
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(
            [
              { key: 'ALL', label: 'All', count: notifications.length },
              { key: 'UNREAD', label: 'Unread', count: unreadCount },
              { key: 'REMINDERS', label: 'Medicine Reminders', count: remindersCount },
              { key: 'ORDERS', label: 'Orders & Shipping', count: ordersCount },
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.95rem',
                fontSize: '0.8125rem',
                fontWeight: activeFilter === tab.key ? '600' : '500',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${activeFilter === tab.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: activeFilter === tab.key ? 'var(--color-primary-light)' : 'var(--color-surface)',
                color: activeFilter === tab.key ? 'var(--color-primary)' : 'var(--color-text-main)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  style={{
                    backgroundColor: activeFilter === tab.key ? 'var(--color-primary)' : '#E2E8F0',
                    color: activeFilter === tab.key ? 'white' : 'var(--color-text-muted)',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ minWidth: '220px', flex: '1 1 220px', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
            margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
            No notifications found
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            {activeFilter === 'UNREAD'
              ? 'Great job! You have marked all current health alerts and order updates as read.'
              : 'There are no notifications matching your current filter criteria.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {activeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem' }}
              >
                View All Notifications
              </button>
            )}
            <Link href="/customer/dashboard" className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleItemClick(notification)}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: notification.read ? '1px solid var(--color-border)' : '4px solid var(--color-primary)',
                backgroundColor: notification.read ? 'var(--color-surface)' : 'var(--color-primary-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem',
                flexWrap: 'wrap',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Left: Icon + Content */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 360px' }}>
                {getNotificationIcon(notification.type)}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '0.9375rem',
                      fontWeight: notification.read ? '600' : '700',
                      color: 'var(--color-text-main)'
                    }}>
                      {notification.title}
                    </h4>

                    {getCategoryBadge(notification.category)}

                    {!notification.read && (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-primary)',
                          display: 'inline-block'
                        }}
                      />
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.84375rem', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>
                    {notification.message}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.4rem' }}>
                    Received {notification.timeAgo}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                {notification.actionLabel && (
                  <span
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', pointerEvents: 'none' }}
                  >
                    {notification.actionLabel} &rarr;
                  </span>
                )}

                <button
                  type="button"
                  title={notification.read ? 'Mark as unread' : 'Mark as read'}
                  onClick={(e) => toggleReadStatus(notification.id, e)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {notification.read ? 'Mark Unread' : 'Mark Read'}
                </button>

                <button
                  type="button"
                  title="Remove notification"
                  onClick={(e) => deleteNotification(notification.id, e)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-light)',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-light)'; }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
