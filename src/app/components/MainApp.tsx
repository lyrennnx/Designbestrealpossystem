import React from 'react';
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

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
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
