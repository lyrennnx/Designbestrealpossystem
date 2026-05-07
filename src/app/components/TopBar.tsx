import React from 'react';
import { Menu } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { useIsMobile } from './shared/useMediaQuery';

const SCREEN_TITLES: Record<string, string> = {
  sales: 'Sales',
  receipts: 'Receipts',
  items: 'Products',
  inventory: 'Inventory',
  users: 'User Management',
  history: 'History & Analytics',
  settings: 'Settings',
};

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { currentScreen, currentUser } = usePOS();
  const isOwner = currentUser?.role === 'owner';
  const isMobile = useIsMobile();

  return (
    <div style={{
      height: 52, background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 20px', flexShrink: 0,
      fontFamily: "'Inter', sans-serif",
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {isMobile && onMenuClick && (
          <button onClick={onMenuClick} aria-label="Open menu"
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
            <Menu size={18} color="#475569" />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
            {SCREEN_TITLES[currentScreen] || currentScreen}
          </span>
        </div>
        {!isMobile && <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />}
        {!isMobile && <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>POS_CPET-8 LAB</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 20,
          background: isOwner ? '#f5f3ff' : '#eff6ff',
          border: `1px solid ${isOwner ? '#e9d5ff' : '#bfdbfe'}`,
          maxWidth: isMobile ? 130 : 'none',
        }}>
          <span style={{ fontSize: 12 }}>{isOwner ? '👑' : '👤'}</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: isOwner ? '#7c3aed' : '#2563eb',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {currentUser?.fullName}
          </span>
        </div>
      </div>
    </div>
  );
}
