"use client";

import { useEffect, useState, useTransition, useCallback } from 'react';
import { getActiveRemindersForToday, markReminderAsCompleted } from '@/app/customer/reminders/actions';
import { playReminderChime, sendDesktopNotification } from '@/lib/reminderAudio';
import { showAppToast } from '@/components/Toast';
import { getStoredNotifications, saveStoredNotifications, AppNotification } from '@/lib/notifications';

interface ActiveReminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string; // "HH:MM" (24h)
  mealTiming: string;
  status: string;
  notificationPref: string;
}

export default function ReminderWatcher() {
  const [reminders, setReminders] = useState<ActiveReminder[]>([]);
  const [activeAlert, setActiveAlert] = useState<ActiveReminder | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load active reminders from server
  const refreshReminders = useCallback(async () => {
    try {
      const data = await getActiveRemindersForToday();
      setReminders(data);
    } catch {
      // Quiet fail if not logged in or network blip
    }
  }, []);

  // Trigger alert sound, desktop push, in-app notification, and modal
  const triggerAlert = useCallback((reminder: ActiveReminder) => {
    setActiveAlert(reminder);

    // 1. Play audio chime
    playReminderChime();

    // 2. Format meal text
    const mealText = reminder.mealTiming ? reminder.mealTiming.replace(/_/g, ' ') : 'Anytime';

    // 3. Desktop / Mobile System Push Notification
    sendDesktopNotification(
      `🔔 Time to take ${reminder.medicineName}!`,
      `Scheduled Dose: ${reminder.dosage} (${mealText}). Time: ${reminder.time}`
    );

    // 4. Save to in-app Notification Center (NotificationBell)
    try {
      const existing = getStoredNotifications();
      const newNotification: AppNotification = {
        id: `reminder-due-${reminder.id}-${Date.now()}`,
        type: 'MEDICINE_REMINDER',
        category: 'REMINDER',
        title: `Medicine Due: ${reminder.medicineName}`,
        message: `Take ${reminder.dosage} (${mealText}) now. Scheduled for ${reminder.time}.`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        read: false,
        link: '/customer/reminders',
        actionLabel: 'View Schedule',
      };
      saveStoredNotifications([newNotification, ...existing]);
    } catch (e) {
      console.warn('Failed to add to in-app notifications:', e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshReminders();

    // Re-check from server every 60 seconds
    const serverInterval = setInterval(refreshReminders, 60 * 1000);

    // Listen for custom trigger to re-fetch or test
    const handleTestAlert = (e: Event) => {
      const customEvent = e as CustomEvent<ActiveReminder | undefined>;
      const sample = customEvent.detail || {
        id: 'test-sample-id',
        medicineName: 'Paracetamol & Vitamin C',
        dosage: '500 mg (1 tablet)',
        time: new Date().toTimeString().slice(0, 5),
        mealTiming: 'AFTER_MEAL',
        status: 'PENDING',
        notificationPref: 'APP'
      };

      triggerAlert(sample);
    };

    window.addEventListener('test-reminder-alert', handleTestAlert);

    return () => {
      clearInterval(serverInterval);
      window.removeEventListener('test-reminder-alert', handleTestAlert);
    };
  }, [refreshReminders, triggerAlert]);

  // Check clock every 10 seconds against reminders
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      // Key to track what has already fired today in this session
      const firedKey = `reminder_fired_${todayDateStr}_${currentTimeStr}`;
      const firedIds: string[] = JSON.parse(sessionStorage.getItem(firedKey) || '[]');

      for (const reminder of reminders) {
        if (reminder.status !== 'PENDING') continue;

        // Check if reminder matches current minute
        if (reminder.time === currentTimeStr && !firedIds.includes(reminder.id)) {
          // Mark fired for this minute
          firedIds.push(reminder.id);
          sessionStorage.setItem(firedKey, JSON.stringify(firedIds));

          triggerAlert(reminder);
          break; // alert one at a time
        }
      }
    };

    // Run check immediately, then every 10 seconds
    checkClock();
    const timer = setInterval(checkClock, 10 * 1000);

    return () => clearInterval(timer);
  }, [reminders, triggerAlert]);

  const handleMarkAsTaken = () => {
    if (!activeAlert) return;
    const currentAlert = activeAlert;

    startTransition(async () => {
      try {
        if (currentAlert.id !== 'test-sample-id') {
          await markReminderAsCompleted(currentAlert.id);
        }
        showAppToast(`Great job! Marked ${currentAlert.medicineName} as taken.`, 'success');
        setActiveAlert(null);
        refreshReminders();
      } catch (err) {
        showAppToast(err instanceof Error ? err.message : 'Failed to update reminder', 'error');
      }
    });
  };

  const handleSnooze = () => {
    if (!activeAlert) return;
    const medName = activeAlert.medicineName;
    const alertToSnooze = activeAlert;
    setActiveAlert(null);
    showAppToast(`Snoozed ${medName} for 10 minutes.`, 'info');

    // Snooze timer for 10 mins (or 15s in test mode)
    const snoozeDurationMs = alertToSnooze.id === 'test-sample-id' ? 15 * 1000 : 10 * 60 * 1000;
    setTimeout(() => {
      triggerAlert(alertToSnooze);
    }, snoozeDurationMs);
  };

  if (!activeAlert) return null;

  const mealFormatted = activeAlert.mealTiming ? activeAlert.mealTiming.replace(/_/g, ' ') : 'ANYTIME';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        animation: 'alertFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 118, 110, 0.25), 0 12px 24px -6px rgba(0, 0, 0, 0.15)',
          border: '2px solid rgba(15, 118, 110, 0.2)',
          overflow: 'hidden',
          animation: 'alertSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
            padding: '1.25rem 1.75rem',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'bellShake 1.5s infinite ease-in-out',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.075em', fontWeight: '700', opacity: 0.9 }}>
                Medicine Reminder
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                Time for your Dose!
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.3rem 0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              letterSpacing: '0.025em',
            }}
          >
            {activeAlert.time}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#F0FDFA',
                border: '1px solid #CCFBF1',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                flexShrink: 0,
              }}
            >
              💊
            </div>
            <div>
              <h2
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.45rem',
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: '-0.025em',
                }}
              >
                {activeAlert.medicineName}
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
                Prescribed dosage schedule
              </p>
            </div>
          </div>

          {/* Details pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              {activeAlert.dosage}
            </span>

            <span
              style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              🍽️ {mealFormatted}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>
            Taking your medicine at the prescribed time ensures maximum treatment efficacy. Please take with water.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Primary: Mark Taken */}
          <button
            type="button"
            onClick={handleMarkAsTaken}
            disabled={isPending}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              backgroundColor: '#0F766E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(15, 118, 110, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isPending ? (
              <span>Updating...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Mark as Taken</span>
              </>
            )}
          </button>

          {/* Secondary Actions Row */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleSnooze}
              disabled={isPending}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                color: '#0F766E',
                border: '1px solid #CCFBF1',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Snooze 10m</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              disabled={isPending}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes alertFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes alertSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes bellShake {
            0%, 100% { transform: rotate(0deg); }
            15% { transform: rotate(14deg); }
            30% { transform: rotate(-14deg); }
            45% { transform: rotate(10deg); }
            60% { transform: rotate(-10deg); }
            75% { transform: rotate(4deg); }
          }
        `
      }} />
    </div>
  );
}
