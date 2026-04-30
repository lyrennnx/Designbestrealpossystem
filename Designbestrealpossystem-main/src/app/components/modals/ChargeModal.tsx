import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Banknote, Check } from 'lucide-react';
import { usePOS, php } from '../../context/POSContext';

export function ChargeModal() {
  const { chargeModalOpen, closeChargeModal, cartTotal, checkout } = usePOS();
  const [payment, setPayment] = useState<'Cash' | 'Card' | 'GCash'>('Cash');
  const [cash, setCash] = useState('');

  const total = cartTotal();
  const received = parseFloat(cash) || 0;
  const change = received - total;

  useEffect(() => {
    if (chargeModalOpen) {
      setPayment('Cash');
      setCash(total.toFixed(2));
    }
  }, [chargeModalOpen, total]);

  if (!chargeModalOpen) return null;

  const canConfirm = payment !== 'Cash' || received >= total;

  const PAY_METHODS = [
    { id: 'Cash' as const, icon: <Banknote size={18} />, label: 'Cash' },
    { id: 'Card' as const, icon: <CreditCard size={18} />, label: 'Card' },
    { id: 'GCash' as const, icon: <Smartphone size={18} />, label: 'GCash' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }} onClick={closeChargeModal}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 480,
        padding: '0 0 24px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '4px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Charge Customer</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Select payment method</div>
          </div>
          <button onClick={closeChargeModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 20px 0' }}>
          {/* Amount */}
          <div style={{ textAlign: 'center', marginBottom: 20, padding: '16px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Amount Due</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'white', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{php(total)}</div>
          </div>

          {/* Payment methods */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 8 }}>Payment Method</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {PAY_METHODS.map(m => (
                <button key={m.id} onClick={() => setPayment(m.id)}
                  style={{
                    padding: '12px 8px', borderRadius: 10,
                    border: `2px solid ${payment === m.id ? '#7c3aed' : '#e2e8f0'}`,
                    background: payment === m.id ? '#f5f3ff' : 'white',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ color: payment === m.id ? '#7c3aed' : '#94a3b8' }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: payment === m.id ? '#7c3aed' : '#64748b' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash input */}
          {payment === 'Cash' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 8 }}>Cash Received</div>
              <input
                type="number"
                value={cash}
                onChange={e => setCash(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, fontSize: 20, fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace", color: '#1e293b',
                  outline: 'none', boxSizing: 'border-box', textAlign: 'right',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
              {cash && received > 0 && (
                <div style={{
                  marginTop: 8, padding: '10px 14px', borderRadius: 9,
                  background: change >= 0 ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${change >= 0 ? '#bbf7d0' : '#fecaca'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: change >= 0 ? '#16a34a' : '#dc2626' }}>
                    {change >= 0 ? 'Change' : 'Insufficient'}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: change >= 0 ? '#16a34a' : '#dc2626' }}>
                    {change >= 0 ? php(change) : `Short ${php(Math.abs(change))}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={closeChargeModal}
              style={{ padding: '13px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
            >Cancel</button>
            <button onClick={() => canConfirm && checkout(payment)} disabled={!canConfirm}
              style={{
                padding: '13px', border: 'none', borderRadius: 10,
                background: canConfirm ? 'linear-gradient(135deg, #059669, #047857)' : '#e2e8f0',
                color: canConfirm ? 'white' : '#94a3b8',
                fontSize: 14, fontWeight: 800, cursor: canConfirm ? 'pointer' : 'default',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: canConfirm ? '0 4px 14px rgba(5,150,105,0.35)' : 'none',
                transition: 'all 0.15s',
              }}
            ><Check size={16} /> Confirm Payment</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}
