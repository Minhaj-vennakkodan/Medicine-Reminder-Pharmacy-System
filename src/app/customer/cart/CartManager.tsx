"use client";

import { useState } from 'react';
import Link from 'next/link';
import { updateCartQuantity, removeCartItem } from './cartActions';
import { useRouter } from 'next/navigation';

export default function CartManager({ cartItems }: { cartItems: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (id: string, qty: number) => {
    setLoading(true);
    try {
      await updateCartQuantity(id, qty);
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    setLoading(true);
    await removeCartItem(id);
    setLoading(false);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.medicine.price * item.quantity), 0);
  const deliveryCharge = cartItems.length > 0 ? (subtotal > 50 ? 0 : 5.00) : 0;
  const total = subtotal + deliveryCharge;

  const requiresRx = cartItems.some(item => item.medicine.requiresPrescription);

  return (
    <div>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Your cart is empty</h3>
          <Link href="/customer/medicines" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          <div className="card" style={{ flex: '1 1 500px', padding: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '1rem 0' }}>Product</th>
                  <th style={{ padding: '1rem 0' }}>Price</th>
                  <th style={{ padding: '1rem 0' }}>Quantity</th>
                  <th style={{ padding: '1rem 0', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '1.5rem 0' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.medicine.name}</div>
                      {item.medicine.requiresPrescription && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '0.25rem', fontWeight: 'bold' }}>Rx Required</div>
                      )}
                      <button onClick={() => handleRemove(item.id)} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.8rem', cursor: 'pointer', padding: '0', marginTop: '0.5rem' }}>Remove</button>
                    </td>
                    <td style={{ padding: '1.5rem 0' }}>${item.medicine.price.toFixed(2)}</td>
                    <td style={{ padding: '1.5rem 0' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <button onClick={() => handleUpdate(item.id, item.quantity - 1)} disabled={loading} style={{ padding: '0.25rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                        <span style={{ padding: '0.25rem 0.5rem' }}>{item.quantity}</span>
                        <button onClick={() => handleUpdate(item.id, item.quantity + 1)} disabled={loading} style={{ padding: '0.25rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 0', textAlign: 'right', fontWeight: 'bold' }}>
                      ${(item.medicine.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ flex: '0 0 300px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span>Delivery Charge:</span>
              <span>{deliveryCharge === 0 ? <span style={{ color: 'var(--color-success)' }}>Free</span> : `$${deliveryCharge.toFixed(2)}`}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {requiresRx && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 170, 0, 0.1)', border: '1px solid var(--color-warning)', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--color-warning)' }}>Notice:</strong> Your cart contains items that require a verified prescription. You will need to select a verified prescription during checkout.
              </div>
            )}

            <button onClick={() => router.push('/customer/checkout')} disabled={loading} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
              Proceed to Checkout
            </button>
            <Link href="/customer/medicines" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--color-primary)', fontSize: '0.9rem' }}>
              Continue Shopping
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
