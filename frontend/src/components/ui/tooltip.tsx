import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

// @ts-expect-error - React 18/19 type compatibility issue
const TooltipProvider = ({ delayDuration = 100, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
);

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipContent = React.forwardRef<
  React.ElementRef<any>,
  React.ComponentPropsWithoutRef<any>
>(({ className, sideOffset = 4, ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue

  <TooltipPortal>
    {/* @ts-expect-error - React 18/19 type compatibility issue */}
    <TooltipPrimitive.Content
      ref={ref as any}
      sideOffset={sideOffset}
      className={cn(
        "z-[100] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </TooltipPortal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

