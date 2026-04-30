import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function UserModal() {
  const { userModal, closeUserModal, addUser, updateUser, deleteUser, currentUser } = usePOS();
  const { open, user } = userModal;

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'employee'>('employee');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(user?.fullName ?? '');
      setUsername(user?.username ?? '');
      setPassword(user?.password ?? '');
      setRole(user?.role ?? 'employee');
      setShowPass(false);
    }
  }, [open, user]);

  if (!open) return null;
  const isEdit = !!user;
  const isSelf = user?.id === currentUser?.id;

  const handleSave = () => {
    if (!fullName.trim() || !username.trim() || !password.trim()) return;
    if (isEdit && user) updateUser(user.id, { fullName: fullName.trim(), username: username.trim(), password, role });
    else addUser({ fullName: fullName.trim(), username: username.trim(), password, role });
    closeUserModal();
  };

  const handleDelete = () => {
    if (!user || isSelf) return;
    if (!confirm(`Delete user "${user.fullName}"?`)) return;
    deleteUser(user.id);
    closeUserModal();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 16,
    }} onClick={closeUserModal}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 420,
        padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{isEdit ? 'Edit User' : 'Add User'}</div>
          <button onClick={closeUserModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FieldLabel>Full Name</FieldLabel>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Juan dela Cruz"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <FieldLabel>Username</FieldLabel>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. juan123" autoComplete="off"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ ...inputStyle, paddingRight: 38 }}
                onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
              <button onClick={() => setShowPass(!showPass)} type="button"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <FieldLabel>Role</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['owner', 'employee'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                style={{
                  padding: '11px', borderRadius: 10,
                  border: `2px solid ${role === r ? '#7c3aed' : '#e2e8f0'}`,
                  background: role === r ? '#f5f3ff' : 'white',
                  color: role === r ? '#7c3aed' : '#64748b',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >{r === 'owner' ? '👑 Owner' : '👤 Employee'}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isEdit && !isSelf && (
            <button onClick={handleDelete}
              style={{ padding: '12px 14px', background: '#fee2e2', border: 'none', borderRadius: 9, color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            ><Trash2 size={13} /> Delete</button>
          )}
          <button onClick={closeUserModal}
            style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >Cancel</button>
          <button onClick={handleSave} disabled={!fullName.trim() || !username.trim() || !password.trim()}
            style={{
              flex: 2, padding: '12px', border: 'none', borderRadius: 9,
              background: (fullName.trim() && username.trim() && password.trim()) ? '#7c3aed' : '#e2e8f0',
              color: (fullName.trim() && username.trim() && password.trim()) ? 'white' : '#94a3b8',
              fontSize: 13, fontWeight: 800,
              cursor: (fullName.trim() && username.trim() && password.trim()) ? 'pointer' : 'default',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          ><Save size={14} /> Save User</button>
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
