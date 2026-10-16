import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import type { Order, Reminder, Prescription } from '@prisma/client';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sessionUser = await requireCustomer();

  let dbUser = null;
  let recentOrders: Order[] = [];
  let userReminders: Reminder[] = [];
  let userPrescriptions: Prescription[] = [];

  try {
    const [fetchedUser, orders, reminders, prescriptions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.order.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.reminder.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.prescription.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    dbUser = fetchedUser;
    recentOrders = orders;
    userReminders = reminders;
    userPrescriptions = prescriptions;
  } catch (error) {
    console.warn('ProfilePage: Unable to fetch full records from database, using session fallback:', error);
  }

  // Combine session payload with DB data if available, or fallback gracefully
  const userData = {
    id: sessionUser.id,
    name: dbUser?.name || sessionUser.name || 'John Doe',
    email: dbUser?.email || sessionUser.email || 'user@example.com',
    phone: dbUser?.phone || '+1 (555) 234-5678',
    role: dbUser?.role || sessionUser.role || 'CUSTOMER',
    createdAt: dbUser?.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
  };

  return (
    <ProfileClient 
      user={userData}
      initialOrders={recentOrders.map(o => ({
        id: o.id,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: new Date(o.createdAt).toISOString(),
        paymentStatus: o.paymentStatus || 'PENDING'
      }))}
      initialReminders={userReminders.map(r => ({
        id: r.id,
        medicineName: r.medicineName,
        dosage: r.dosage,
        time: r.time,
        frequency: r.frequency,
        mealTiming: r.mealTiming || 'ANYTIME',
        startDate: new Date(r.startDate).toISOString().split('T')[0],
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : null,
        isActive: r.isActive
      }))}
      initialPrescriptions={userPrescriptions.map(p => ({
        id: p.id,
        fileUrl: p.fileUrl,
        status: p.status,
        notes: p.notes,
        createdAt: new Date(p.createdAt).toISOString()
      }))}
    />
  );
}
