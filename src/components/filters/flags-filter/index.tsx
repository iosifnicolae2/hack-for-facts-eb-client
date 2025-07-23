import { Label } from "@/components/ui/label";
import { useFilterSearch } from "@/lib/hooks/useLineItemsFilter";
import { YesNoRadioGroup } from "@/components/ui/yes-no-radio-group";

export function FlagsFilter() {
    const { isMainCreditor, setIsMainCreditor, isUat, setIsUat } = useFilterSearch();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Este ordonator principal de credite</Label>
                <YesNoRadioGroup value={isMainCreditor} onChange={setIsMainCreditor} />
            </div>
            <div className="flex items-center justify-between">
                <Label>Este UAT</Label>
                <YesNoRadioGroup value={isUat} onChange={setIsUat} />
            </div>
        </div>
    );
} 