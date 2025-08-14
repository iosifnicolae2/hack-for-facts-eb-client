import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";

interface IsUatFilterProps {
    isUat: boolean | undefined;
    setIsUat: (value: boolean | undefined) => void;
}
export function IsUatFilter({ isUat, setIsUat }: IsUatFilterProps) {

    const handleChange = (value: string | number | boolean | undefined) => {
        if (value === undefined) {
            setIsUat(undefined);
        } else if (String(value) === 'true') {
            setIsUat(true);
        } else if (String(value) === 'false') {
            setIsUat(false);
        }
    };

    return (
        <RadioGroupButtons
            value={isUat}
            onChange={handleChange}
            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
    );
} 