import { useMutation } from '@tanstack/react-query';
import { unsubscribeViaToken } from '../api/notifications';

export function useUnsubscribe() {
  return useMutation({
    mutationFn: (token: string) => unsubscribeViaToken(token),
  });
}
