"use server";

import prisma from '@/lib/prisma';
import { requireAdminAction } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

export async function updatePrescriptionStatus(id: string, status: string, notes: string) {
  await requireAdminAction();
  
  await prisma.prescription.update({
    where: { id },
    data: { status, notes }
  });
  
  revalidatePath('/admin/prescriptions');
}
