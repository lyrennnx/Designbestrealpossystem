import React, { useEffect, useState } from 'react';
import { ShoppingCart, Receipt, Package, Boxes, Users, BarChart3, Settings, ShoppingBag, LogOut } from 'lucide-react';
import { usePOS, Screen } from '../context/POSContext';

const NAV_ITEMS: { screen: Screen; icon: React.ReactNode; label: string; ownerOnly?: boolean }[] = [
  { screen: 'sales',     icon: <ShoppingCart size={20} />,  label: 'Sales' },
  { screen: 'receipts',  icon: <Receipt size={20} />,       label: 'Receipts' },
  { screen: 'items',     icon: <Package size={20} />,       label: 'Items',    ownerOnly: true },
  { screen: 'inventory', icon: <Boxes size={20} />,         label: 'Inventory' },
  { screen: 'users',     icon: <Users size={20} />,         label: 'Users',    ownerOnly: true },
  { screen: 'history',   icon: <BarChart3 size={20} />,     label: 'History' },
  { screen: 'settings',  icon: <Settings size={20} />,      label: 'Settings', ownerOnly: true },
];

export function Sidebar() {
  const { currentUser, currentScreen, setScreen, logout, can } = usePOS();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const isOwner = currentUser?.role === 'owner';

  return (
    <aside style={{
      width: 200,
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex', flexDirection: 'column',
      boxShadow: '2px 0 20px rgba(0,0,0,0.4)',
      zIndex: 20, flexShrink: 0,
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.4)', flexShrink: 0,
          }}>
            <ShoppingBag size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
              the <span style={{ color: '#a78bfa' }}>1470.</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9.5, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Fragrance POS</div>
          </div>
        </div>
        {/* Clock */}
        <div style={{
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 8, padding: '6px 10px',
          textAlign: 'center',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: 0.5 }}>{clock}</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ screen, icon, label, ownerOnly }) => {
          if (ownerOnly && !isOwner) return null;
          const active = currentScreen === screen;
          return (
            <button key={screen} onClick={() => setScreen(screen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: active ? 'rgba(124,58,237,0.2)' : 'transparent',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                position: 'relative', transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <div style={{
                  position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: '65%', background: '#a78bfa', borderRadius: '0 3px 3px 0',
                }} />
              )}
              <span style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.4)', flexShrink: 0, transition: 'color 0.15s' }}>{icon}</span>
              <span style={{ color: active ? '#e2e8f0' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: active ? 700 : 500, transition: 'color 0.15s' }}>
                {label}
              </span>
              {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', marginBottom: 6,
          background: 'rgba(255,255,255,0.04)', borderRadius: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: isOwner ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #0369a1, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            {isOwner ? '👑' : '👤'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.fullName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {isOwner ? 'Owner' : 'Employee'}
            </div>
          </div>
        </div>
        <button onClick={logout}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
        >
          <LogOut size={13} /> Sign Out
        </button>
        <div style={{ textAlign: 'center', marginTop: 8, color: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          POS_CPET-8 LAB · v3.07
        </div>
      </div>
    </aside>
  );
}
