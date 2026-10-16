export type NotificationType =
  | 'MEDICINE_REMINDER'
  | 'UPCOMING_DOSE'
  | 'ORDER_UPDATE'
  | 'ORDER_DELIVERED'
  | 'PRESCRIPTION_UPDATE'
  | 'LOW_STOCK';

export type NotificationCategory = 'REMINDER' | 'ORDER' | 'PRESCRIPTION' | 'ALERT';

export interface AppNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
  link: string;
  actionLabel?: string;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'MEDICINE_REMINDER',
    category: 'REMINDER',
    title: 'Time to take your medicine',
    message: 'Take Metformin 500mg with a glass of water (After Meal).',
    timestamp: '2026-10-15T08:00:00Z',
    timeAgo: '10m ago',
    read: false,
    link: '/customer/reminders',
    actionLabel: 'View Schedule'
  },
  {
    id: 'notif-2',
    type: 'ORDER_UPDATE',
    category: 'ORDER',
    title: 'Your medicine order has been shipped',
    message: 'Order #ORD-88912 is out for delivery with Express Medical Courier.',
    timestamp: '2026-10-15T07:15:00Z',
    timeAgo: '55m ago',
    read: false,
    link: '/customer/orders',
    actionLabel: 'Track Delivery'
  },
  {
    id: 'notif-3',
    type: 'UPCOMING_DOSE',
    category: 'REMINDER',
    title: 'Your next dose is scheduled soon',
    message: 'Atorvastatin 20mg is scheduled for 08:30 PM tonight.',
    timestamp: '2026-10-15T06:30:00Z',
    timeAgo: '2h ago',
    read: false,
    link: '/customer/reminders',
    actionLabel: 'Reminders'
  },
  {
    id: 'notif-4',
    type: 'PRESCRIPTION_UPDATE',
    category: 'PRESCRIPTION',
    title: 'Your prescription verification is complete',
    message: 'Prescription #RX-5501 has been verified and approved by Dr. Aris Thorne.',
    timestamp: '2026-10-14T14:20:00Z',
    timeAgo: 'Yesterday',
    read: true,
    link: '/customer/prescriptions',
    actionLabel: 'View Rx'
  },
  {
    id: 'notif-5',
    type: 'LOW_STOCK',
    category: 'ALERT',
    title: 'Your medicine stock is running low',
    message: 'Only 3 doses of Metformin remaining based on your daily schedule. Consider a refill.',
    timestamp: '2026-10-14T11:00:00Z',
    timeAgo: 'Yesterday',
    read: true,
    link: '/customer/medicines',
    actionLabel: 'Order Refill'
  },
  {
    id: 'notif-6',
    type: 'ORDER_DELIVERED',
    category: 'ORDER',
    title: 'Your order has been delivered',
    message: 'Order #ORD-77401 was safely delivered to your saved home address.',
    timestamp: '2026-10-13T16:45:00Z',
    timeAgo: '2d ago',
    read: true,
    link: '/customer/orders',
    actionLabel: 'Order Details'
  }
];

const NOTIFICATIONS_STORAGE_KEY = 'healthcare_rx_notifications_v1';

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn('Failed to parse notifications from localStorage:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('notifications-changed', { detail: notifications }));
  } catch (err) {
    console.warn('Failed to save notifications to localStorage:', err);
  }
}
