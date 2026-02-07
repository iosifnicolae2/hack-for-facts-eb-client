import { Trans } from '@lingui/react/macro';

import { InsSeriesConfiguration } from '@/schemas/charts';
import { FilterPill } from './FilterPill';

interface InsSeriesFilterProps {
  series: InsSeriesConfiguration;
}

export function InsSeriesFilter({ series }: InsSeriesFilterProps) {
  const classificationSelections = series.classificationSelections ?? {};
  const hasAnyFilters = Boolean(
    series.datasetCode ||
      series.periodicity ||
      series.periodRange?.start ||
      series.periodRange?.end ||
      (series.territoryCodes?.length ?? 0) > 0 ||
      (series.sirutaCodes?.length ?? 0) > 0 ||
      (series.unitCodes?.length ?? 0) > 0 ||
      Object.keys(classificationSelections).length > 0
  );

  if (!hasAnyFilters) {
    return (
      <div className="text-sm text-muted-foreground">
        <Trans>No INS filters configured.</Trans>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {series.datasetCode && <FilterPill label="Dataset" value={series.datasetCode} />}
      {series.periodicity && <FilterPill label="Periodicity" value={series.periodicity} />}
      {(series.periodRange?.start || series.periodRange?.end) && (
        <FilterPill
          label="Period"
          value={`${series.periodRange?.start ?? '...'} - ${series.periodRange?.end ?? '...'}`}
        />
      )}
      {series.aggregation && <FilterPill label="Aggregation" value={series.aggregation} />}
      {(series.territoryCodes?.length ?? 0) > 0 && (
        <FilterPill label="Territory" value={(series.territoryCodes ?? []).join(', ')} />
      )}
      {(series.sirutaCodes?.length ?? 0) > 0 && (
        <FilterPill label="Localities" value={(series.sirutaCodes ?? []).join(', ')} />
      )}
      {(series.unitCodes?.length ?? 0) > 0 && (
        <FilterPill label="Units" value={(series.unitCodes ?? []).join(', ')} />
      )}
      {Object.entries(classificationSelections).map(([typeCode, values]) => (
        <FilterPill key={typeCode} label={`Class ${typeCode}`} value={values.join(', ')} />
      ))}
      <FilterPill label="Has Value" value={String(series.hasValue ?? true)} />
    </div>
  );
}
