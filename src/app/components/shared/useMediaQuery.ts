import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Convenience: anything 1024px and below uses the mobile/tablet shell
// (hamburger + drawer). Above 1024 keeps the desktop side-by-side layout.
export const MOBILE_QUERY = '(max-width: 1024px)';
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

// Phone-only — tighter, single-column, native-app-like layout.
// Tablets / iPad portrait stay above this threshold and get the
// roomier centered-card layout.
export const PHONE_QUERY = '(max-width: 640px)';
export const useIsPhone = () => useMediaQuery(PHONE_QUERY);

// Tablet-portrait or larger handhelds (iPad portrait ≈ 768–1024px wide).
export const TABLET_QUERY = '(min-width: 641px) and (max-width: 1024px)';
export const useIsTablet = () => useMediaQuery(TABLET_QUERY);
