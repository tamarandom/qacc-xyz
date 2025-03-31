import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { PriceHistory } from "@shared/schema";

interface VolumeChartProps {
  projectId: number;
}

type TimeFrame = "7d" | "30d" | "90d" | "1y";

export function VolumeChart({ projectId }: VolumeChartProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("7d");
  
  const { data: priceHistory, isLoading, isError } = useQuery<PriceHistory[]>({
    queryKey: [`/api/projects/${projectId}/price-history`, timeframe],
    queryFn: () => fetch(`/api/projects/${projectId}/price-history?timeframe=${timeframe}`).then(res => res.json()),
    enabled: !!projectId,
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Volume</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !priceHistory || priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Volume</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">No volume data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Process data to aggregate by day for better visualization
  const processedData = new Map<string, { timestamp: number; volume: number }>();
  
  priceHistory.forEach(entry => {
    if (entry.volume) {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      if (processedData.has(dateKey)) {
        const existingData = processedData.get(dateKey)!;
        existingData.volume += parseFloat(entry.volume);
      } else {
        processedData.set(dateKey, {
          timestamp: date.getTime(),
          volume: parseFloat(entry.volume)
        });
      }
    }
  });
  
  const chartData = Array.from(processedData.values())
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Format the date based on the timeframe
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === "7d") {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Volume</CardTitle>
          
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)}>
            <TabsList className="grid grid-cols-4 bg-muted h-8">
              <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
              <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `$${Math.floor(value / 1000)}k`}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                width={60}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              />
              <Bar 
                dataKey="volume" 
                fill="#101010" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}