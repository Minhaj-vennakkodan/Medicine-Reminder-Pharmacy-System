import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/customer/dashboard');
  }
  
  return payload;
}

export async function requireAdminAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    throw new Error('Unauthorized');
  }
  
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  
  return payload;
}
