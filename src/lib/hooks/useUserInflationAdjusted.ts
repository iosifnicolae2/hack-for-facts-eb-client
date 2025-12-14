import { usePersistedState } from "./usePersistedState";

export function useUserInflationAdjusted() {
  return usePersistedState<boolean>('user-inflation-adjusted', false);
}

