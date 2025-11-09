"use client"

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import * as React from "react"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<any>,
  React.ComponentPropsWithoutRef<any>
>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <ScrollAreaPrimitive.Root
    ref={ref as any}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    {/* @ts-expect-error - React 18/19 type compatibility issue */}
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    {/* @ts-expect-error - React 18/19 type compatibility issue */}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<any>,
  React.ComponentPropsWithoutRef<any>
>(({ className, orientation = "vertical", ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref as any}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
      "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
      "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    {/* @ts-expect-error - React 18/19 type compatibility issue */}
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

