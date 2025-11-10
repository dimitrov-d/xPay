"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <AccordionPrimitive.Item
    ref={ref as any}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <AccordionPrimitive.Header className="flex">
    {/* @ts-expect-error - React 18/19 type compatibility issue */}
    <AccordionPrimitive.Trigger
      ref={ref as any}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      {/* @ts-expect-error - React 18/19 type compatibility issue */}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
  // @ts-expect-error - React 18/19 type compatibility issue
  <AccordionPrimitive.Content
    ref={ref as any}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }

