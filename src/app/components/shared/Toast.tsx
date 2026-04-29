import React from 'react';
import { CheckCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function Toast() {
  const { toastMsg } = usePOS();
  if (!toastMsg) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, minWidth: 280, maxWidth: 440,
      background: '#1e293b', color: 'white',
      borderRadius: 12, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      animation: 'toastIn 0.25s ease',
      fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{toastMsg}</span>
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}