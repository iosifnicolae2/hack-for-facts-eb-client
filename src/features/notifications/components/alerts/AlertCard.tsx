import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview';
import { Pencil, Trash2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { buildAlertPreviewChartState } from '@/lib/alert-links';
import type { Alert } from '@/schemas/alerts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AlertCardProps {
  alert: Alert;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: (isActive: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
  onPreview: () => void;
}

export function AlertCard({
  alert,
  isToggling,
  isDeleting,
  onToggle,
  onDelete,
  onEdit,
  onPreview,
}: AlertCardProps) {
  const operatorLabels: Record<string, string> = {
    gt: t`greater than`,
    gte: t`greater or equal to`,
    lt: t`less than`,
    lte: t`less or equal to`,
    eq: t`equals`,
  };

  const conditionsCopy = alert.conditions && alert.conditions.length > 0
    ? alert.conditions.map((condition) =>
        `${operatorLabels[condition.operator] ?? condition.operator} ${condition.threshold} ${condition.unit}`
      ).join(', ')
    : t`No conditions set`;

  const titleCopy = `${alert.title || t`Alert`} · ${conditionsCopy}`;
  const previewChart = buildAlertPreviewChartState(alert).chart;

  return (
    <div className="rounded-3xl border border-muted-foreground/10 bg-gradient-to-br from-background via-background to-muted/30 shadow-sm transition-all hover:shadow-lg">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onEdit}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer text-left"
              >
                {alert.title || t`Untitled alert`}
              </button>
              <Badge variant={alert.isActive ? 'success' : 'outline'}>
                {alert.isActive ? t`Active` : t`Paused`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {titleCopy}
            </p>
            {alert.description ? (
              <p className="text-xs text-muted-foreground">
                {alert.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={onEdit}
              title={t`Edit alert`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Switch
              checked={alert.isActive}
              onCheckedChange={onToggle}
              disabled={isToggling || isDeleting}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <Trans>Delete alert</Trans>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <Trans>
                      Are you sure you want to delete this alert? This action cannot be undone.
                    </Trans>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Trans>Cancel</Trans>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    <Trans>Delete</Trans>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <button
          onClick={onPreview}
          className="rounded-2xl border border-muted-foreground/10 bg-background/70 p-4 shadow-inner hover:bg-background/90 transition-colors cursor-pointer"
        >
          <ChartPreview
            chart={previewChart}
            height={180}
            className="rounded-xl bg-gradient-to-br from-muted/20 via-background to-muted/10 px-3 py-2"
            customizeChart={(draft) => {
              draft.config.showLegend = true;
              draft.config.showTooltip = true;
              draft.config.showGridLines = true;
            }}
          />
        </button>
      </div>
    </div>
  );
}
