import { POSProvider, usePOS } from './context/POSContext';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';

function AppInner() {
  const { currentUser } = usePOS();
  return currentUser ? <MainApp /> : <LoginScreen />;
}

export default function App() {
  return (
    <POSProvider>
      <AppInner />
    </POSProvider>
  );
}
