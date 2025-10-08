import { useQuery } from '@tanstack/react-query';
import { getUserNotifications } from '../api/notifications';
import { useAuth } from '@/lib/auth';

export function useAllNotifications() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: getUserNotifications,
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
