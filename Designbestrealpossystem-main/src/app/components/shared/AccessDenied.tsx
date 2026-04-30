import React from 'react';
import { Lock } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function AccessDenied() {
  const { accessDenied, dismissAccessDenied } = usePOS();
  if (!accessDenied) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 16,
    }} onClick={dismissAccessDenied}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 360,
        padding: '28px 24px', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          border: '2px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Lock size={28} style={{ color: '#dc2626' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Access Denied</div>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
          This feature is only available to <strong>Owner</strong> accounts. Please contact your manager.
        </div>
        <button onClick={dismissAccessDenied}
          style={{
            padding: '12px 28px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none',
            borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >Got it</button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
