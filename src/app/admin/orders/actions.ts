"use server";

import prisma from '@/lib/prisma';
import { requireAdminAction } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdminAction();
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  
  revalidatePath('/admin/orders');
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await requireAdminAction();
  
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus }
  });
  
  revalidatePath('/admin/orders');
}
