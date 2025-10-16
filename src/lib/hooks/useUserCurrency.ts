import { usePersistedState } from "./usePersistedState";

type CurrencyCode = 'RON' | 'EUR';

export function useUserCurrency() {
    return usePersistedState<CurrencyCode>('user-currency', 'RON');
}