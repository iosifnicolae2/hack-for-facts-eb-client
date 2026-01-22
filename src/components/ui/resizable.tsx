import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";
import React from "react";
import { GripVertical } from "lucide-react";

type ResizablePanelGroupProps = Omit<
  React.ComponentProps<typeof ResizablePrimitive.Group>,
  "orientation"
> & {
  direction?: "horizontal" | "vertical";
  orientation?: "horizontal" | "vertical";
};

const ResizablePanelGroup = ({
  className,
  direction,
  orientation,
  ...props
}: ResizablePanelGroupProps) => (
  <ResizablePrimitive.Group
    orientation={direction ?? orientation}
    className={cn("flex h-full w-full", className)}
    {...props}
  />
);

const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.Panel
    {...props}
    elementRef={ref}
    className={cn("min-w-[200px] min-h-[200px]", className)}
  />
));
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.Separator
    className={cn(
      "group/handle relative flex items-center justify-center",
      // Base styles
      "bg-border transition-all z-10",
      // Size depending on separator orientation
      "[&[aria-orientation=vertical]]:h-full [&[aria-orientation=vertical]]:w-[3px]",
      "[&[aria-orientation=horizontal]]:h-[3px] [&[aria-orientation=horizontal]]:w-full",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div
        className={cn(
          "opacity-0 group-hover/handle:opacity-100 transition-opacity absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <GripVertical className="h-3 w-3 z-100 text-foreground bg-muted rounded-sm" />
      </div>
    )}
  </ResizablePrimitive.Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
