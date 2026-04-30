import React, { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { usePOS, invStatus } from '../../context/POSContext';

const CATEGORIES = ['Perfume', 'Cologne', 'Body Spray', 'Essential Oil', 'Other'];
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  'In Stock':     { bg: '#f0fdf4', color: '#16a34a' },
  'Low Stock':    { bg: '#fff7ed', color: '#ea580c' },
  'Need Restock': { bg: '#eff6ff', color: '#2563eb' },
  'Out of Stock': { bg: '#fef2f2', color: '#dc2626' },
};

export function InventoryItemModal() {
  const { invModal, closeInvModal, addInventoryItem, updateInventoryItem, deleteInventoryItem, invNextNum } = usePOS();
  const { open, item } = invModal;
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perfume');
  const [qty, setQty] = useState('0');
  const [min, setMin] = useState('5');

  useEffect(() => {
    if (open) {
      setId(item?.id ?? `PRD-${String(invNextNum).padStart(3, '0')}`);
      setName(item?.name ?? '');
      setCategory(item?.category ?? 'Perfume');
      setQty(item?.qty?.toString() ?? '0');
      setMin(item?.min?.toString() ?? '5');
    }
  }, [open, item, invNextNum]);

  if (!open) return null;
  const isEdit = !!item;

  const qtyNum = parseInt(qty) || 0;
  const minNum = parseInt(min) || 1;
  const statusText = id && name ? invStatus(qtyNum, minNum) : '— enter qty & min';
  const statusStyle = STATUS_STYLES[statusText] || { bg: '#f8fafc', color: '#94a3b8' };

  const handleSave = () => {
    if (!id.trim() || !name.trim()) return;
    if (qtyNum < 0) return;
    if (minNum < 1) return;
    const data = { id: id.trim(), name: name.trim(), category, qty: qtyNum, min: minNum };
    if (isEdit) updateInventoryItem(item.id, data);
    else addInventoryItem(data);
    closeInvModal();
  };

  const handleDelete = () => {
    if (!item) return;
    if (!confirm(`Delete inventory item "${item.name}"?`)) return;
    deleteInventoryItem(item.id);
    closeInvModal();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 16,
    }} onClick={closeInvModal}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 480,
        padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</div>
          <button onClick={closeInvModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <FieldLabel>Product ID</FieldLabel>
            <input value={id} onChange={e => setId(e.target.value)} placeholder="e.g. PRD-031" disabled={isEdit}
              style={{ ...inputStyle, background: isEdit ? '#f8fafc' : 'white', color: isEdit ? '#94a3b8' : '#1e293b' }}
              onFocus={e => { if (!isEdit) e.currentTarget.style.borderColor = '#7c3aed'; }}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <FieldLabel>Product Name</FieldLabel>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sauvage Dior 85ML"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <FieldLabel>Category</FieldLabel>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Current Qty</FieldLabel>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="0" placeholder="0"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <FieldLabel>Min Stock Level</FieldLabel>
            <input type="number" value={min} onChange={e => setMin(e.target.value)} min="1" placeholder="5"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <FieldLabel>Status Preview</FieldLabel>
            <div style={{ padding: '11px 13px', background: statusStyle.bg, color: statusStyle.color, borderRadius: 9, fontSize: 13, fontWeight: 700, border: `1.5px solid ${statusStyle.bg === '#f8fafc' ? '#e2e8f0' : statusStyle.color + '33'}`, marginTop: 0 }}>
              {statusText}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {isEdit && (
            <button onClick={handleDelete}
              style={{ padding: '12px 14px', background: '#fee2e2', border: 'none', borderRadius: 9, color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            ><Trash2 size={13} /> Delete</button>
          )}
          <button onClick={closeInvModal}
            style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Cancel</button>
          <button onClick={handleSave} disabled={!id.trim() || !name.trim()}
            style={{
              flex: 2, padding: '12px', border: 'none', borderRadius: 9,
              background: (id.trim() && name.trim()) ? '#7c3aed' : '#e2e8f0',
              color: (id.trim() && name.trim()) ? 'white' : '#94a3b8',
              fontSize: 13, fontWeight: 800, cursor: (id.trim() && name.trim()) ? 'pointer' : 'default',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          ><Save size={14} /> Save Item</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none',
  color: '#1e293b', boxSizing: 'border-box', background: 'white',
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 5 }}>{children}</div>;
}
