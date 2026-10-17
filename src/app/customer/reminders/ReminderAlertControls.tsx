"use client";

import { useState } from 'react';
import { requestNotificationPermission, playReminderChime } from '@/lib/reminderAudio';
import { showAppToast } from '@/components/Toast';

export default function ReminderAlertControls() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
      playReminderChime();
      showAppToast('Browser notifications enabled! You will be alerted when medicine time arrives.', 'success');
    } else {
      showAppToast('Notification permission was not granted. Alerts will still display in the app.', 'info');
    }
  };

  const handleTestAlert = () => {
    window.dispatchEvent(new CustomEvent('test-reminder-alert'));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {permission !== 'granted' ? (
        <button
          type="button"
          onClick={handleEnableNotifications}
          className="btn"
          style={{
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '0.45rem 0.9rem',
            fontSize: '0.8125rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'background-color 0.15s ease',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span>Enable Sound & Push Alerts</span>
        </button>
      ) : (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.775rem',
            fontWeight: '600',
            color: '#059669',
            backgroundColor: '#ECFDF5',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid #A7F3D0',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
          <span>Audio & Push Alerts Active</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleTestAlert}
        className="btn btn-secondary"
        style={{
          padding: '0.45rem 0.9rem',
          fontSize: '0.8125rem',
          fontWeight: '600',
          borderRadius: 'var(--radius-md, 8px)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Test Alert</span>
      </button>
    </div>
  );
}
