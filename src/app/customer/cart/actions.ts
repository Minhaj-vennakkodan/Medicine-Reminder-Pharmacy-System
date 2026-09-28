"use server";

import prisma from '@/lib/prisma';
import { requireCustomerAction } from '@/lib/customerAuth';
import { revalidatePath } from 'next/cache';

export async function addToCart(medicineId: string, quantity: number) {
  const user = await requireCustomerAction();
  
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) throw new Error('Medicine not found');
  if (medicine.stock < quantity) throw new Error('Not enough stock');

  const existingCartItem = await prisma.cartItem.findFirst({
    where: { userId: user.userId, medicineId }
  });

  if (existingCartItem) {
    await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: user.userId,
        medicineId,
        quantity
      }
    });
  }

  revalidatePath('/customer/cart');
  revalidatePath('/customer/medicines');
  return { success: true };
}
