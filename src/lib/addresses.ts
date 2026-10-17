export interface DeliveryAddress {
  id: string;
  label: string; // "Home", "Office", "Clinic", "Other"
  fullName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  isDefault: boolean;
}

const STORAGE_PREFIX = 'healthcare_rx_addresses_v1';

export function getAddressesStorageKey(userId?: string): string {
  return `${STORAGE_PREFIX}_${userId || 'default'}`;
}

export function getDefaultFallbackAddresses(userName?: string, userPhone?: string): DeliveryAddress[] {
  return [
    {
      id: 'addr-default-1',
      label: 'Home',
      fullName: userName || 'Customer',
      street: '42 Healthway Boulevard, Suite 300',
      city: 'San Francisco',
      state: 'CA',
      pinCode: '94107',
      phone: userPhone || '+1 (555) 234-5678',
      isDefault: true,
    },
    {
      id: 'addr-default-2',
      label: 'Office',
      fullName: userName || 'Customer',
      street: '750 Market Street, 4th Floor',
      city: 'San Francisco',
      state: 'CA',
      pinCode: '94103',
      phone: userPhone || '+1 (555) 789-0123',
      isDefault: false,
    }
  ];
}

export function getUserAddresses(userId?: string, userName?: string, userPhone?: string): DeliveryAddress[] {
  if (typeof window === 'undefined') {
    return getDefaultFallbackAddresses(userName, userPhone);
  }

  try {
    const key = getAddressesStorageKey(userId);
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = getDefaultFallbackAddresses(userName, userPhone);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const fallback = getDefaultFallbackAddresses(userName, userPhone);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch (err) {
    console.warn('Failed to load addresses from localStorage:', err);
    return getDefaultFallbackAddresses(userName, userPhone);
  }
}

export function saveUserAddresses(addresses: DeliveryAddress[], userId?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getAddressesStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(addresses));
    window.dispatchEvent(new CustomEvent('addresses-changed', { detail: addresses }));
  } catch (err) {
    console.warn('Failed to save addresses to localStorage:', err);
  }
}

export function addUserAddress(
  newAddr: Omit<DeliveryAddress, 'id'>,
  userId?: string,
  userName?: string,
  userPhone?: string
): DeliveryAddress[] {
  const current = getUserAddresses(userId, userName, userPhone);
  const created: DeliveryAddress = {
    ...newAddr,
    id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isDefault: newAddr.isDefault || current.length === 0,
  };

  let updated: DeliveryAddress[];
  if (created.isDefault) {
    updated = current.map(a => ({ ...a, isDefault: false })).concat(created);
  } else {
    updated = [...current, created];
  }

  saveUserAddresses(updated, userId);
  return updated;
}
