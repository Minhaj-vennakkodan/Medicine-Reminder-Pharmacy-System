"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { placeOrder } from './actions';

export default function CheckoutClient({ cartItems, verifiedPrescriptions }: { cartItems: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[], verifiedPrescriptions: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const subtotal = cartItems.reduce((acc, item) => acc + (item.medicine.price * item.quantity), 0);
  const deliveryCharge = cartItems.length > 0 ? (subtotal > 50 ? 0 : 5.00) : 0;
  const total = subtotal + deliveryCharge;

  const requiresRx = cartItems.some(item => item.medicine.requiresPrescription);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const result = await placeOrder(formData);
      if (result.success) {
        router.push(`/customer/orders/success?orderId=${result.orderId}`);
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      alert(err.message);
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Checkout unavailable</h2>
        <p>Your cart is empty.</p>
        <button onClick={() => router.push('/customer/medicines')} className="btn btn-primary">Return to Shop</button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Checkout</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Form */}
        <div style={{ flex: '1 1 500px', display: 'grid', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Delivery Address</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <input required type="text" placeholder="Full Name" style={{ padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
              <textarea required placeholder="Full Address" style={{ padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} rows={3} />
              <input required type="tel" placeholder="Phone Number" style={{ padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Payment Method</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="paymentMethod" value="COD" required defaultChecked />
                Cash on Delivery (COD)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="paymentMethod" value="ONLINE" required />
                Pay Online (Credit/Debit Card)
              </label>
            </div>
          </div>

          {requiresRx && (
            <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--color-warning)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>Prescription Verification</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>You have selected medicines that require a verified prescription. Please select one from your uploaded documents.</p>
              
              {verifiedPrescriptions.length === 0 ? (
                <div style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
                  You do not have any verified prescriptions. Please upload one and wait for verification before checking out.
                </div>
              ) : (
                <select name="prescriptionId" required style={{ padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">-- Select Verified Prescription --</option>
                  {verifiedPrescriptions.map((rx: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <option key={rx.id} value={rx.id}>Prescription uploaded on {new Date(rx.createdAt).toLocaleDateString()}</option>
                  ))}
                </select>
              )}
            </div>
          )}

        </div>

        {/* Right Summary */}
        <div className="card" style={{ flex: '0 0 300px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Order Summary</h3>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
            {cartItems.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>{item.quantity}x {item.medicine.name}</span>
                <span>${(item.medicine.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span>Delivery:</span>
            <span>{deliveryCharge === 0 ? 'Free' : `$${deliveryCharge.toFixed(2)}`}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button type="submit" disabled={loading || (requiresRx && verifiedPrescriptions.length === 0)} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>

      </form>
    </div>
  );
}
