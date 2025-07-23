import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface TriStateRadioGroupProps {
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
  yesLabel?: string;
  noLabel?: string;
  className?: string;
}

const YesNoRadioGroup = React.forwardRef<
  HTMLDivElement,
  TriStateRadioGroupProps
>(({ className, value, onChange, yesLabel = "Da", noLabel = "Nu", ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
      <Button
        variant={value === true ? "secondary" : "outline"}
        size="sm"
        onClick={() => onChange(value === true ? undefined : true)}
      >
        {yesLabel}
      </Button>
      <Button
        variant={value === false ? "secondary" : "outline"}
        size="sm"
        onClick={() => onChange(value === false ? undefined : false)}
      >
        {noLabel}
      </Button>
    </div>
  )
})

YesNoRadioGroup.displayName = "YesNoRadioGroup"

export { YesNoRadioGroup } 