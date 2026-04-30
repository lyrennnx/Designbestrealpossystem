import React from 'react';
import { RotateCcw } from 'lucide-react';
import { usePOS, php } from '../../context/POSContext';

export function RefundModal() {
  const { refundModal, closeRefundModal, refundReceipt } = usePOS();
  if (!refundModal.open || !refundModal.receipt) return null;
  const r = refundModal.receipt;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 16,
    }} onClick={closeRefundModal}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 380,
        padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff7ed', border: '2px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <RotateCcw size={24} style={{ color: '#ea580c' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Confirm Refund</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Refund <strong style={{ color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace" }}>{php(r.total)}</strong> for receipt <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.id}</strong>?
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>This will restore inventory stock and create a refund record.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={closeRefundModal}
            style={{ padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
          >Cancel</button>
          <button onClick={() => refundReceipt(r.id)}
            style={{
              padding: '12px', background: 'linear-gradient(135deg, #ea580c, #dc2626)', border: 'none',
              borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
            }}
          ><RotateCcw size={15} /> Refund</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
