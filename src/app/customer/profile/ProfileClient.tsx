"use client";

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import { getUserAddresses, saveUserAddresses, type DeliveryAddress } from '@/lib/addresses';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentStatus: string;
}

interface ReminderItem {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  frequency: string;
  mealTiming: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

interface PrescriptionItem {
  id: string;
  fileUrl: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface EmergencyContactData {
  name: string;
  relationship: string;
  phone: string;
  secondaryPhone: string;
}

interface ProfileClientProps {
  user: UserData;
  initialOrders: OrderItem[];
  initialReminders: ReminderItem[];
  initialPrescriptions: PrescriptionItem[];
}

export default function ProfileClient({
  user,
  initialOrders,
  initialReminders,
  initialPrescriptions,
}: ProfileClientProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'health' | 'meds' | 'emergency' | 'pharmacy' | 'security'>('all');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Profile Header & Photo
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('⚠️ File size must be under 4MB');
        return;
      }
      const preview = URL.createObjectURL(file);
      setAvatarUrl(preview);
      showToast('Profile photo updated successfully!');
    }
  };

  // 2. Personal Information
  const initialPersonalInfo = {
    fullName: user.name || 'John Doe',
    dob: '1992-06-15',
    gender: 'Male',
    phone: user.phone || '+1 (555) 234-5678',
    email: user.email || 'user@healthcare-rx.com',
    address: '42 Healthway Boulevard, Suite 300',
    city: 'San Francisco',
    state: 'California',
    pinCode: '94107',
  };
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState(initialPersonalInfo);

  const handleSavePersonal = (e: FormEvent) => {
    e.preventDefault();
    setPersonalInfo({ ...personalForm });
    setIsEditingPersonal(false);
    showToast('Personal information updated successfully!');
  };

  const handleCancelPersonal = () => {
    setPersonalForm({ ...personalInfo });
    setIsEditingPersonal(false);
  };

  // 3. Health Information
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [noKnownAllergies, setNoKnownAllergies] = useState(false);
  const [medicineAllergies, setMedicineAllergies] = useState<string[]>(['Penicillin', 'Sulfa Drugs']);
  const [newMedAllergy, setNewMedAllergy] = useState('');
  
  const [foodAllergies, setFoodAllergies] = useState<string[]>(['Peanuts', 'Lactose']);
  const [newFoodAllergy, setNewFoodAllergy] = useState('');

  const [noKnownConditions, setNoKnownConditions] = useState(false);
  const [conditions, setConditions] = useState<string[]>(['High Blood Pressure']);
  const [otherIllnesses, setOtherIllnesses] = useState('Mild seasonal bronchitis');
  const [pastSurgeries, setPastSurgeries] = useState('Appendectomy (2018)');

  const availableConditions = [
    'Diabetes',
    'High Blood Pressure',
    'Asthma',
    'Heart Disease',
    'Kidney Disease',
    'Other',
  ];

  const toggleCondition = (cond: string) => {
    if (noKnownConditions) setNoKnownConditions(false);
    setConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const addMedicineAllergy = () => {
    if (newMedAllergy.trim() && !medicineAllergies.includes(newMedAllergy.trim())) {
      if (noKnownAllergies) setNoKnownAllergies(false);
      setMedicineAllergies([...medicineAllergies, newMedAllergy.trim()]);
      setNewMedAllergy('');
    }
  };

  const removeMedicineAllergy = (item: string) => {
    setMedicineAllergies(medicineAllergies.filter(a => a !== item));
  };

  const addFoodAllergy = () => {
    if (newFoodAllergy.trim() && !foodAllergies.includes(newFoodAllergy.trim())) {
      setFoodAllergies([...foodAllergies, newFoodAllergy.trim()]);
      setNewFoodAllergy('');
    }
  };

  const removeFoodAllergy = (item: string) => {
    setFoodAllergies(foodAllergies.filter(a => a !== item));
  };

  const handleSaveHealthInfo = (e: FormEvent) => {
    e.preventDefault();
    showToast('Health and allergy information securely saved!');
  };

  // 4. Current Medications
  const sampleFallbackMedications: ReminderItem[] = [
    {
      id: 'med-1',
      medicineName: 'Metformin HCl',
      dosage: '500 mg (1 tablet)',
      frequency: 'DAILY',
      time: '08:00',
      mealTiming: 'AFTER_MEAL',
      startDate: '2026-01-10',
      endDate: '2026-12-31',
      isActive: true,
    },
    {
      id: 'med-2',
      medicineName: 'Atorvastatin',
      dosage: '20 mg (1 tablet)',
      frequency: 'DAILY',
      time: '20:30',
      mealTiming: 'BEFORE_MEAL',
      startDate: '2026-02-01',
      endDate: '2026-08-01',
      isActive: true,
    },
    {
      id: 'med-3',
      medicineName: 'Vitamin D3 & Calcium',
      dosage: '60,000 IU',
      frequency: 'WEEKLY',
      time: '09:00',
      mealTiming: 'WITH_MEAL',
      startDate: '2026-03-01',
      endDate: null,
      isActive: true,
    }
  ];

  const [medications, setMedications] = useState<ReminderItem[]>(
    initialReminders.length > 0 ? initialReminders : sampleFallbackMedications
  );

  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medForm, setMedForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'DAILY',
    time: '08:00',
    mealTiming: 'AFTER_MEAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const openAddMedModal = () => {
    setEditingMedId(null);
    setMedForm({
      medicineName: '',
      dosage: '',
      frequency: 'DAILY',
      time: '08:00',
      mealTiming: 'AFTER_MEAL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setIsMedModalOpen(true);
  };

  const openEditMedModal = (med: ReminderItem) => {
    setEditingMedId(med.id);
    setMedForm({
      medicineName: med.medicineName,
      dosage: med.dosage,
      frequency: med.frequency,
      time: med.time,
      mealTiming: med.mealTiming,
      startDate: med.startDate,
      endDate: med.endDate || '',
    });
    setIsMedModalOpen(true);
  };

  const handleSaveMedication = (e: FormEvent) => {
    e.preventDefault();
    if (!medForm.medicineName.trim() || !medForm.dosage.trim()) {
      showToast('⚠️ Please provide medication name and dosage.');
      return;
    }

    if (editingMedId) {
      setMedications(prev => prev.map(m => m.id === editingMedId ? {
        ...m,
        medicineName: medForm.medicineName,
        dosage: medForm.dosage,
        frequency: medForm.frequency,
        time: medForm.time,
        mealTiming: medForm.mealTiming,
        startDate: medForm.startDate,
        endDate: medForm.endDate || null,
      } : m));
      showToast('Medication updated successfully!');
    } else {
      const newMed: ReminderItem = {
        id: `med-${Date.now()}`,
        medicineName: medForm.medicineName,
        dosage: medForm.dosage,
        frequency: medForm.frequency,
        time: medForm.time,
        mealTiming: medForm.mealTiming,
        startDate: medForm.startDate,
        endDate: medForm.endDate || null,
        isActive: true,
      };
      setMedications([newMed, ...medications]);
      showToast('New medication added to schedule!');
    }
    setIsMedModalOpen(false);
  };

  const [medicationToDelete, setMedicationToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteMedication = (id: string) => {
    const med = medications.find(m => m.id === id);
    setMedicationToDelete({ id, name: med?.medicineName || 'this medication' });
  };

  // 5. Emergency Contact
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContactData>({
    name: 'Sarah Jenkins',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543',
    secondaryPhone: '+1 (555) 432-1098',
  });
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState(emergencyContact);

  const handleSaveEmergency = (e: FormEvent) => {
    e.preventDefault();
    setEmergencyContact({ ...emergencyForm });
    setIsEditingEmergency(false);
    showToast('Emergency contact details saved!');
  };

  // 6. Pharmacy Information (Addresses, Orders, Prescriptions)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() =>
    getUserAddresses(user.id, user.name, user.phone || undefined)
  );

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Home',
    fullName: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    isDefault: false,
  });

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    saveUserAddresses(updated, user.id);
    showToast('Default delivery address updated!');
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      showToast('⚠️ You must have at least one delivery address.');
      return;
    }
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    saveUserAddresses(updated, user.id);
    showToast('Address removed.');
  };

  const handleAddAddress = (e: FormEvent) => {
    e.preventDefault();
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      label: newAddressForm.label || 'Other',
      fullName: newAddressForm.fullName || personalInfo.fullName,
      street: newAddressForm.street,
      city: newAddressForm.city,
      state: newAddressForm.state,
      pinCode: newAddressForm.pinCode,
      phone: newAddressForm.phone || personalInfo.phone,
      isDefault: newAddressForm.isDefault || addresses.length === 0,
    };

    let updated: DeliveryAddress[];
    if (newAddr.isDefault) {
      updated = addresses.map(a => ({ ...a, isDefault: false })).concat(newAddr);
    } else {
      updated = [...addresses, newAddr];
    }
    setAddresses(updated);
    saveUserAddresses(updated, user.id);

    setIsAddressModalOpen(false);
    showToast('New delivery address added!');
  };

  const sampleFallbackOrders: OrderItem[] = [
    {
      id: 'ord-88912',
      status: 'Out for Delivery',
      totalAmount: 48.50,
      createdAt: new Date().toISOString(),
      paymentStatus: 'PAID'
    },
    {
      id: 'ord-77401',
      status: 'Delivered',
      totalAmount: 92.00,
      createdAt: '2026-03-24T10:15:00Z',
      paymentStatus: 'PAID'
    },
    {
      id: 'ord-66219',
      status: 'Delivered',
      totalAmount: 34.20,
      createdAt: '2026-02-18T14:40:00Z',
      paymentStatus: 'PAID'
    }
  ];

  const sampleFallbackPrescriptions: PrescriptionItem[] = [
    {
      id: 'rx-5501',
      fileUrl: '/sample-rx.pdf',
      status: 'VERIFIED',
      notes: 'Prescription verified by Dr. Aris Thorne for Metformin refill',
      createdAt: '2026-03-20T09:30:00Z'
    },
    {
      id: 'rx-4412',
      fileUrl: '/sample-rx-2.pdf',
      status: 'VERIFIED',
      notes: 'Cardiology prescription verified for Atorvastatin 20mg',
      createdAt: '2026-02-15T11:00:00Z'
    }
  ];

  const ordersList = initialOrders.length > 0 ? initialOrders : sampleFallbackOrders;
  const prescriptionsList = initialPrescriptions.length > 0 ? initialPrescriptions : sampleFallbackPrescriptions;

  // 7. Privacy & Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [notifRemindersApp, setNotifRemindersApp] = useState(true);
  const [notifRemindersEmail, setNotifRemindersEmail] = useState(true);
  const [notifRemindersSms, setNotifRemindersSms] = useState(true);
  const [notifOrdersEmail, setNotifOrdersEmail] = useState(true);
  const [notifOrdersSms, setNotifOrdersSms] = useState(false);
  const [notifRefillAlerts, setNotifRefillAlerts] = useState(true);

  const [shareWithPharmacist, setShareWithPharmacist] = useState(true);
  const [allowDoctorAccess, setAllowDoctorAccess] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('⚠️ Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      showToast('⚠️ New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ New password and confirm password do not match');
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully!');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  const handleSaveNotifications = (e: FormEvent) => {
    e.preventDefault();
    showToast('Notification preferences updated!');
  };

  const handleSavePrivacySettings = (e: FormEvent) => {
    e.preventDefault();
    showToast('Health data privacy preferences updated!');
  };

  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmationText !== 'DELETE') {
      showToast('⚠️ Please type "DELETE" exactly to confirm.');
      return;
    }
    showToast('Account deletion initiated. Redirecting to logout...');
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign('/api/auth/logout');
  };

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'RX';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '500',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Breadcrumb / Navigation Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            <Link href="/customer/dashboard" style={{ color: 'var(--color-text-muted)' }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>My Profile</span>
          </div>
          <h1 className="page-title">Patient Profile & Health Records</h1>
          <p className="page-subtitle">Manage personal information, health records, current prescriptions, and security settings.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => {
              setIsEditingPersonal(true);
              setActiveTab('personal');
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="btn btn-primary"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. PROFILE HEADER CARD */}
      {/* ========================================================= */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            {/* Avatar with edit button */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                border: '3px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.25rem',
                fontWeight: '700',
                color: 'var(--color-primary)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{getInitials(personalInfo.fullName)}</span>
                )}
              </div>

              {/* Upload badge button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                style={{ display: 'none' }} 
              />
            </div>

            {/* User Title & Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.625rem', fontWeight: '700', margin: 0, color: 'var(--color-text-main)' }}>
                  {personalInfo.fullName}
                </h2>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Patient
                </span>
                <span className="badge badge-neutral">ID: #{user.id.slice(-6).toUpperCase()}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>{personalInfo.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span>{personalInfo.phone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{personalInfo.city}, {personalInfo.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Health Indicators / Mini Stats */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center', minWidth: '70px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Blood</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-danger)' }}>{bloodGroup}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }}></div>
            <div style={{ textAlign: 'center', minWidth: '70px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Medications</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>{medications.length}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }}></div>
            <div style={{ textAlign: 'center', minWidth: '70px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Orders</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-secondary)' }}>{ordersList.length}</div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION NAVIGATION TABS */}
      {/* ========================================================= */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {(
          [
            { key: 'all', label: 'All Sections' },
            { key: 'personal', label: 'Personal Information' },
            { key: 'health', label: 'Health & Allergies' },
            { key: 'meds', label: 'Current Medications' },
            { key: 'emergency', label: 'Emergency Contact' },
            { key: 'pharmacy', label: 'Pharmacy & Orders' },
            { key: 'security', label: 'Privacy & Security' },
          ] as const
        ).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.625rem 1.125rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? '600' : '500',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 2. PERSONAL INFORMATION SECTION */}
      {/* ========================================================= */}
      {(activeTab === 'all' || activeTab === 'personal') && (
        <section id="personal" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Personal Information</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Primary account details used for prescription verification and pharmacy deliveries.
                </p>
              </div>
              {!isEditingPersonal && (
                <button 
                  type="button" 
                  onClick={() => setIsEditingPersonal(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8125rem' }}
                >
                  Edit Information
                </button>
              )}
            </div>

            {isEditingPersonal ? (
              <form onSubmit={handleSavePersonal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={personalForm.fullName}
                      onChange={e => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="dob">Date of Birth *</label>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={personalForm.dob}
                      onChange={e => setPersonalForm({ ...personalForm, dob: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="gender">Gender (Optional)</label>
                    <select
                      id="gender"
                      value={personalForm.gender}
                      onChange={e => setPersonalForm({ ...personalForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={personalForm.phone}
                      onChange={e => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={personalForm.email}
                      onChange={e => setPersonalForm({ ...personalForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    rows={2}
                    required
                    value={personalForm.address}
                    onChange={e => setPersonalForm({ ...personalForm, address: e.target.value })}
                  />
                </div>

                <div className="grid-cols-3">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={personalForm.city}
                      onChange={e => setPersonalForm({ ...personalForm, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      type="text"
                      required
                      value={personalForm.state}
                      onChange={e => setPersonalForm({ ...personalForm, state: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="pinCode">PIN / Zip Code *</label>
                    <input
                      id="pinCode"
                      type="text"
                      required
                      value={personalForm.pinCode}
                      onChange={e => setPersonalForm({ ...personalForm, pinCode: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <button type="button" onClick={handleCancelPersonal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Full Name</span>
                  <p style={{ fontWeight: '600', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>{personalInfo.fullName}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Date of Birth</span>
                  <p style={{ fontWeight: '500', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                    {new Date(personalInfo.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Gender</span>
                  <p style={{ fontWeight: '500', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>{personalInfo.gender}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Phone Number</span>
                  <p style={{ fontWeight: '500', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>{personalInfo.phone}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Email Address</span>
                  <p style={{ fontWeight: '500', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>{personalInfo.email}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Residential Address</span>
                  <p style={{ fontWeight: '500', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                    {personalInfo.address}, {personalInfo.city}, {personalInfo.state} - {personalInfo.pinCode}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. HEALTH INFORMATION SECTION */}
      {/* ========================================================= */}
      {(activeTab === 'all' || activeTab === 'health') && (
        <section id="health" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="card-title">Health Information</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Optional and strictly private. Helps pharmacists alert you to dangerous drug interactions and allergies.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '600' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Strictly Confidential
              </div>
            </div>

            <form onSubmit={handleSaveHealthInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Blood Group */}
              <div style={{ maxWidth: '300px' }}>
                <label htmlFor="bloodGroup" style={{ fontWeight: '600' }}>Blood Group</label>
                <select
                  id="bloodGroup"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              {/* Medicine Allergies */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', margin: 0 }}>Medicine Allergies</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={noKnownAllergies} 
                      onChange={e => {
                        setNoKnownAllergies(e.target.checked);
                        if (e.target.checked) setMedicineAllergies([]);
                      }} 
                    />
                    <span>No known medicine allergies (NKDA)</span>
                  </label>
                </div>

                {!noKnownAllergies ? (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {medicineAllergies.length === 0 ? (
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No medicine allergies recorded.</span>
                      ) : (
                        medicineAllergies.map(allergy => (
                          <span key={allergy} className="badge badge-danger" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {allergy}
                            <button
                              type="button"
                              onClick={() => removeMedicineAllergy(allergy)}
                              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                      <input
                        type="text"
                        placeholder="Add medicine allergy (e.g., Codeine)"
                        value={newMedAllergy}
                        onChange={e => setNewMedAllergy(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMedicineAllergy(); } }}
                      />
                      <button type="button" onClick={addMedicineAllergy} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                        + Add
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: '500' }}>
                    ✓ Confirmed: Patient reports no known drug allergies.
                  </p>
                )}
              </div>

              {/* Food Allergies */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Food Allergies</label>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {foodAllergies.length === 0 ? (
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No food allergies recorded.</span>
                  ) : (
                    foodAllergies.map(allergy => (
                      <span key={allergy} className="badge badge-warning" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeFoodAllergy(allergy)}
                          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Add food allergy (e.g., Shellfish)"
                    value={newFoodAllergy}
                    onChange={e => setNewFoodAllergy(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFoodAllergy(); } }}
                  />
                  <button type="button" onClick={addFoodAllergy} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                    + Add
                  </button>
                </div>
              </div>

              {/* Existing Medical Conditions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', margin: 0 }}>Existing Medical Conditions</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={noKnownConditions} 
                      onChange={e => {
                        setNoKnownConditions(e.target.checked);
                        if (e.target.checked) setConditions([]);
                      }} 
                    />
                    <span>No known medical conditions</span>
                  </label>
                </div>

                {!noKnownConditions && (
                  <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {availableConditions.map(cond => {
                      const isSelected = conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                            color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <span>✓</span>}
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Other Serious Illnesses & Surgeries */}
              <div className="grid-cols-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="otherIllnesses">Other Serious Illnesses (Optional)</label>
                  <textarea
                    id="otherIllnesses"
                    rows={2}
                    placeholder="e.g. Chronic migraine, mild arthritis..."
                    value={otherIllnesses}
                    onChange={e => setOtherIllnesses(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="pastSurgeries">Previous Major Surgeries (Optional)</label>
                  <textarea
                    id="pastSurgeries"
                    rows={2}
                    placeholder="e.g. Knee Arthroscopy (2020), Appendectomy..."
                    value={pastSurgeries}
                    onChange={e => setPastSurgeries(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary">
                  Save Health Information
                </button>
              </div>

            </form>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 4. CURRENT MEDICATIONS SECTION */}
      {/* ========================================================= */}
      {(activeTab === 'all' || activeTab === 'meds') && (
        <section id="medications" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            
            {/* Header */}
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="card-title">Current Medications</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Active drug prescriptions and dosages seamlessly linked with your medicine reminders.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Link href="/customer/reminders" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                  Reminders Dashboard &rarr;
                </Link>
                <button type="button" onClick={openAddMedModal} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                  + Add Medication
                </button>
              </div>
            </div>

            {/* Visual Link / Sync Callout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backgroundColor: 'var(--color-primary-light)',
              border: '1px solid rgba(15, 118, 110, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1.25rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                    Connected to HealthCare Rx Reminder System
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Your medications here automatically generate scheduled dosage reminders and notifications.
                  </div>
                </div>
              </div>
              <Link href="/customer/reminders/add" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'white' }}>
                + Schedule in Reminders
              </Link>
            </div>

            {/* Medication Cards List */}
            {medications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <p>No active medications listed in your profile.</p>
                <button type="button" onClick={openAddMedModal} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Add Your First Medication
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {medications.map(med => (
                  <div 
                    key={med.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      backgroundColor: 'var(--color-surface)',
                      flexWrap: 'wrap',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 320px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700'
                      }}>
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.0625rem', color: 'var(--color-text-main)' }}>
                            {med.medicineName}
                          </h4>
                          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                            {med.frequency.toLowerCase()}
                          </span>
                          <span className="badge badge-neutral">
                            {med.mealTiming.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Dosage:</span> {med.dosage}
                          <span style={{ margin: '0 0.5rem' }}>•</span>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Time:</span> {med.time}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                          Active: {med.startDate} {med.endDate ? `to ${med.endDate}` : '(Ongoing)'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => openEditMedModal(med)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteMedication(med.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. EMERGENCY CONTACT SECTION */}
      {/* ========================================================= */}
      {(activeTab === 'all' || activeTab === 'emergency') && (
        <section id="emergency" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Emergency Contact</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Designated emergency contact for urgent clinical questions or critical delivery issues.
                </p>
              </div>
              {!isEditingEmergency && (
                <button 
                  type="button" 
                  onClick={() => setIsEditingEmergency(true)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8125rem' }}
                >
                  Edit Contact
                </button>
              )}
            </div>

            {isEditingEmergency ? (
              <form onSubmit={handleSaveEmergency} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="emName">Contact Name *</label>
                    <input
                      id="emName"
                      type="text"
                      required
                      value={emergencyForm.name}
                      onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="emRelationship">Relationship *</label>
                    <select
                      id="emRelationship"
                      value={emergencyForm.relationship}
                      onChange={e => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="emPhone">Phone Number *</label>
                    <input
                      id="emPhone"
                      type="tel"
                      required
                      value={emergencyForm.phone}
                      onChange={e => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="emSecPhone">Secondary Contact Number (Optional)</label>
                    <input
                      id="emSecPhone"
                      type="tel"
                      placeholder="e.g. Work or Alternate Mobile"
                      value={emergencyForm.secondaryPhone}
                      onChange={e => setEmergencyForm({ ...emergencyForm, secondaryPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <button type="button" onClick={() => setIsEditingEmergency(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Contact
                  </button>
                </div>
              </form>
            ) : (
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-danger-bg)',
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                  }}>
                    +
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-text-main)' }}>{emergencyContact.name}</h4>
                      <span className="badge badge-neutral">{emergencyContact.relationship}</span>
                      <span className="badge badge-danger">Primary Emergency</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                      Primary: <strong style={{ color: 'var(--color-text-main)' }}>{emergencyContact.phone}</strong>
                      {emergencyContact.secondaryPhone && (
                        <span> • Secondary: {emergencyContact.secondaryPhone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={`tel:${emergencyContact.phone}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                    Call Contact
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 6. PHARMACY INFORMATION SECTION */}
      {/* ========================================================= */}
      {(activeTab === 'all' || activeTab === 'pharmacy') && (
        <section id="pharmacy" style={{ marginBottom: '2.5rem' }}>
          
          {/* Order Tracking Shortcut Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #0F766E 0%, #0369A1 100%)',
            color: 'white',
            padding: '1.75rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  Live Tracking
                </span>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Track Active Pharmacy Orders</h3>
              </div>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>
                Follow real-time prescription verification, dispensing, and courier dispatch stages.
              </p>
            </div>
            <Link href="/customer/orders" className="btn" style={{ backgroundColor: 'white', color: 'var(--color-primary)', fontWeight: '600' }}>
              View Orders &amp; Tracking &rarr;
            </Link>
          </div>

          {/* Saved Delivery Addresses */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Saved Delivery Addresses</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Manage addresses used during checkout for medication delivery.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setNewAddressForm({
                    label: 'Home',
                    fullName: personalInfo.fullName,
                    street: '',
                    city: personalInfo.city,
                    state: personalInfo.state,
                    pinCode: personalInfo.pinCode,
                    phone: personalInfo.phone,
                    isDefault: false
                  });
                  setIsAddressModalOpen(true);
                }} 
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}
              >
                + Add New Address
              </button>
            </div>

            <div className="grid-cols-2">
              {addresses.map(addr => (
                <div 
                  key={addr.id}
                  style={{
                    border: `1.5px solid ${addr.isDefault ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    backgroundColor: addr.isDefault ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{addr.label}</span>
                        {addr.isDefault && (
                          <span className="badge badge-success">Default</span>
                        )}
                      </div>
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', marginBottom: '0.25rem', fontWeight: '500' }}>
                      {addr.fullName}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                      {addr.street}<br />
                      {addr.city}, {addr.state} {addr.pinCode}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                      Phone: {addr.phone}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders & Prescription History Side-by-Side */}
          <div className="grid-cols-2">
            
            {/* Recent Orders Card */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Recent Orders</h3>
                <Link href="/customer/orders" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                  All Orders
                </Link>
              </div>

              {ordersList.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No recent orders placed.</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersList.slice(0, 3).map(order => (
                        <tr key={order.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>#{order.id.slice(-6).toUpperCase()}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                            ${order.totalAmount.toFixed(2)}
                          </td>
                          <td>
                            <span className={`badge ${
                              order.status === 'Delivered' ? 'badge-success' :
                              order.status === 'Out for Delivery' ? 'badge-info' : 'badge-warning'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link href={`/customer/orders/${order.id}`} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                              Track
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Prescription History Card */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Prescription History</h3>
                <Link href="/customer/prescriptions" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                  Manage Rx
                </Link>
              </div>

              {prescriptionsList.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No prescriptions uploaded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {prescriptionsList.slice(0, 3).map(rx => (
                    <div 
                      key={rx.id} 
                      style={{
                        padding: '0.875rem',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                          Prescription #{rx.id.slice(-6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Uploaded: {new Date(rx.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${
                          rx.status === 'VERIFIED' ? 'badge-success' :
                          rx.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {rx.status}
                        </span>
                        <Link href="/customer/prescriptions" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </section>
      )}

      {/* ========================================================= */}
      {/* 7. PRIVACY AND SECURITY SECTION */}
      {/* ========================================================= */}
      {(activeTab === 'all' || activeTab === 'security') && (
        <section id="security" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Privacy and Security</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Manage account credentials, alert preferences, health record access, and patient data lifecycle.
              </p>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
              
              {/* Change Password */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Change Password</h4>
                
                {passwordSuccess && (
                  <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    ✓ Password updated successfully!
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="currPass" style={{ fontSize: '0.8125rem' }}>Current Password *</label>
                    <input
                      id="currPass"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="newPass" style={{ fontSize: '0.8125rem' }}>New Password *</label>
                    <input
                      id="newPass"
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="confPass" style={{ fontSize: '0.8125rem' }}>Confirm New Password *</label>
                    <input
                      id="confPass"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                    Update Password
                  </button>
                </form>
              </div>

              {/* Notification Preferences */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Notification Preferences</h4>
                
                <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-main)', display: 'block', marginBottom: '0.4rem' }}>
                      Medication Reminder Alarms
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={notifRemindersApp} onChange={e => setNotifRemindersApp(e.target.checked)} />
                        App Notification
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={notifRemindersEmail} onChange={e => setNotifRemindersEmail(e.target.checked)} />
                        Email
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={notifRemindersSms} onChange={e => setNotifRemindersSms(e.target.checked)} />
                        SMS
                      </label>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-main)', display: 'block', marginBottom: '0.4rem' }}>
                      Order &amp; Delivery Tracking
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={notifOrdersEmail} onChange={e => setNotifOrdersEmail(e.target.checked)} />
                        Email Notifications
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={notifOrdersSms} onChange={e => setNotifOrdersSms(e.target.checked)} />
                        SMS Updates
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="checkbox" checked={notifRefillAlerts} onChange={e => setNotifRefillAlerts(e.target.checked)} />
                      Refill &amp; Prescription Expiry Warnings
                    </label>
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                    Save Preferences
                  </button>
                </form>
              </div>

            </div>

            {/* Health Information Privacy Settings */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Health Information Privacy Settings</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Control who has visibility into your recorded allergies and medical history during pharmacy processing.
              </p>

              <form onSubmit={handleSavePrivacySettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={shareWithPharmacist} 
                    onChange={e => setShareWithPharmacist(e.target.checked)} 
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      Share health &amp; allergy profile with dispensing pharmacist
                    </span>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Recommended. Enables automatic checks for drug-drug interactions, contraindications, and allergen warnings before dispatch.
                    </p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={allowDoctorAccess} 
                    onChange={e => setAllowDoctorAccess(e.target.checked)} 
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      Allow partner clinics &amp; prescribing doctors to view medication history
                    </span>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Facilitates seamless prescription renewals and synchronized treatment plans.
                    </p>
                  </div>
                </label>

                <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  Save Privacy Controls
                </button>
              </form>
            </div>

            {/* Danger Zone: Delete Account */}
            <div style={{
              border: '1px solid var(--color-danger-bg)',
              backgroundColor: 'var(--color-danger-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--color-danger)', fontSize: '1.0625rem' }}>Delete Patient Account</h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-main)' }}>
                  Permanently erase your patient profile, medication reminders, order receipts, and uploaded prescriptions.
                </p>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  setDeleteConfirmationText('');
                  setIsDeleteModalOpen(true);
                }} 
                className="btn btn-danger"
              >
                Delete Account
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MEDICATION */}
      {/* ========================================================= */}
      {isMedModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                {editingMedId ? 'Edit Medication' : 'Add Current Medication'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsMedModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMedication} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="medName">Medicine Name *</label>
                <input
                  id="medName"
                  type="text"
                  required
                  placeholder="e.g. Metformin 500mg, Lisinopril..."
                  value={medForm.medicineName}
                  onChange={e => setMedForm({ ...medForm, medicineName: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="medDosage">Dosage *</label>
                  <input
                    id="medDosage"
                    type="text"
                    required
                    placeholder="e.g. 1 Tablet, 5ml"
                    value={medForm.dosage}
                    onChange={e => setMedForm({ ...medForm, dosage: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="medFreq">Frequency</label>
                  <select
                    id="medFreq"
                    value={medForm.frequency}
                    onChange={e => setMedForm({ ...medForm, frequency: e.target.value })}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="TWICE_DAILY">Twice a Day</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="AS_NEEDED">As Needed</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="medTime">Reminder Time</label>
                  <input
                    id="medTime"
                    type="time"
                    value={medForm.time}
                    onChange={e => setMedForm({ ...medForm, time: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="medMeal">Meal Timing</label>
                  <select
                    id="medMeal"
                    value={medForm.mealTiming}
                    onChange={e => setMedForm({ ...medForm, mealTiming: e.target.value })}
                  >
                    <option value="BEFORE_MEAL">Before Meal</option>
                    <option value="AFTER_MEAL">After Meal</option>
                    <option value="WITH_MEAL">With Meal</option>
                    <option value="ANYTIME">Anytime</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="medStart">Start Date *</label>
                  <input
                    id="medStart"
                    type="date"
                    required
                    value={medForm.startDate}
                    onChange={e => setMedForm({ ...medForm, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="medEnd">End Date (Optional)</label>
                  <input
                    id="medEnd"
                    type="date"
                    value={medForm.endDate}
                    onChange={e => setMedForm({ ...medForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsMedModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMedId ? 'Update Medication' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD DELIVERY ADDRESS */}
      {/* ========================================================= */}
      {isAddressModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Add Delivery Address</h3>
              <button 
                type="button" 
                onClick={() => setIsAddressModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-cols-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addrLabel">Address Label</label>
                  <select
                    id="addrLabel"
                    value={newAddressForm.label}
                    onChange={e => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Parents House">Parents House</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addrFull">Contact Name</label>
                  <input
                    id="addrFull"
                    type="text"
                    required
                    value={newAddressForm.fullName}
                    onChange={e => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="addrStreet">Street Address *</label>
                <textarea
                  id="addrStreet"
                  rows={2}
                  required
                  placeholder="Street, building, apartment / flat number"
                  value={newAddressForm.street}
                  onChange={e => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                />
              </div>

              <div className="grid-cols-3">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addrCity">City *</label>
                  <input
                    id="addrCity"
                    type="text"
                    required
                    value={newAddressForm.city}
                    onChange={e => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addrState">State *</label>
                  <input
                    id="addrState"
                    type="text"
                    required
                    value={newAddressForm.state}
                    onChange={e => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addrPin">PIN Code *</label>
                  <input
                    id="addrPin"
                    type="text"
                    required
                    value={newAddressForm.pinCode}
                    onChange={e => setNewAddressForm({ ...newAddressForm, pinCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="addrPhone">Phone Number for Delivery *</label>
                <input
                  id="addrPhone"
                  type="tel"
                  required
                  value={newAddressForm.phone}
                  onChange={e => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newAddressForm.isDefault}
                  onChange={e => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                />
                <span>Set as default delivery address</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2rem', border: '1px solid var(--color-danger)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-danger)', fontSize: '1.25rem' }}>
              Confirm Account Deletion
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              This action cannot be undone. All your personal data, saved prescriptions, active medicine reminders, and order records will be permanently erased.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmInput" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>
                Please type <strong style={{ color: 'var(--color-danger)' }}>DELETE</strong> to confirm:
              </label>
              <input
                id="confirmInput"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                style={{ borderColor: 'var(--color-danger)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={deleteConfirmationText !== 'DELETE'} 
                onClick={handleConfirmDeleteAccount}
                className="btn btn-danger"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Medication Confirm Modal */}
      <ConfirmModal
        isOpen={!!medicationToDelete}
        onClose={() => setMedicationToDelete(null)}
        onConfirm={() => {
          if (medicationToDelete) {
            setMedications(prev => prev.filter(m => m.id !== medicationToDelete.id));
            showToast(`"${medicationToDelete.name}" removed from profile.`);
            setMedicationToDelete(null);
          }
        }}
        title="Remove Medication"
        message={`Are you sure you want to remove "${medicationToDelete?.name}" from your profile?`}
        confirmText="Remove"
        cancelText="Keep"
        variant="danger"
      />

    </div>
  );
}
