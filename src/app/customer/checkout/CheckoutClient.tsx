"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { placeOrder } from './actions';
import { showAppToast } from '@/components/Toast';
import {
  getUserAddresses,
  addUserAddress,
  type DeliveryAddress,
} from '@/lib/addresses';

type CartItem = {
  id: string;
  quantity: number;
  medicine: {
    id: string;
    name: string;
    price: number;
    requiresPrescription: boolean;
  };
};

type VerifiedRx = {
  id: string;
  createdAt: string | Date;
};

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface CheckoutClientProps {
  cartItems: CartItem[];
  verifiedPrescriptions: VerifiedRx[];
  user?: UserInfo;
}

interface OrderSuccessData {
  orderId: string;
  paymentMethod: 'COD' | 'ONLINE';
  total: number;
  address: DeliveryAddress | null;
  onlineRef?: string;
}

export default function CheckoutClient({
  cartItems,
  verifiedPrescriptions,
  user,
}: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Addresses state
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() =>
    getUserAddresses(user?.id, user?.name, user?.phone)
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const list = getUserAddresses(user?.id, user?.name, user?.phone);
    const def = list.find((a) => a.isDefault);
    return def ? def.id : list[0]?.id || '';
  });

  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Home',
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    phone: user?.phone || '',
    isDefault: false,
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('ONLINE');
  const [onlineTab, setOnlineTab] = useState<'CARD' | 'UPI'>('CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Success Popups
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null);

  // Listen to address changes from Profile or other tabs
  useEffect(() => {
    const handleAddressesChanged = (e: Event) => {
      const customEvent = e as CustomEvent<DeliveryAddress[]>;
      if (customEvent.detail) {
        setAddresses(customEvent.detail);
      } else {
        setAddresses(getUserAddresses(user?.id, user?.name, user?.phone));
      }
    };

    window.addEventListener('addresses-changed', handleAddressesChanged);
    return () => window.removeEventListener('addresses-changed', handleAddressesChanged);
  }, [user]);

  // Totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.medicine.price * item.quantity,
    0
  );
  const deliveryCharge = cartItems.length > 0 ? (subtotal > 50 ? 0 : 5.0) : 0;
  const total = subtotal + deliveryCharge;

  const requiresRx = cartItems.some((item) => item.medicine.requiresPrescription);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;

  // Handle Add New Address
  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.pinCode) {
      showAppToast('Please fill in street, city and pin code', 'error');
      return;
    }

    const updated = addUserAddress(
      {
        label: newAddressForm.label || 'Home',
        fullName: newAddressForm.fullName || user?.name || 'Customer',
        street: newAddressForm.street,
        city: newAddressForm.city,
        state: newAddressForm.state,
        pinCode: newAddressForm.pinCode,
        phone: newAddressForm.phone || user?.phone || '',
        isDefault: newAddressForm.isDefault,
      },
      user?.id,
      user?.name,
      user?.phone
    );

    setAddresses(updated);
    const added = updated[updated.length - 1];
    if (added) {
      setSelectedAddressId(added.id);
    }
    setIsAddAddressOpen(false);
    showAppToast('New delivery address added & selected!', 'success');
  };

  // Handle Order Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedAddress) {
      showAppToast('Please add and select a delivery address before proceeding.', 'error');
      return;
    }

    if (requiresRx && verifiedPrescriptions.length === 0) {
      showAppToast('A verified prescription is required for medicines in your cart.', 'error');
      return;
    }

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    formData.set('paymentMethod', paymentMethod);

    // Attach selected address details
    formData.set('fullName', selectedAddress.fullName);
    formData.set(
      'deliveryAddress',
      `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pinCode}`
    );
    formData.set('phone', selectedAddress.phone);

    if (paymentMethod === 'ONLINE') {
      // Show simulated secure gateway progress
      setIsProcessingPayment(true);
      await new Promise((resolve) => setTimeout(resolve, 1400));
    }

    startTransition(async () => {
      try {
        const result = await placeOrder(formData);
        setIsProcessingPayment(false);

        if (result.success) {
          // Open the Success Popup Modal
          setOrderSuccess({
            orderId: result.orderId,
            paymentMethod,
            total,
            address: selectedAddress,
            onlineRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          });
        }
      } catch (err) {
        setIsProcessingPayment(false);
        showAppToast(err instanceof Error ? err.message : String(err), 'error');
      }
    });
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }} className="card">
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Your shopping cart is empty
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Explore our pharmacy catalog to add medicines and healthcare essentials.
        </p>
        <Link href="/customer/medicines" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
          Browse Pharmacy
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>
          Checkout
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Review your selected delivery address, payment method, and complete your medicine order.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Column: Delivery Address & Payment */}
        <div style={{ flex: '1 1 540px', display: 'grid', gap: '1.5rem' }}>
          {/* 1. Delivery Address Selector Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                  Delivery Address
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Choose where you want your medicines delivered
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(!isAddAddressOpen)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    border: '1px solid #CCFBF1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>{isAddAddressOpen ? 'Close Form' : '+ Add Address'}</span>
                </button>

                <Link
                  href="/customer/profile"
                  target="_blank"
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>Profile</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Inline Add Address Form */}
            {isAddAddressOpen && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  animation: 'fadeIn 0.2s ease-out',
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                  Enter New Delivery Address
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Address Label</label>
                    <select
                      value={newAddressForm.label}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                    >
                      <option value="Home">Home 🏠</option>
                      <option value="Office">Office 🏢</option>
                      <option value="Clinic">Clinic 🏥</option>
                      <option value="Other">Other 📍</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Recipient Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newAddressForm.fullName}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>Street & Apartment / House #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 42 Healthway Boulevard, Suite 300"
                    value={newAddressForm.street}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>City</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddressForm.state}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>PIN / ZIP Code</label>
                    <input
                      type="text"
                      required
                      placeholder="PIN Code"
                      value={newAddressForm.pinCode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, pinCode: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newAddressForm.isDefault}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                    />
                    <span>Set as default address in profile</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddNewAddressSubmit}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  >
                    Save & Select Address
                  </button>
                </div>
              </div>
            )}

            {/* Saved Addresses List / Radio Cards */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;

                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? '#F0FDFA' : 'var(--color-surface)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 6px -1px rgba(15, 118, 110, 0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.9rem',
                    }}
                  >
                    {/* Radio visual */}
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid var(--color-primary)' : '2px solid #CBD5E1',
                        backgroundColor: '#fff',
                        marginTop: '0.15rem',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    />

                    {/* Address Information */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                          {addr.fullName}
                        </span>

                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: '#E2E8F0',
                            color: '#334155',
                          }}
                        >
                          {addr.label}
                        </span>

                        {addr.isDefault && (
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: '700',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                            }}
                          >
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.45 }}>
                        {addr.street}, {addr.city}, {addr.state} {addr.pinCode}
                      </div>

                      {addr.phone && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                          📞 Phone: {addr.phone}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Payment Method Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: '700' }}>
              Payment Method
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Choose your preferred payment method
            </p>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Option A: Online Payment */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                style={{
                  border: paymentMethod === 'ONLINE' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: paymentMethod === 'ONLINE' ? '#F0FDFA' : 'var(--color-surface)',
                  borderRadius: '12px',
                  padding: '1.15rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: paymentMethod === 'ONLINE' ? '6px solid var(--color-primary)' : '2px solid #CBD5E1',
                    backgroundColor: '#fff',
                    marginTop: '0.2rem',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text-main)' }}>
                      💳 Pay Online (Instant Card / UPI / NetBanking)
                    </span>
                    <span style={{ fontSize: '0.725rem', fontWeight: '700', color: '#059669', backgroundColor: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      RECOMMENDED
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    Fast, 100% secure automated checkout with instant confirmation receipt.
                  </p>
                </div>
              </div>

              {/* Option B: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                style={{
                  border: paymentMethod === 'COD' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: paymentMethod === 'COD' ? '#F0FDFA' : 'var(--color-surface)',
                  borderRadius: '12px',
                  padding: '1.15rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: paymentMethod === 'COD' ? '6px solid var(--color-primary)' : '2px solid #CBD5E1',
                    backgroundColor: '#fff',
                    marginTop: '0.2rem',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text-main)' }}>
                    💵 Cash on Delivery (COD)
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    Pay in cash directly to the delivery courier when your package arrives.
                  </p>
                </div>
              </div>
            </div>

            {/* Online Payment Interactive Mock Box */}
            {paymentMethod === 'ONLINE' && (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                {/* Tabs: Card vs UPI */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setOnlineTab('CARD')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8125rem',
                      fontWeight: onlineTab === 'CARD' ? '700' : '500',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: onlineTab === 'CARD' ? '#0F766E' : '#E2E8F0',
                      color: onlineTab === 'CARD' ? '#FFFFFF' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlineTab('UPI')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8125rem',
                      fontWeight: onlineTab === 'UPI' ? '700' : '500',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: onlineTab === 'UPI' ? '#0F766E' : '#E2E8F0',
                      color: onlineTab === 'UPI' ? '#FFFFFF' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    UPI (Google Pay / PhonePe / Paytm)
                  </button>
                </div>

                {onlineTab === 'CARD' ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || 'Authorized Cardholder'}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        readOnly
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#fff', letterSpacing: '0.1em' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem' }}>Valid Thru</label>
                        <input
                          type="text"
                          defaultValue="12/28"
                          readOnly
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem' }}>CVV</label>
                        <input
                          type="password"
                          defaultValue="•••"
                          readOnly
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      defaultValue={`${user?.email?.split('@')[0] || 'customer'}@okhdfcbank`}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <span key={app} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#E2E8F0', fontWeight: '600', color: '#475569' }}>
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.85rem', fontSize: '0.75rem', color: '#059669' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>256-Bit SSL Encrypted & Verified Medical Payment Gateway</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Prescription Verification Card (If required) */}
          {requiresRx && (
            <div className="card" style={{ padding: '1.75rem', border: '2px solid var(--color-warning)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-warning)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Prescription Verification Required</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                One or more items in your cart require a doctor&apos;s verified prescription according to medical regulations.
              </p>

              {verifiedPrescriptions.length === 0 ? (
                <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '500' }}>
                  ⚠️ You do not have any verified prescriptions yet. Please upload your prescription in the Prescriptions section first.
                </div>
              ) : (
                <select
                  name="prescriptionId"
                  required
                  style={{ padding: '0.65rem', width: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                >
                  <option value="">-- Select Verified Prescription --</option>
                  {verifiedPrescriptions.map((rx) => (
                    <option key={rx.id} value={rx.id}>
                      Verified Rx (#{rx.id.slice(-6)}) - Uploaded on {new Date(rx.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Place Order Button */}
        <div className="card" style={{ flex: '0 0 320px', padding: '1.75rem', position: 'sticky', top: '5.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', fontSize: '1.15rem' }}>
            Order Summary
          </h3>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'grid', gap: '0.65rem' }}>
            {cartItems.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-main)', fontWeight: '500' }}>
                  {item.quantity}x {item.medicine.name}
                </span>
                <span style={{ fontWeight: '600' }}>${(item.medicine.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>${subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <span>Delivery Fee</span>
            <span style={{ fontWeight: '600', color: deliveryCharge === 0 ? '#059669' : 'var(--color-text-main)' }}>
              {deliveryCharge === 0 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.35rem',
              fontWeight: '800',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1rem',
              marginBottom: '1.5rem',
              color: 'var(--color-primary)',
            }}
          >
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={isPending || isProcessingPayment || (requiresRx && verifiedPrescriptions.length === 0)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1.05rem',
              fontWeight: '700',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(15, 118, 110, 0.3)',
            }}
          >
            {isProcessingPayment
              ? 'Processing Payment...'
              : isPending
              ? 'Placing Order...'
              : paymentMethod === 'ONLINE'
              ? `Pay Online $${total.toFixed(2)}`
              : `Place Order (COD)`}
          </button>

          <p style={{ margin: '1rem 0 0 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            By placing your order, you agree to HealthCare Rx terms of service.
          </p>
        </div>
      </form>

      {/* =========================================================================
          ORDER SUCCESS POPUPS (ONLINE PAYMENT & CASH ON DELIVERY)
      ========================================================================= */}
      {orderSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInOverlay 0.25s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'scaleInModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                backgroundColor: orderSuccess.paymentMethod === 'ONLINE' ? '#0F766E' : '#0369A1',
                padding: '2rem 1.75rem',
                textAlign: 'center',
                color: '#FFFFFF',
              }}
            >
              {/* Badge Icon */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem auto',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: orderSuccess.paymentMethod === 'ONLINE' ? '#0F766E' : '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                }}
              >
                {orderSuccess.paymentMethod === 'ONLINE' ? '✓' : '📦'}
              </div>

              <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.6rem', fontWeight: '800' }}>
                {orderSuccess.paymentMethod === 'ONLINE'
                  ? 'Payment Successful!'
                  : 'Order Confirmed!'}
              </h2>

              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
                {orderSuccess.paymentMethod === 'ONLINE'
                  ? 'Your transaction was completed and your order is placed.'
                  : 'Your Cash on Delivery order is booked and being processed.'}
              </p>
            </div>

            {/* Details Content */}
            <div style={{ padding: '1.75rem' }}>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--color-primary)' }}>#{orderSuccess.orderId.slice(-8).toUpperCase()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment Mode:</span>
                  <span
                    style={{
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: orderSuccess.paymentMethod === 'ONLINE' ? '#DCFCE7' : '#FEF3C7',
                      color: orderSuccess.paymentMethod === 'ONLINE' ? '#15803D' : '#92400E',
                    }}
                  >
                    {orderSuccess.paymentMethod === 'ONLINE' ? 'PAID ONLINE (CARD / UPI)' : 'CASH ON DELIVERY (PENDING)'}
                  </span>
                </div>

                {orderSuccess.onlineRef && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Transaction Reference:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{orderSuccess.onlineRef}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Total Amount:</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>
                    ${orderSuccess.total.toFixed(2)}
                  </strong>
                </div>

                {orderSuccess.address && (
                  <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '0.65rem', marginTop: '0.65rem', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Deliver to:</div>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>
                      {orderSuccess.address.fullName} ({orderSuccess.address.label})
                    </div>
                    <div style={{ color: '#475569' }}>
                      {orderSuccess.address.street}, {orderSuccess.address.city}, {orderSuccess.address.state} {orderSuccess.address.pinCode}
                    </div>
                  </div>
                )}
              </div>

              {orderSuccess.paymentMethod === 'COD' && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FFFBEB', borderRadius: '8px', color: '#B45309', fontSize: '0.825rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>💵</span>
                  <span>Please keep <strong>${orderSuccess.total.toFixed(2)}</strong> in cash ready when our delivery courier arrives at your door.</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => router.push(`/customer/orders/${orderSuccess.orderId}`)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', fontSize: '0.95rem', fontWeight: '700' }}
                >
                  View Order Details & Tracking
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => router.push('/customer/medicines')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: '0.875rem' }}
                  >
                    Continue Shopping
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/customer/dashboard')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: '0.875rem' }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleInModal {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }
        `
      }} />
    </div>
  );
}
