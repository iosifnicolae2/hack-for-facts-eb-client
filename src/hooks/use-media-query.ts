import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    updateMatch();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    }

    media.addListener(updateMatch);
    return () => media.removeListener(updateMatch);
  }, [query]);

  return matches;
}
