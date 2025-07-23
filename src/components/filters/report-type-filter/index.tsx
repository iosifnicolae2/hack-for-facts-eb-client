import { useFilterSearch } from "@/lib/hooks/useLineItemsFilter";
import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";

const VALID_REPORT_TYPES = [
  { value: 'Executie bugetara agregata la nivel de ordonator principal', label: 'Executie bugetara agregata la nivel de ordonator principal' },
  { value: 'Executie bugetara detaliata', label: 'Executie bugetara detaliata' },
];

export function ReportTypeFilter() {
    const { reportType, setReportType } = useFilterSearch();

    return (
        <RadioGroupButtons
            value={reportType}
            onChange={setReportType}
            options={VALID_REPORT_TYPES}
        />
    );
} 