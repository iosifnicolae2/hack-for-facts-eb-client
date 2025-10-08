import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteAlert, fetchAlert, fetchAlerts, saveAlert } from '../api/alerts';

export const alertsKeys = {
  all: ['alerts'] as const,
  detail: (alertId: string) => ['alerts', alertId] as const,
};

export function useAlertsList() {
  return useQuery({
    queryKey: alertsKeys.all,
    queryFn: fetchAlerts,
    staleTime: 60_000,
  });
}

export function useAlertDetail(alertId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: alertsKeys.detail(alertId),
    queryFn: () => fetchAlert(alertId),
    enabled: options?.enabled ?? true,
  });
}

export function useSaveAlertMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAlert,
    onSuccess: (savedAlert) => {
      queryClient.setQueryData(alertsKeys.detail(savedAlert.id), savedAlert);
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      toast.success('Alert saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save alert');
    },
  });
}

export function useDeleteAlertMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: (_, alertId) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.removeQueries({ queryKey: alertsKeys.detail(alertId) });
      toast.success('Alert deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete alert'),
  });
}
