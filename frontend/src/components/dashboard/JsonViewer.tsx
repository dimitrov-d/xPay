"use client";

import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: any;
  className?: string;
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const jsonString = formatJson(data);

  return (
    <pre
      className={cn(
        "overflow-auto rounded-md bg-muted p-4 text-sm font-mono text-foreground",
        className
      )}
    >
      {jsonString}
    </pre>
  );
}

