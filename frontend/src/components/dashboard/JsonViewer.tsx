"use client";

import { cn } from "@/lib/utils";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: any;
  className?: string;
}

const MAX_ARRAY_ITEMS = 10; // Show first 10 items in arrays
const MAX_STRING_LENGTH = 500; // Truncate long strings
const MAX_JSON_SIZE = 100000; // ~100KB - if larger, show truncated version

function truncateData(obj: any, depth: number = 0, maxDepth: number = 10): any {
  if (depth > maxDepth) {
    return "[Max depth reached]";
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length > MAX_ARRAY_ITEMS) {
      return [
        ...obj.slice(0, MAX_ARRAY_ITEMS).map((item) => truncateData(item, depth + 1, maxDepth)),
        `... (${obj.length - MAX_ARRAY_ITEMS} more items)`,
      ];
    }
    return obj.map((item) => truncateData(item, depth + 1, maxDepth));
  }

  if (typeof obj === "object") {
    const truncated: any = {};
    for (const [key, value] of Object.entries(obj)) {
      truncated[key] = truncateData(value, depth + 1, maxDepth);
    }
    return truncated;
  }

  if (typeof obj === "string" && obj.length > MAX_STRING_LENGTH) {
    return obj.substring(0, MAX_STRING_LENGTH) + `... (${obj.length - MAX_STRING_LENGTH} more characters)`;
  }

  return obj;
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  const [showFull, setShowFull] = useState(false);

  const formatJson = (obj: any, truncate: boolean = true): string => {
    try {
      const dataToFormat = truncate ? truncateData(obj) : obj;
      return JSON.stringify(dataToFormat, null, 2);
    } catch {
      return String(obj);
    }
  };

  const fullJsonString = formatJson(data, false);
  const isLarge = fullJsonString.length > MAX_JSON_SIZE;
  const displayJsonString = isLarge && !showFull ? formatJson(data, true) : fullJsonString;

  const downloadJson = () => {
    const blob = new Blob([fullJsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("rounded-md overflow-hidden border", className)}>
      {isLarge && (
        <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Large response ({Math.round(fullJsonString.length / 1024)}KB) - Showing{" "}
              {showFull ? "full" : "truncated"} version
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFull(!showFull)}
              className="h-7 text-xs"
            >
              {showFull ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Full
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadJson}
              className="h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      )}
      <div className="max-h-[600px] overflow-auto">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            borderRadius: "0.375rem",
          }}
          showLineNumbers={false}
        >
          {displayJsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

