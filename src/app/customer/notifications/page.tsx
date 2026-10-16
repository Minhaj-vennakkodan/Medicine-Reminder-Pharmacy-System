import { requireCustomer } from '@/lib/customerAuth';
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  await requireCustomer();

  return <NotificationsClient />;
}
