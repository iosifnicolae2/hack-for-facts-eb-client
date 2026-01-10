import { useEffect } from 'react';
import { usePersistedState } from './usePersistedState';
import { setPreferenceCookie, USER_INFLATION_ADJUSTED_STORAGE_KEY } from '@/lib/user-preferences';

export function useUserInflationAdjusted() {
  const [inflationAdjusted, setInflationAdjusted] = usePersistedState<boolean>(
    USER_INFLATION_ADJUSTED_STORAGE_KEY,
    false
  );

  useEffect(() => {
    setPreferenceCookie(USER_INFLATION_ADJUSTED_STORAGE_KEY, String(inflationAdjusted));
  }, [inflationAdjusted]);

  return [inflationAdjusted, setInflationAdjusted] as const;
}
