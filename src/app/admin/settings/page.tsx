import { requireAdmin } from '@/lib/adminAuth';
import SettingsManager from './SettingsManager';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAdmin();
  return <SettingsManager />;
}
