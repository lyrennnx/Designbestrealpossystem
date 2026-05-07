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
