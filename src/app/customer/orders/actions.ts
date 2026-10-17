"use server";

import prisma from '@/lib/prisma';
import { requireCustomerAction } from '@/lib/customerAuth';
import { revalidatePath } from 'next/cache';

export async function cancelOrder(orderId: string) {
  const user = await requireCustomerAction();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== user.id) {
    throw new Error('Order not found or unauthorized.');
  }

  if (order.status === 'Cancelled') {
    throw new Error('Order is already cancelled.');
  }

  if (order.status === 'Delivered') {
    throw new Error('Delivered orders cannot be cancelled.');
  }

  if (order.status === 'Out for Delivery') {
    throw new Error('Order is already out for delivery and cannot be cancelled online.');
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update order status and payment status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'Cancelled',
        paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'CANCELLED',
      },
    });

    // 2. Restore medicine stock
    for (const item of order.items) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  revalidatePath('/customer/orders');
  revalidatePath('/customer/profile');
  revalidatePath(`/customer/orders/${orderId}`);
  revalidatePath('/admin/orders');

  return { success: true, message: 'Order has been cancelled successfully.' };
}
