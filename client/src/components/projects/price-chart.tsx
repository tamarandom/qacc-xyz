import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { PriceHistory } from "@shared/schema";

interface PriceChartProps {
  projectId: number;
}

type TimeFrame = "24h" | "7d" | "30d" | "90d" | "1y";

export function PriceChart({ projectId }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("7d");
  
  const { data: priceHistory, isLoading, isError } = useQuery<PriceHistory[]>({
    queryKey: [`/api/projects/${projectId}/price-history`, timeframe],
    queryFn: () => fetch(`/api/projects/${projectId}/price-history?timeframe=${timeframe}`).then(res => res.json()),
    enabled: !!projectId,
  });
  
  // Format data for the chart
  const chartData = (priceHistory || []).map(entry => ({
    timestamp: new Date(entry.timestamp).getTime(),
    price: parseFloat(entry.price),
    volume: entry.volume ? parseFloat(entry.volume) : 0,
  }));
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Chart</CardTitle>
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
          <CardTitle className="text-lg">Price Chart</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">No price data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get min and max values for better axis scaling
  const prices = chartData.map(d => d.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.95); // 5% buffer below
  const maxPrice = Math.ceil(Math.max(...prices) * 1.05); // 5% buffer above
  
  // Format the date based on the timeframe
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === "24h") {
      return date.toLocaleTimeString([], { hour: 'numeric' });
    } else if (timeframe === "7d") {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Price Chart</CardTitle>
          
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)}>
            <TabsList className="grid grid-cols-5 bg-muted h-8">
              <TabsTrigger value="24h" className="text-xs">24H</TabsTrigger>
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
            <LineChart
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
                domain={[minPrice, maxPrice]}
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                width={60}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#FBBA80" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: '#101010', strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}