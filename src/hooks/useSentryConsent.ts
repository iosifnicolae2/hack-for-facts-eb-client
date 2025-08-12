import { useState, useEffect } from 'react';
import { onConsentChange, hasSentryConsent } from '@/lib/consent';

export function useSentryConsent(): boolean {
  const [hasConsent, setHasConsent] = useState(hasSentryConsent());

  useEffect(() => {
    setHasConsent(hasSentryConsent());
    const unsubscribe = onConsentChange((prefs) => {
      setHasConsent(prefs.sentry);
    });
    return () => unsubscribe();
  }, []);

  return hasConsent;
}
