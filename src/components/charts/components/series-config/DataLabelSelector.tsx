import { MultiSelect } from "@/components/ui/multi-select";
import { defaultYearRange } from "@/schemas/charts";

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
        <label className="text-sm font-medium">Data Labels</label>
        <p className="text-sm text-muted-foreground">
          Select specific years. If none selected, all years will be shown.
        </p>
      </div>
      <MultiSelect
        options={years}
        selected={selectedLabels}
        onChange={onChange}
        placeholder="Select years..."
      />
    </div>
  );
}
