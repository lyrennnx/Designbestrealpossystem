import React from 'react';
import { Search } from 'lucide-react';
import { usePOS } from '../context/POSContext';

const SCREEN_TITLES: Record<string, string> = {
  sales: 'Sales',
  receipts: 'Receipts',
  items: 'Products',
  inventory: 'Inventory',
  users: 'User Management',
  history: 'History & Analytics',
  settings: 'Settings',
};

export function TopBar() {
  const { currentScreen, currentUser } = usePOS();
  const isOwner = currentUser?.role === 'owner';

  return (
    <div style={{
      height: 52, background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
      fontFamily: "'Inter', sans-serif",
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Page title */}
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.2px' }}>
            {SCREEN_TITLES[currentScreen] || currentScreen}
          </span>
        </div>
        <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>POS_CPET-8 LAB</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* User badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 20,
          background: isOwner ? '#f5f3ff' : '#eff6ff',
          border: `1px solid ${isOwner ? '#e9d5ff' : '#bfdbfe'}`,
        }}>
          <span style={{ fontSize: 12 }}>{isOwner ? '👑' : '👤'}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isOwner ? '#7c3aed' : '#2563eb' }}>
            {currentUser?.fullName}
          </span>
        </div>
      </div>
    </div>
  );
}
