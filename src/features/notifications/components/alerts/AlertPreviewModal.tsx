import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview';
import { t } from '@lingui/core/macro';
import { buildAlertPreviewChartState } from '@/lib/alert-links';
import type { Alert } from '@/schemas/alerts';

interface AlertPreviewModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AlertPreviewModal({ alert, isOpen, onClose }: AlertPreviewModalProps) {
  if (!alert) return null;

  const previewChartState = buildAlertPreviewChartState(alert);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{alert.title || t`Alert preview`}</DialogTitle>
          {alert.description && (
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <ChartPreview
            chart={previewChartState.chart}
            height={420}
            className="px-4"
            customizeChart={(draft) => {
              draft.config.showTooltip = true;
              draft.config.showLegend = true;
              draft.config.showGridLines = true;
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
