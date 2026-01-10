import { useEffect } from 'react';
import { usePersistedState } from './usePersistedState';
import { setPreferenceCookie, USER_CURRENCY_STORAGE_KEY } from '@/lib/user-preferences';

type CurrencyCode = 'RON' | 'EUR' | 'USD';

export function useUserCurrency() {
    const [currency, setCurrency] = usePersistedState<CurrencyCode>(USER_CURRENCY_STORAGE_KEY, 'RON');

    useEffect(() => {
        setPreferenceCookie(USER_CURRENCY_STORAGE_KEY, currency);
    }, [currency]);

    return [currency, setCurrency] as const;
}
