import React, { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ProductModal() {
  const { productModal, closeProductModal, addProduct, updateProduct, deleteProduct, can } = usePOS();
  const { open, product } = productModal;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('150');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    if (open) {
      setName(product?.name ?? '');
      setPrice(product?.price?.toString() ?? '150');
      setGender(product?.gender ?? 'male');
    }
  }, [open, product]);

  if (!open) return null;

  const isEdit = !!product;

  const handleSave = () => {
    if (!name.trim()) return;
    const p = { name: name.trim(), price: parseFloat(price) || 150, gender };
    if (isEdit && product) updateProduct(product.id, p);
    else addProduct(p);
    closeProductModal();
  };

  const handleDelete = () => {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"?`)) return;
    deleteProduct(product.id);
    closeProductModal();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 16,
    }} onClick={closeProductModal}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 420,
        padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{isEdit ? 'Edit Product' : 'Add Product'}</div>
          <button onClick={closeProductModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <X size={15} />
          </button>
        </div>

        <FieldLabel>Product Name</FieldLabel>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sauvage Dior 85ML"
          style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#1e293b', marginBottom: 14, boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
          onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        />

        <FieldLabel>Price (₱)</FieldLabel>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)}
          style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#1e293b', marginBottom: 14, boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
          onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        />

        <FieldLabel>Gender</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {(['male', 'female'] as const).map(g => (
            <button key={g} onClick={() => setGender(g)}
              style={{
                padding: '11px', borderRadius: 10,
                border: `2px solid ${gender === g ? (g === 'male' ? '#2563eb' : '#be185d') : '#e2e8f0'}`,
                background: gender === g ? (g === 'male' ? '#eff6ff' : '#fdf2f8') : 'white',
                color: gender === g ? (g === 'male' ? '#1d4ed8' : '#9d174d') : '#64748b',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >{g === 'male' ? '💙 Male' : '💗 Female'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isEdit && can('deleteProduct') && (
            <button onClick={handleDelete}
              style={{ padding: '12px 14px', background: '#fee2e2', border: 'none', borderRadius: 9, color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            ><Trash2 size={13} /> Delete</button>
          )}
          <button onClick={closeProductModal}
            style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()}
            style={{
              flex: 2, padding: '12px', border: 'none', borderRadius: 9,
              background: name.trim() ? '#7c3aed' : '#e2e8f0',
              color: name.trim() ? 'white' : '#94a3b8',
              fontSize: 13, fontWeight: 800, cursor: name.trim() ? 'pointer' : 'default',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: name.trim() ? '0 2px 10px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.15s',
            }}
          ><Save size={14} /> Save Product</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 5 }}>{children}</div>;
}
