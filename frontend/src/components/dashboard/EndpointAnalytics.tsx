"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyticsApi, type AnalyticsData } from "@/lib/api";
import { Activity, AlertCircle, CheckCircle2, Clock, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EndpointAnalyticsProps {
  endpointId: string;
}

export function EndpointAnalytics({ endpointId }: EndpointAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d" | "all">("7d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await analyticsApi.getEndpointAnalytics(endpointId, period);
        setAnalytics(data);
      } catch (error: any) {
        console.error("Failed to fetch analytics:", error);
        toast.error(error.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (endpointId) {
      fetchAnalytics();
    }
  }, [endpointId, period]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Request statistics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Request statistics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No analytics data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, timeSeries } = analytics;

  // Prepare chart data
  const maxValue = Math.max(
    ...timeSeries.map((d) => d.successful + d.errored),
    1
  );

  const chartHeight = 200;
  const chartWidth = 100;
  const padding = 20;

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (period === "24h") {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Analytics
            </CardTitle>
            <CardDescription>Request statistics over time</CardDescription>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground">Total Requests</div>
            <div className="text-xl sm:text-2xl font-bold">{summary.totalRequests}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Successful
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">
              {summary.successfulRequests}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-500" />
              Errored
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-500">
              {summary.erroredRequests}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              Success Rate
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-500">
              {summary.successRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Response Time */}
        {summary.averageResponseTime > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Average Response Time:</span>
            <span className="text-sm font-semibold">
              {summary.averageResponseTime.toFixed(0)}ms
            </span>
          </div>
        )}

        {/* Chart */}
        {timeSeries.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm font-medium">Request Volume Over Time</div>
            <div className="relative w-full overflow-x-auto">
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${Math.max(timeSeries.length * 40, 400)} ${chartHeight}`}
                className="min-w-full"
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1={padding}
                    y1={padding + ratio * (chartHeight - 2 * padding)}
                    x2={Math.max(timeSeries.length * 40, 400) - padding}
                    y2={padding + ratio * (chartHeight - 2 * padding)}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted-foreground opacity-20"
                  />
                ))}

                {/* Chart bars */}
                {timeSeries.map((data, index) => {
                  const x = padding + (index * (Math.max(timeSeries.length * 40, 400) - 2 * padding)) / Math.max(timeSeries.length - 1, 1);
                  const successfulHeight = (data.successful / maxValue) * (chartHeight - 2 * padding);
                  const erroredHeight = (data.errored / maxValue) * (chartHeight - 2 * padding);
                  const successfulY = chartHeight - padding - successfulHeight;
                  const erroredY = successfulY - erroredHeight;

                  return (
                    <g key={index}>
                      {/* Successful requests bar */}
                      {data.successful > 0 && (
                        <rect
                          x={x - 6}
                          y={successfulY}
                          width="12"
                          height={successfulHeight}
                          fill="#22c55e"
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                      )}
                      {/* Errored requests bar */}
                      {data.errored > 0 && (
                        <rect
                          x={x - 6}
                          y={erroredY}
                          width="12"
                          height={erroredHeight}
                          fill="#ef4444"
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                      )}
                      {/* X-axis label */}
                      {index % Math.ceil(timeSeries.length / 8) === 0 && (
                        <text
                          x={x}
                          y={chartHeight - 5}
                          textAnchor="middle"
                          className="text-[10px] fill-muted-foreground"
                        >
                          {formatTimestamp(data.timestamp)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform={`translate(${Math.max(timeSeries.length * 40, 400) - padding - 100}, ${padding + 10})`}>
                  <rect x="0" y="0" width="12" height="12" fill="#22c55e" className="opacity-80" />
                  <text x="16" y="9" className="text-xs fill-foreground">Successful</text>
                  <rect x="0" y="16" width="12" height="12" fill="#ef4444" className="opacity-80" />
                  <text x="16" y="25" className="text-xs fill-foreground">Errored</text>
                </g>
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

