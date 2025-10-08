import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertNotification } from '../api/notifications';
import { toast } from 'sonner';
import type { NotificationType, Notification } from '../types';

export function useToggleNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      entityCui: string | null;
      notificationType: NotificationType;
      isActive: boolean;
    }) => upsertNotification(params),

    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot previous value
      const previousAll = queryClient.getQueryData<Notification[]>(['notifications', 'all']);
      const previousEntity = variables.entityCui
        ? queryClient.getQueryData<Notification[]>(['notifications', 'entity', variables.entityCui])
        : undefined;

      // Optimistically update
      if (variables.entityCui) {
        queryClient.setQueryData<Notification[]>(
          ['notifications', 'entity', variables.entityCui],
          (old = []) => {
            const existing = old.find(
              n => n.notificationType === variables.notificationType && n.entityCui === variables.entityCui
            );

            if (existing) {
              return old.map(n =>
                n.id === existing.id ? { ...n, isActive: variables.isActive } : n
              );
            } else {
              // New notification - will be created
              return old;
            }
          }
        );
      }

      return { previousAll, previousEntity };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAll) {
        queryClient.setQueryData(['notifications', 'all'], context.previousAll);
      }
      if (variables.entityCui && context?.previousEntity) {
        queryClient.setQueryData(
          ['notifications', 'entity', variables.entityCui],
          context.previousEntity
        );
      }

      console.error('Failed to update notification:', err);
      toast.error('Failed to update notification');
    },

    onSuccess: (_data, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      const action = variables.isActive ? 'enabled' : 'disabled';
      toast.success(`Notification ${action}`);
    },
  });
}
