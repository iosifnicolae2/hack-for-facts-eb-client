import { MultiSelect } from "@/components/ui/multi-select";
import { defaultYearRange } from "@/schemas/charts";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
  
type DataLabelSelectorProps = {
  selectedLabels: string[];
  onChange: (selected: string[]) => void;
};

export function DataLabelSelector({ selectedLabels, onChange }: DataLabelSelectorProps) {
  const years = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => defaultYearRange.start + i).map(year => ({
    value: year.toString(),
    label: year.toString(),
  }));

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium"><Trans>Data Labels</Trans></label>
        <p className="text-sm text-muted-foreground">
          <Trans>Select specific years. If none selected, all years will be shown.</Trans>
        </p>
      </div>
      <MultiSelect
        options={years}
        selected={selectedLabels}
        onChange={onChange}
        placeholder={t`Select years...`}
      />
    </div>
  );
}
