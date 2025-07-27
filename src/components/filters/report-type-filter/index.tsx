import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";

const VALID_REPORT_TYPES = [
    { value: 'Executie bugetara agregata la nivel de ordonator principal', label: 'Executie bugetara agregata la nivel de ordonator principal' },
    { value: 'Executie bugetara detaliata', label: 'Executie bugetara detaliata' },
];


interface ReportTypeFilterProps {
    reportType: string | undefined;
    setReportType: (value: string | undefined) => void;
}

export function ReportTypeFilter({ reportType, setReportType }: ReportTypeFilterProps) {

    const handleChange = (value: string | number | boolean | undefined) => {
        if (String(value) === String(reportType)) {
            setReportType(undefined);
        } else {
            setReportType(value as string);
        }
    };

    return (
        <RadioGroupButtons
            value={reportType}
            onChange={handleChange}
            options={VALID_REPORT_TYPES}
        />
    );
} 