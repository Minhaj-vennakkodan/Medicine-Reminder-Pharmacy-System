import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/customerAuth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrderTrackingPage({ params }: { params: { id: string } }) {
  const user = await requireCustomer();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { medicine: true }
      },
      prescription: true
    }
  });

  if (!order || order.userId !== user.userId) {
    return <div style={{ padding: '2rem' }}>Order not found.</div>;
  }

  const timelineSteps = [
    'Order Placed',
    'Prescription Verified',
    'Pharmacy Processing',
    'Packed',
    'Out for Delivery',
    'Delivered'
  ];

  let currentStepIndex = timelineSteps.indexOf(order.status);
  
  // Handle special statuses
  if (order.status === 'Cancelled') currentStepIndex = -1;
  // If no Rx required, skip 'Prescription Verified' visually or just treat processing as step 2
  if (currentStepIndex === -1 && order.status !== 'Cancelled') currentStepIndex = 0; 

  return (
    <div>
      <Link href="/customer/orders" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
        ← Back to Orders
      </Link>
      
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Track Order #{order.id.slice(-6).toUpperCase()}</h1>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Tracking Timeline */}
        <div className="glass-panel" style={{ flex: '2 1 400px', padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem' }}>Order Status</h3>
          
          {order.status === 'Cancelled' ? (
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
              This order has been cancelled.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {timelineSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                // Skip rx step if order doesn't have an rx
                if (step === 'Prescription Verified' && !order.prescriptionId) return null;

                return (
                  <div key={step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: isCompleted ? 1 : 0.4 }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      backgroundColor: isCurrent ? 'var(--color-primary)' : isCompleted ? 'var(--color-success)' : '#ccc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem',
                      fontWeight: 'bold', flexShrink: 0, marginTop: '2px'
                    }}>
                      {isCompleted ? '✓' : ''}
                    </div>
                    <div>
                      <div style={{ fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--color-primary)' : 'inherit' }}>
                        {step}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {order.prescription && order.prescription.status === 'REJECTED' && (
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--color-danger)', borderRadius: '4px', backgroundColor: 'rgba(255,0,0,0.05)' }}>
              <h4 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Prescription Rejected</h4>
              <p style={{ fontSize: '0.875rem' }}>Your uploaded prescription was rejected by the pharmacy admin. Reason: {order.prescription.notes}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Payment:</span>
              <span style={{ fontWeight: 'bold' }}>{order.paymentStatus}</span>
            </div>
            {order.prescriptionId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Prescription:</span>
                <span style={{ color: order.prescription?.status === 'VERIFIED' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {order.prescription?.status}
                </span>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

          <h4 style={{ marginBottom: '1rem' }}>Items</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
            {order.items.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{item.quantity}x {item.medicine.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <span>Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
