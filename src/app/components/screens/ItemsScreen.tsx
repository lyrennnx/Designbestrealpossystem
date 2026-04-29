import React from 'react';
import { Plus, Edit2, Package } from 'lucide-react';
import { usePOS, php } from '../../context/POSContext';

export function ItemsScreen() {
  const { products, openProductModal, can } = usePOS();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      {/* Toolbar */}
      <div style={{ padding: '12px 18px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{products.length} Products</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Manage your product catalog</div>
        </div>
        {can('addProduct') && (
          <button onClick={() => openProductModal()}
            style={{
              padding: '9px 16px', background: '#7c3aed', border: 'none', borderRadius: 9, color: 'white',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 10px rgba(124,58,237,0.3)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          ><Plus size={15} /> Add Product</button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9', transition: 'box-shadow 0.15s',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: p.gender === 'male'
                  ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                  : 'linear-gradient(135deg, #9d174d, #db2777)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16 }}>{p.gender === 'male' ? '💙' : '💗'}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>[R] {p.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, textTransform: 'capitalize' }}>{p.gender}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace", marginRight: 8, flexShrink: 0 }}>
                {php(p.price)}
              </div>
              {can('addProduct') && (
                <button onClick={() => openProductModal(p)}
                  style={{
                    padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 7, cursor: 'pointer', color: '#64748b', fontFamily: 'inherit',
                    fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.12s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#7c3aed'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                ><Edit2 size={11} /> Edit</button>
              )}
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <Package size={48} style={{ margin: '0 auto 14px', opacity: 0.25 }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>No products yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Add your first product to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}
