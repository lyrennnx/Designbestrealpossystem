import React from 'react';
import { Plus, Edit2, Users, Check, X as XIcon } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

const PERMISSIONS_LIST = [
  { label: 'Sales & Checkout', owner: true, emp: true },
  { label: 'View Receipts', owner: true, emp: true },
  { label: 'Process Refunds', owner: true, emp: false },
  { label: 'Add / Edit Products', owner: true, emp: false },
  { label: 'Delete Products', owner: true, emp: false },
  { label: 'Inventory Management', owner: true, emp: false },
  { label: 'View Inventory', owner: true, emp: true },
  { label: 'User Management', owner: true, emp: false },
  { label: 'Settings & Config', owner: true, emp: false },
];

export function UsersScreen() {
  const { users, currentUser, openUserModal } = usePOS();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f1f5f9', fontFamily: "'Inter', sans-serif", overflowY: 'auto' }}>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: '#7c3aed' }} /> User Management
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Manage Owner and Employee accounts</div>
          </div>
          <button onClick={() => openUserModal()}
            style={{
              padding: '9px 16px', background: '#7c3aed', border: 'none', borderRadius: 9, color: 'white',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 10px rgba(124,58,237,0.3)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          ><Plus size={15} /> Add User</button>
        </div>

        {/* User list */}
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
          {users.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < users.length - 1 ? '1px solid #f8fafc' : 'none',
              background: u.id === currentUser?.id ? '#fafbff' : 'white',
              transition: 'background 0.12s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                background: u.role === 'owner' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #0369a1, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}>
                {u.role === 'owner' ? '👑' : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{u.fullName}</span>
                  {u.id === currentUser?.id && (
                    <span style={{ fontSize: 10, padding: '1px 7px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontWeight: 700 }}>You</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>@{u.username}</div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 10,
                background: u.role === 'owner' ? '#f5f3ff' : '#eff6ff',
                color: u.role === 'owner' ? '#7c3aed' : '#2563eb',
                border: `1px solid ${u.role === 'owner' ? '#e9d5ff' : '#bfdbfe'}`,
                fontSize: 11.5, fontWeight: 700,
              }}>
                {u.role === 'owner' ? '👑 Owner' : '👤 Employee'}
              </span>
              <button onClick={() => openUserModal(u)}
                style={{
                  padding: '7px 12px', background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 8, cursor: 'pointer', color: '#64748b', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#7c3aed'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
              ><Edit2 size={12} /> Edit</button>
            </div>
          ))}
        </div>

        {/* Permissions comparison */}
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              🔐 Role Permissions
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {/* Header */}
            <div style={{ padding: '10px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>Permission</div>
            {[{ label: '👑 Owner', color: '#7c3aed', bg: '#f5f3ff' }, { label: '👤 Employee', color: '#2563eb', bg: '#eff6ff' }].map(r => (
              <div key={r.label} style={{ padding: '10px 18px', background: r.bg, borderBottom: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: r.color, textAlign: 'center' }}>{r.label}</div>
            ))}
            {/* Rows */}
            {PERMISSIONS_LIST.map((p, i) => (
              <React.Fragment key={p.label}>
                <div style={{ padding: '10px 18px', borderBottom: i < PERMISSIONS_LIST.length - 1 ? '1px solid #f8fafc' : 'none', fontSize: 13, color: '#374151', fontWeight: 500 }}>{p.label}</div>
                {[p.owner, p.emp].map((has, j) => (
                  <div key={j} style={{ padding: '10px', borderBottom: i < PERMISSIONS_LIST.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {has
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 12, fontWeight: 600 }}><Check size={14} />Yes</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: 12, fontWeight: 600 }}><XIcon size={14} />No</span>
                    }
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
