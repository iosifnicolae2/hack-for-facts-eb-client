import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { useAlertStore } from '../hooks/useAlertStore';
import { buildAlertPreviewChartLink, buildAlertPreviewChartState } from '@/lib/alert-links';

export function AlertPreviewView() {
  const { alert, setView } = useAlertStore();
  const chartState = buildAlertPreviewChartState(alert);
  const chartLink = buildAlertPreviewChartLink(alert);
  const primarySeries = chartState.chart.series.find((series) => series.type !== 'custom-series-value');
  const thresholdSeries = chartState.chart.series.find((series) => series.type === 'custom-series-value') as (typeof chartState.chart.series)[number] | undefined;
  const thresholdColor = thresholdSeries?.config.color ?? '#f97316';
  const thresholdValue =
    thresholdSeries && 'value' in thresholdSeries
      ? (thresholdSeries as { value: number }).value
      : alert.condition.threshold;

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => setView('overview')}>
          <ArrowLeft className="h-4 w-4" />
          <Trans>Back to alert</Trans>
        </Button>
        <Link {...chartLink} replace={false}>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            <Trans>Open in charts</Trans>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>{alert.title || <Trans>Alert preview</Trans>}</CardTitle>
          {alert.description ? (
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <ChartPreview
            chart={chartState.chart}
            height={420}
            className="pl-8 pr-4"
            customizeChart={(draft) => {
              draft.config.showTooltip = true;
              draft.config.showLegend = true;
              draft.config.showGridLines = true;
            }}
          />
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: primarySeries?.config.color || '#0062ff' }} />
              <span>{primarySeries?.label || alert.series.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: thresholdColor }} />
              <span>
                <Trans>Threshold</Trans>: {thresholdValue} {alert.condition.unit}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
