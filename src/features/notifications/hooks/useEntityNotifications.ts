import { useQuery } from '@tanstack/react-query';
import { getEntityNotifications } from '../api/notifications';
import { useAuth } from '@/lib/auth';

export function useEntityNotifications(cui: string) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'entity', cui],
    queryFn: () => getEntityNotifications(cui),
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
