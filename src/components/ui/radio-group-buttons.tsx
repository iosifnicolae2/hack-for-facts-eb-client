import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface RadioGroupButtonsOption {
    value: string;
    label: string;
}

export interface RadioGroupButtonsProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    options: RadioGroupButtonsOption[];
    className?: string;
}

const RadioGroupButtons = React.forwardRef<
    HTMLDivElement,
    RadioGroupButtonsProps
>(({ className, value, onChange, options, ...props }, ref) => {
    return (
        <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
            {options.map((option) => (
                <Button
                    key={option.value}
                    variant={value === option.value ? "secondary" : "outline"}
                    size="sm"
                    className="w-full h-auto px-3 py-2 text-left"
                    onClick={() => onChange(value === option.value ? undefined : option.value)}
                >
                    <span className="w-full text-wrap">{option.label}</span>
                </Button>
            ))}
        </div>
    )
})

RadioGroupButtons.displayName = "RadioGroupButtons"

export { RadioGroupButtons } 