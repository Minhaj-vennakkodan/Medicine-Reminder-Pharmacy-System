"use server";

import prisma from '@/lib/prisma';
import { requireAdminAction } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

export async function addMedicine(data: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  await requireAdminAction();
  await prisma.medicine.create({
    data: {
      name: data.name,
      genericName: data.genericName,
      category: data.category,
      description: data.description,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      requiresPrescription: data.requiresPrescription === 'true' || data.requiresPrescription === true,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    }
  });
  revalidatePath('/admin/medicines');
}

export async function updateMedicine(id: string, data: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  await requireAdminAction();
  await prisma.medicine.update({
    where: { id },
    data: {
      name: data.name,
      genericName: data.genericName,
      category: data.category,
      description: data.description,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      requiresPrescription: data.requiresPrescription === 'true' || data.requiresPrescription === true,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    }
  });
  revalidatePath('/admin/medicines');
}

export async function deleteMedicine(id: string) {
  await requireAdminAction();
  await prisma.medicine.delete({ where: { id } });
  revalidatePath('/admin/medicines');
}
