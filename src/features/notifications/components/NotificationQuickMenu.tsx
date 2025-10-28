import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToggleNotification } from '../hooks/useToggleNotification';
import { Link } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';
import { ArrowRight } from 'lucide-react';
import type { Notification, NotificationType } from '../types';
import { NOTIFICATION_TYPE_CONFIGS } from '../types';

const NEWSLETTER_TYPES: NotificationType[] = [
  'newsletter_entity_monthly',
  'newsletter_entity_quarterly',
  'newsletter_entity_yearly',
];

interface Props {
  cui: string;
  entityName: string;
  notifications: Notification[];
  onClose?: () => void;
}

export function NotificationQuickMenu({ cui, entityName, notifications, onClose }: Props) {
  const toggleMutation = useToggleNotification();

  const handleToggle = (type: NotificationType, isChecked: boolean) => {
    if (toggleMutation.isPending) return;
    toggleMutation.mutate({
      entityCui: cui,
      notificationType: type,
      isActive: isChecked,
    });
  };

  const getNotificationStatus = (type: NotificationType) => {
    const notification = notifications.find(
      n => n.notificationType === type && n.entityCui === cui
    );
    return notification?.isActive ?? false;
  };

  return (
    <div className="w-full space-y-5 p-2">
      <div className="space-y-1">
        <h3 className="font-semibold text-xl">
          <Trans>Get updates about</Trans>
        </h3>
        <p className="text-base text-muted-foreground truncate">{entityName}</p>
      </div>

      <Separator />

      <div className="space-y-1">
        {NEWSLETTER_TYPES.map((type) => {
          const config = NOTIFICATION_TYPE_CONFIGS[type];
          const isActive = getNotificationStatus(type);

          return (
            <div
              key={type}
              className="flex items-center justify-between gap-4 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
              onClick={() => handleToggle(type, !isActive)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium group-hover:text-foreground transition-colors">
                  {config.label}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 break-words">
                  {config.description}
                </p>
              </div>
              <Switch
                className="cursor-pointer disabled:cursor-pointer transition-all duration-300"
                checked={isActive}
                onCheckedChange={(checked) => handleToggle(type, checked)}
                disabled={toggleMutation.isPending}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          );
        })}
      </div>

      <Link to="/settings/notifications" onClick={onClose} className="block">
        <Button
          variant="default"
          size="lg"
          className="w-full mt-16 sm:mt-auto justify-between group hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Trans>Manage all notifications</Trans>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}
