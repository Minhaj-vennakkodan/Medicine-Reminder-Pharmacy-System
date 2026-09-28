"use server";

import prisma from '@/lib/prisma';
import { requireCustomerAction } from '@/lib/customerAuth';
import { revalidatePath } from 'next/cache';

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const user = await requireCustomerAction();
  
  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: cartItemId, userId: user.userId }
    });
  } else {
    // Validate stock
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { medicine: true }
    });
    
    if (!cartItem) throw new Error('Item not found');
    if (quantity > cartItem.medicine.stock) throw new Error('Not enough stock available');
    
    await prisma.cartItem.update({
      where: { id: cartItemId, userId: user.userId },
      data: { quantity }
    });
  }
  
  revalidatePath('/customer/cart');
}

export async function removeCartItem(cartItemId: string) {
  const user = await requireCustomerAction();
  
  await prisma.cartItem.delete({
    where: { id: cartItemId, userId: user.userId }
  });
  
  revalidatePath('/customer/cart');
}
