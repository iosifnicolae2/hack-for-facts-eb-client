import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { Analytics } from '@/lib/analytics';
import { createEmptyAlert } from '@/schemas/alerts';

export const Route = createLazyFileRoute('/alerts/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const newAlertId = crypto.randomUUID();
  Analytics.capture(Analytics.EVENTS.AlertCreated, { alert_id: newAlertId });
  return (
    <Navigate
      to="/alerts/$alertId"
      params={{ alertId: newAlertId }}
      search={{
        alert: createEmptyAlert({ id: newAlertId }),
        view: 'overview',
        mode: 'create',
      }}
      replace={true}
    />
  );
}
