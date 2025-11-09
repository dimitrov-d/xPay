"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<any>,
  React.ComponentPropsWithoutRef<any> &
  VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <LabelPrimitive.Root
    ref={ref as any}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

