'use server';

import prisma from '@/lib/prisma';
import { requireCustomerAction } from '@/lib/customerAuth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createReminder(formData: FormData) {
  const session = await requireCustomerAction();
  
  const medicineName = formData.get('medicineName') as string;
  const medicineId = formData.get('medicineId') as string || null;
  const dosage = formData.get('dosage') as string;
  const time = formData.get('time') as string;
  const frequency = formData.get('frequency') as string;
  const daysOfWeek = formData.get('daysOfWeek') as string || null;
  const mealTiming = formData.get('mealTiming') as string || null;
  const startDate = new Date(formData.get('startDate') as string);
  
  const endDateStr = formData.get('endDate') as string;
  const endDate = endDateStr ? new Date(endDateStr) : null;
  const notificationPref = formData.get('notificationPref') as string;
  const notes = formData.get('notes') as string || null;

  await prisma.reminder.create({
    data: {
      userId: session.userId,
      medicineName,
      medicineId,
      dosage,
      time,
      frequency,
      daysOfWeek,
      mealTiming,
      startDate,
      endDate,
      notificationPref,
      notes
    }
  });

  revalidatePath('/customer/reminders');
  redirect('/customer/reminders');
}

export async function updateReminder(id: string, formData: FormData) {
  const session = await requireCustomerAction();

  const reminder = await prisma.reminder.findUnique({
    where: { id }
  });

  if (!reminder || reminder.userId !== session.userId) {
    throw new Error("Unauthorized");
  }

  const medicineName = formData.get('medicineName') as string;
  const medicineId = formData.get('medicineId') as string || null;
  const dosage = formData.get('dosage') as string;
  const time = formData.get('time') as string;
  const frequency = formData.get('frequency') as string;
  const daysOfWeek = formData.get('daysOfWeek') as string || null;
  const mealTiming = formData.get('mealTiming') as string || null;
  const startDate = new Date(formData.get('startDate') as string);
  
  const endDateStr = formData.get('endDate') as string;
  const endDate = endDateStr ? new Date(endDateStr) : null;
  const notificationPref = formData.get('notificationPref') as string;
  const notes = formData.get('notes') as string || null;
  const isActive = formData.get('isActive') === 'true';

  await prisma.reminder.update({
    where: { id },
    data: {
      medicineName,
      medicineId,
      dosage,
      time,
      frequency,
      daysOfWeek,
      mealTiming,
      startDate,
      endDate,
      notificationPref,
      notes,
      isActive
    }
  });

  revalidatePath('/customer/reminders');
  redirect('/customer/reminders');
}

export async function deleteReminder(id: string) {
  const session = await requireCustomerAction();

  const reminder = await prisma.reminder.findUnique({
    where: { id }
  });

  if (!reminder || reminder.userId !== session.userId) {
    throw new Error("Unauthorized");
  }

  await prisma.reminder.delete({
    where: { id }
  });

  revalidatePath('/customer/reminders');
}

export async function logReminderStatus(reminderId: string, scheduledFor: Date, status: 'PENDING' | 'COMPLETED' | 'MISSED') {
  const session = await requireCustomerAction();

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId }
  });

  if (!reminder || reminder.userId !== session.userId) {
    throw new Error("Unauthorized");
  }

  await prisma.reminderLog.upsert({
    where: {
      reminderId_scheduledFor: {
        reminderId,
        scheduledFor
      }
    },
    update: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null
    },
    create: {
      reminderId,
      scheduledFor,
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null
    }
  });

  revalidatePath('/customer/reminders');
}
