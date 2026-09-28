"use server";

import prisma from '@/lib/prisma';
import { requireCustomerAction } from '@/lib/customerAuth';
import { revalidatePath } from 'next/cache';

export async function placeOrder(formData: FormData) {
  const user = await requireCustomerAction();
  
  const paymentMethod = formData.get('paymentMethod') as string;
  const prescriptionId = formData.get('prescriptionId') as string;
  
  // Load Cart
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { medicine: true }
  });

  if (cartItems.length === 0) {
    throw new Error('Your cart is empty.');
  }

  // Calculate totals and validate
  let subtotal = 0;
  let requiresRx = false;

  for (const item of cartItems) {
    if (item.quantity > item.medicine.stock) {
      throw new Error(`Not enough stock for ${item.medicine.name}`);
    }
    subtotal += (item.medicine.price * item.quantity);
    if (item.medicine.requiresPrescription) {
      requiresRx = true;
    }
  }

  if (requiresRx) {
    if (!prescriptionId) {
      throw new Error('A verified prescription is required for one or more items in your cart.');
    }
    const rx = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!rx || rx.userId !== user.userId || rx.status !== 'VERIFIED') {
      throw new Error('Selected prescription is invalid or not verified.');
    }
  }

  const deliveryCharge = subtotal > 50 ? 0 : 5.00;
  const totalAmount = subtotal + deliveryCharge;

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create order
    const order = await tx.order.create({
      data: {
        userId: user.userId,
        totalAmount,
        status: 'Order Placed',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID', // Simplified payment mock
        prescriptionId: requiresRx ? prescriptionId : null,
      }
    });

    // 2. Create order items and reduce stock
    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.medicine.price
        }
      });

      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // 3. Clear cart
    await tx.cartItem.deleteMany({
      where: { userId: user.userId }
    });

    return order;
  });

  revalidatePath('/customer/orders');
  revalidatePath('/customer/cart');
  
  return { success: true, orderId: result.id };
}
