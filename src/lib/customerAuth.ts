import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  const payload = await verifySessionToken(token);
  if (!payload) {
    redirect('/login');
  }
  
  return payload;
}

export async function requireCustomerAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    throw new Error('Unauthorized');
  }
  
  const payload = await verifySessionToken(token);
  if (!payload) {
    throw new Error('Unauthorized');
  }
  
  return payload;
}
