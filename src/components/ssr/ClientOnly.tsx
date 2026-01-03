import { useState, useEffect, type ReactNode } from 'react';

type ClientOnlyProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
};

/**
 * A component that only renders its children on the client side.
 * During SSR, it renders the fallback (or null).
 * After hydration, it renders the children.
 *
 * Use this to wrap components that:
 * - Use browser-only APIs (window, document, localStorage)
 * - Import libraries that access the DOM on load (Leaflet, Recharts)
 * - Cannot be rendered on the server
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}
