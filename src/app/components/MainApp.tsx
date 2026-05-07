import React, { useEffect, useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SalesScreen } from './screens/SalesScreen';
import { ReceiptsScreen } from './screens/ReceiptsScreen';
import { ItemsScreen } from './screens/ItemsScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { UsersScreen } from './screens/UsersScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ChargeModal } from './modals/ChargeModal';
import { RefundModal } from './modals/RefundModal';
import { ProductModal } from './modals/ProductModal';
import { InventoryItemModal } from './modals/InventoryItemModal';
import { AdjustStockModal } from './modals/AdjustStockModal';
import { UserModal } from './modals/UserModal';
import { Toast } from './shared/Toast';
import { AccessDenied } from './shared/AccessDenied';
import { useIsMobile } from './shared/useMediaQuery';

const SCREENS: Record<string, React.ComponentType> = {
  sales: SalesScreen,
  receipts: ReceiptsScreen,
  items: ItemsScreen,
  inventory: InventoryScreen,
  users: UsersScreen,
  history: HistoryScreen,
  settings: SettingsScreen,
};

export function MainApp() {
  const { currentScreen } = usePOS();
  const ScreenComponent = SCREENS[currentScreen] || SalesScreen;
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when switching screens.
  useEffect(() => { setDrawerOpen(false); }, [currentScreen]);
  // Close drawer when growing back to desktop.
  useEffect(() => { if (!isMobile) setDrawerOpen(false); }, [isMobile]);

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100dvh', overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Desktop: inline sidebar.  Mobile: drawer overlay. */}
      {!isMobile && <Sidebar />}

      {isMobile && (
        <>
          {/* Backdrop */}
          {drawerOpen && (
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                zIndex: 60, animation: 'fadeIn 0.18s ease-out',
              }}
            />
          )}
          {/* Sliding drawer */}
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 240, zIndex: 70,
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.22s ease-out',
            display: 'flex',
            boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.45)' : 'none',
          }}>
            <Sidebar />
          </div>
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar onMenuClick={isMobile ? () => setDrawerOpen(v => !v) : undefined} />
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minWidth: 0 }}>
          <ScreenComponent key={currentScreen} />
        </div>
      </div>

      {/* Modals */}
      <ChargeModal />
      <RefundModal />
      <ProductModal />
      <InventoryItemModal />
      <AdjustStockModal />
      <UserModal />

      {/* Overlays */}
      <Toast />
      <AccessDenied />
    </div>
  );
}
