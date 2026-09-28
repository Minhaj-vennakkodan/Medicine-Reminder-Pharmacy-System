"use client";

import { useState } from 'react';
import { addToCart } from '../../cart/actions';
import { useRouter } from 'next/navigation';

export default function MedicineDetailsClient({ medicine }: { medicine: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (buyNow: boolean) => {
    setLoading(true);
    try {
      await addToCart(medicine.id, quantity);
      if (buyNow) {
        router.push('/customer/checkout');
      } else {
        alert('Added to cart!');
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
      
      <div style={{ flex: '1 1 300px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '5rem' }}>💊</span>
      </div>

      <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
        {medicine.requiresPrescription && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--color-warning)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            ⚠️ Prescription Required
          </div>
        )}
        <h1 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{medicine.name}</h1>
        <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          {medicine.genericName && <span>Generic: {medicine.genericName}</span>}
          {medicine.category && <span> • Category: {medicine.category}</span>}
        </div>
        
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '1.5rem' }}>
          ${medicine.price.toFixed(2)}
        </div>

        <p style={{ lineHeight: 1.6, marginBottom: '2rem' }}>{medicine.description}</p>

        <div style={{ marginBottom: '2rem' }}>
          <strong>Stock Status:</strong> 
          <span style={{ color: medicine.stock > 0 ? 'var(--color-success)' : 'var(--color-danger)', marginLeft: '0.5rem', fontWeight: 'bold' }}>
            {medicine.stock > 0 ? `${medicine.stock} Available` : 'Out of Stock'}
          </span>
        </div>

        {medicine.stock > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 'var(--border-radius-sm)' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
              <span style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
            </div>
            <button onClick={() => handleAdd(false)} disabled={loading} className="btn btn-secondary">Add to Cart</button>
            <button onClick={() => handleAdd(true)} disabled={loading} className="btn btn-primary">Buy Now</button>
          </div>
        )}
      </div>

    </div>
  );
}
