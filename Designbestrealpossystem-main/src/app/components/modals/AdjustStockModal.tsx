import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

const REASONS = ['Restock', 'Sale', 'Manual Adjustment', 'Damage/Loss', 'Customer Return'];

export function AdjustStockModal() {
  const { adjustModal, closeAdjustModal, adjustStock } = usePOS();
  const { open, item } = adjustModal;
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('Restock');

  useEffect(() => { if (open) { setQty(1); setReason('Restock'); } }, [open]);
  if (!open || !item) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 16,
    }} onClick={closeAdjustModal}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 380,
        padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Adjust Stock</div>
          <button onClick={closeAdjustModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <X size={15} />
          </button>
        </div>

        {/* Item info */}
        <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
            Current stock: <strong style={{ color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace" }}>{item.qty} units</strong>
          </div>
        </div>

        {/* Qty control */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 8 }}>Quantity to Adjust</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
            ><Minus size={16} /></button>
            <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} min="1"
              style={{ flex: 1, padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 18, fontWeight: 800, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: '#1e293b', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
            <button onClick={() => setQty(q => q + 1)}
              style={{ width: 38, height: 38, borderRadius: 9, border: 'none', background: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            ><Plus size={16} /></button>
          </div>
        </div>

        {/* Reason */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 6 }}>Reason</div>
          <select value={reason} onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', color: '#1e293b', outline: 'none', background: 'white' }}
            onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            {REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Preview */}
        <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 9, marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <div>
            <div style={{ color: '#64748b' }}>After add: <strong style={{ color: '#16a34a' }}>{item.qty + qty}</strong></div>
            <div style={{ color: '#64748b', marginTop: 2 }}>After subtract: <strong style={{ color: '#dc2626' }}>{Math.max(0, item.qty - qty)}</strong></div>
          </div>
          <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: 12 }}>
            <div>{reason}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <button onClick={closeAdjustModal}
            style={{ padding: '11px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Cancel</button>
          <button onClick={() => { adjustStock(item.id, -qty, reason); closeAdjustModal(); }}
            style={{ padding: '11px', background: '#fee2e2', border: 'none', borderRadius: 9, color: '#dc2626', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
          ><Minus size={13} /> Sub</button>
          <button onClick={() => { adjustStock(item.id, +qty, reason); closeAdjustModal(); }}
            style={{ padding: '11px', background: '#7c3aed', border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: '0 2px 10px rgba(124,58,237,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          ><Plus size={13} /> Add</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
