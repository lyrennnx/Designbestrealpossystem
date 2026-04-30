import { useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import faviconUrl from '../imports/favicon.png';

function AppInner() {
  const { currentUser } = usePOS();
  return currentUser ? <MainApp /> : <LoginScreen />;
}

export default function App() {
  useEffect(() => {
    const link: HTMLLinkElement =
      document.querySelector("link[rel~='icon']") ||
      (() => {
        const el = document.createElement('link');
        el.rel = 'icon';
        document.head.appendChild(el);
        return el;
      })();
    link.href = faviconUrl;
    link.type = 'image/png';
  }, []);

  return (
    <POSProvider>
      <AppInner />
    </POSProvider>
  );
}