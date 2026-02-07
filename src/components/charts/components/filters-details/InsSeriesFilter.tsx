import { Trans } from '@lingui/react/macro';

import { InsSeriesConfiguration } from '@/schemas/charts';
import { getPeriodTags } from '@/lib/period-utils';
import type { ReportPeriodInput } from '@/schemas/reporting';
import { FilterPill } from './FilterPill';

interface InsSeriesFilterProps {
  series: InsSeriesConfiguration;
}

export function InsSeriesFilter({ series }: InsSeriesFilterProps) {
  const classificationSelections = series.classificationSelections ?? {};
  const periodTags = getPeriodTags(series.period as ReportPeriodInput | undefined);
  const hasAnyFilters = Boolean(
    series.datasetCode ||
      periodTags.length > 0 ||
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
      {periodTags.map((periodTag) => (
        <FilterPill
          key={periodTag.key}
          label="Period"
          value={String(periodTag.value)}
        />
      ))}
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
