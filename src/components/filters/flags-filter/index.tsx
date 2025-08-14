import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";
import { t } from "@lingui/core/macro";

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
            options={[{ value: true, label: t`Yes` }, { value: false, label: t`No` }]} />
    );
} 