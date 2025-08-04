import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface UnitInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function UnitInput({ id, value, onChange, placeholder = "e.g., RON, %, Units..." }: UnitInputProps) {
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
            <Label htmlFor="series-unit">Unit</Label>
            <Input
                id={id}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
            />
            <p className="text-sm text-muted-foreground">
                Series with different units will be displayed on separate Y-axes
            </p>
        </div>
    );
}