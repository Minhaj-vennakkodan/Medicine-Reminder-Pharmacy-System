"use server";

import prisma from '@/lib/prisma';
import { requireCustomerAction } from '@/lib/customerAuth';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPrescription(formData: FormData) {
  const user = await requireCustomerAction();
  
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file uploaded');

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.');
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const filename = `${uuidv4()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filePath = join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${filename}`;

  await prisma.prescription.create({
    data: {
      userId: user.userId,
      fileUrl,
      status: 'PENDING'
    }
  });

  revalidatePath('/customer/prescriptions');
  return { success: true };
}
