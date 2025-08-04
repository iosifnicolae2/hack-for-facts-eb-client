
import { BaseListProps } from "../base-filter/interfaces";
import { cn } from "@/lib/utils";
import { ListOption } from "../base-filter/ListOption";
import { ListContainerSimple } from "../base-filter/ListContainerSimple";
import { defaultYearRange } from "@/schemas/charts";

const years = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => defaultYearRange.end - i).reverse();
const rowHight = 35;

export function YearFilter({ selectedOptions, toggleSelect, className }: BaseListProps) {

    return (
        <div className={cn("w-full flex flex-col space-y-3", className)}>
            <ListContainerSimple
                height={years.length * rowHight}
                className="min-h-[10rem]"
            >
                {years.map((year, index) => (
                    <ListOption
                        key={year}
                        uniqueIdPart={year}
                        onClick={() => toggleSelect({ id: year, label: year.toString() })}
                        label={year.toString()}
                        selected={selectedOptions.some(item => item.id === year)}
                        optionHeight={rowHight}
                        optionStart={rowHight * index} />
                ))}
            </ListContainerSimple>

        </div>
    )
}