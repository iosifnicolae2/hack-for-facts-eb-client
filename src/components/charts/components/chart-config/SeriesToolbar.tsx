import { Button } from '@/components/ui/button';
import { ClipboardPaste } from 'lucide-react';
import { useChartStore } from '../../hooks/useChartStore';
import { CopiedSeriesSchema, Series } from '@/schemas/charts';
import { toast } from 'sonner';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

export function SeriesToolbar() {
  const { chart, setSeries } = useChartStore();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      const validated = CopiedSeriesSchema.safeParse(parsed);
      if (!validated.success) {
        toast.warning(t`Nothing to paste`, { description: t`Clipboard does not contain copied chart series.` });
        return;
      }
      const newSeriesData: Series[] = validated.data.payload as Series[];
      const newSeriesIds = newSeriesData.map((s) => s.id);
      const prevSeries = chart.series.filter((s) => !newSeriesIds.includes(s.id));
      const merged = [...prevSeries, ...newSeriesData].filter((s, index, self) => index === self.findIndex((t) => t.id === s.id));
      setSeries(merged);
      toast.success('Series Pasted', { description: `Added ${newSeriesData.length} series from clipboard.` });
    } catch {
      toast.error('Paste Failed', { description: 'Could not access or parse clipboard.' });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="outline" size="sm" onClick={handlePaste} className="gap-2">
          <ClipboardPaste className="h-4 w-4" />
          <Trans>Paste</Trans>
        </Button>
        <span className="hidden md:block text-xs"><Trans>Tip: Copy/Cut/Paste with ⌘/Ctrl+C, X, V. Duplicate with ⌘/Ctrl+D.</Trans></span>
      </div>
    </div>
  );
}


