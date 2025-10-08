import { useEffect } from 'react';
import { createLazyFileRoute, useParams } from '@tanstack/react-router';
import { AlertEditorView } from '@/components/alerts/components/AlertEditorView';
import { useAlertStore, areAlertsEqual } from '@/components/alerts/hooks/useAlertStore';
import { useAlertDetail } from '@/features/alerts/hooks/useAlertsApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert as UiAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { Analytics } from '@/lib/analytics';

export const Route = createLazyFileRoute('/alerts/')({
  component: AlertEditorPage,
});

function AlertEditorPage() {
  const params = useParams({ from: '/alerts/$alertId/' });
  const { alert, setAlert, view, mode, setView } = useAlertStore();

  const isCreateMode = mode === 'create';
  const detailQuery = useAlertDetail(params.alertId, { enabled: !isCreateMode });
  const serverAlert = detailQuery.data;

  useEffect(() => {
    Analytics.capture(Analytics.EVENTS.AlertOpened, { alert_id: alert.id });
  }, [alert.id]);

  useEffect(() => {
    Analytics.capture(Analytics.EVENTS.AlertViewChanged, { alert_id: alert.id, view });
  }, [alert.id, view]);

  useEffect(() => {
    if (!serverAlert) return;
    if (alert.id !== serverAlert.id || areAlertsEqual(alert, serverAlert)) {
      setAlert(serverAlert, { mode: 'edit' });
    }
  }, [alert, serverAlert, setAlert]);

  if (detailQuery.isLoading && !serverAlert && !isCreateMode) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner text={t`Loading alert…`} />
      </div>
    );
  }

  if (detailQuery.isError && !serverAlert && !isCreateMode) {
    return (
      <div className="container mx-auto px-4 py-12">
        <UiAlert variant="destructive">
          <AlertTitle><Trans>Failed to load alert</Trans></AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{(detailQuery.error as Error)?.message ?? 'Unknown error'}</p>
            <Button size="sm" variant="outline" onClick={() => detailQuery.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          </AlertDescription>
        </UiAlert>
      </div>
    );
  }

  return (
    <div className="container mx-auto  max-w-4xl px-4">
      <AlertEditorView
        serverAlert={serverAlert}
        isFetching={detailQuery.isFetching && !detailQuery.isError}
        mode={mode}
        view={view}
        onChangeView={setView}
      />
    </div>
  );
}
