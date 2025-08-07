import { useMapFilter } from "@/lib/hooks/useMapFilterStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const viewOptions = [
    { id: "UAT", label: "UAT" },
    { id: "Judet", label: "Județ" },
] as const;

export function MapViewTypeRadioGroup() {
    const { mapViewType, setMapViewType } = useMapFilter();

    const handleValueChange = (value: "UAT" | "Judet") => {
        setMapViewType(value);
    };

    return (
        <RadioGroup
            defaultValue={mapViewType}
            className="grid grid-cols-2 gap-4"
            onValueChange={handleValueChange}
        >
            {viewOptions.map(option => (
                <div key={option.id}>
                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                    <Label
                        htmlFor={option.id}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        {option.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    );
}
