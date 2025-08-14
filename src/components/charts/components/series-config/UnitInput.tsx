import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
    
interface UnitInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function UnitInput({ id, value, onChange, placeholder = t`e.g., RON, %, Units...` }: UnitInputProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (value: string) => {
        setLocalValue(value);
        onChange(value);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="series-unit"><Trans>Unit</Trans></Label>
            <Input
                id={id}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
            />
            <p className="text-sm text-muted-foreground">
                <Trans>Series with different units will be displayed on separate Y-axes</Trans>
            </p>
        </div>
    );
}