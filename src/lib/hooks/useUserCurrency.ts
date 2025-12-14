import { usePersistedState } from "./usePersistedState";

type CurrencyCode = 'RON' | 'EUR' | 'USD';

export function useUserCurrency() {
    return usePersistedState<CurrencyCode>('user-currency', 'RON');
}
