import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNotification } from '../api/notifications';
import { NotificationCard } from './NotificationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Plus } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { toast } from 'sonner';
import { useEntityLabel } from '@/hooks/filters/useFilterLabels';
import type { Notification } from '../types';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { AlertsList } from './alerts';

interface Props {
  notifications: Notification[];
  isLoading?: boolean;
}

export function NotificationList({ notifications, isLoading }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Extract unique entity CUIs from notifications
  const entityCuis = useMemo(() => {
    return notifications
      .filter(n => n.entityCui)
      .map(n => n.entityCui!)
      .filter((cui, index, self) => self.indexOf(cui) === index);
  }, [notifications]);

  // Use the entity label hook to fetch and cache entity names
  const entityLabel = useEntityLabel(entityCuis);

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });

  // Enrich notifications with entity names from the label hook
  const enrichedNotifications = useMemo(() => {
    return notifications.map(notification => {
      if (notification.entity?.name) {
        return notification;
      }
      if (notification.entityCui) {
        const entityName = entityLabel.map(notification.entityCui);
        // Only add entity if we got a real name (not the fallback id:: format)
        if (!entityName.startsWith('id::')) {
          return {
            ...notification,
            entity: {
              cui: notification.entityCui,
              name: entityName,
            },
          };
        }
      }
      return notification;
    });
  }, [notifications, entityLabel]);


  const renderNotifications = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <Trans>
              You have no active notifications. Navigate to an entity page and click the bell icon to subscribe to updates.
            </Trans>
          </AlertDescription>
        </Alert>
      );
    }

    const grouped = enrichedNotifications.reduce((acc, notification) => {
      const key = notification.entityCui || 'global';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([entityCui, entityNotifications]) => (
          <NotificationCard
            key={entityCui}
            notifications={entityNotifications}
            onRemove={(id) => removeMutation.mutate(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <section>{renderNotifications()}</section>
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold"><Trans>Data series alerts</Trans></h2>
            <p className="text-sm text-muted-foreground">
              <Trans>Review and manage alerts created from your custom data series.</Trans>
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="self-start rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate({ to: '/alerts/new', replace: false })}
            title={t`Create alert`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <AlertsList />
      </section>
    </div>
  );
}
