import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Area,
  ComposedChart
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { PriceHistory } from "@shared/schema";
import { useTheme } from "@/contexts/theme-context";

interface PriceChartProps {
  projectId: number;
}

type TimeFrame = "24h" | "7d" | "30d" | "90d" | "1y";
type ChartType = "PRICE" | "MCAP";
type PricePair = "USD" | "ETH";

export function PriceChart({ projectId }: PriceChartProps) {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>("24h");
  const [chartType, setChartType] = useState<ChartType>("PRICE");
  const [pricePair, setPricePair] = useState<PricePair>("USD");
  
  const { data: priceHistory, isLoading, isError } = useQuery<PriceHistory[]>({
    queryKey: [`/api/projects/${projectId}/price-history`, timeframe],
    queryFn: () => fetch(`/api/projects/${projectId}/price-history?timeframe=${timeframe}`).then(res => res.json()),
    enabled: !!projectId,
  });
  
  // Format data for the chart - including mock ETH values
  const chartData = (priceHistory || []).map(entry => {
    const price = parseFloat(entry.price);
    // Mock ETH value based on price (with a slightly different pattern to show variation)
    const ethPrice = price / 1900; // Approximately based on ETH price
    const adjustedEthPrice = ethPrice * (0.9 + Math.random() * 0.2); // Add some variability
    
    // Mock market cap values for the MCAP view (based on circulating supply * price)
    const mockCirculatingSupply = 6340000; // X23 circulating supply
    const marketCap = price * mockCirculatingSupply;
    const marketCapEth = adjustedEthPrice * mockCirculatingSupply;
    
    return {
      timestamp: new Date(entry.timestamp).getTime(),
      price: price,
      ethPrice: adjustedEthPrice,
      marketCap: marketCap,
      marketCapEth: marketCapEth,
      volume: entry.volume ? parseFloat(entry.volume) : 0,
    };
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart</CardTitle>
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
          <CardTitle className="text-lg">Chart</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">No chart data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine which data key to use based on selected chart type and price pair
  const getDataKey = () => {
    if (chartType === "PRICE") {
      return pricePair === "USD" ? "price" : "ethPrice";
    } else {
      return pricePair === "USD" ? "marketCap" : "marketCapEth";
    }
  };
  
  const dataKey = getDataKey();
  
  // Get min and max values for better axis scaling
  const values = chartData.map(d => d[dataKey] as number);
  const minValue = Math.floor(Math.min(...values) * 0.95); // 5% buffer below
  const maxValue = Math.ceil(Math.max(...values) * 1.05); // 5% buffer above
  
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
  
  // Format Y-axis label based on the pair type
  const formatYAxisLabel = (value: number) => {
    if (pricePair === "USD") {
      return `$${value.toFixed(dataKey.includes("market") ? 0 : 2)}`;
    } else {
      // ETH values will be much smaller, show more decimals
      return `${value.toFixed(dataKey.includes("market") ? 2 : 8)}`;
    }
  };
  
  // Format tooltip based on the pair type
  const formatTooltipValue = (value: number) => {
    if (pricePair === "USD") {
      return dataKey.includes("market") 
        ? formatCurrency(value) 
        : `$${value.toFixed(2)}`;
    } else {
      return dataKey.includes("market")
        ? `${value.toFixed(2)} ETH`
        : `${value.toFixed(8)} ETH`;
    }
  };
  
  return (
    <Card className={`chart-container ${theme === 'dark' 
      ? "bg-[color:var(--color-black)] text-white border-none" 
      : "bg-white border-[color:var(--color-gray-200)]"}`
    }>
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4 items-center">
              <span className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>5m</span>
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)}>
                <TabsList className={`grid grid-cols-5 h-8 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  <TabsTrigger value="24h" className="text-xs">24H</TabsTrigger>
                  <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
                  <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
                  <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex space-x-4">
              <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                <TabsList className={`h-8 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  <TabsTrigger value="PRICE" className="text-xs">PRICE</TabsTrigger>
                  <TabsTrigger value="MCAP" className="text-xs">MCAP</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs value={pricePair} onValueChange={(value) => setPricePair(value as PricePair)}>
                <TabsList className={`h-8 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  <TabsTrigger value="USD" className="text-xs">X23/USD</TabsTrigger>
                  <TabsTrigger value="ETH" className="text-xs">X23/ETH</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Price details line */}
          <div className={`border-t pt-2 ${theme === 'dark' 
            ? 'border-[color:var(--color-black-200)]' 
            : 'border-[color:var(--color-gray-200)]'}`
          }>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-[color:var(--color-peach)] font-mono text-xl">
                  {pricePair === "USD" 
                    ? `$${chartData[chartData.length - 1]?.price.toFixed(2)}` 
                    : `${chartData[chartData.length - 1]?.ethPrice.toFixed(8)}`}
                </span>
                {chartData.length > 1 && (() => {
                  // Calculate actual price change from first to last point
                  const firstValue = chartData[0][dataKey] as number;
                  const lastValue = chartData[chartData.length - 1][dataKey] as number;
                  const changeValue = lastValue - firstValue;
                  const changePercent = (changeValue / firstValue) * 100;
                  const isPositive = changeValue >= 0;
                  
                  return (
                    <span className={`text-xs ${isPositive ? 'text-[color:var(--color-positive)]' : 'text-[color:var(--color-negative)]'}`}>
                      {isPositive ? '+' : ''}
                      {pricePair === "USD" 
                        ? `$${changeValue.toFixed(4)}` 
                        : `${changeValue.toFixed(8)}`} 
                      ({isPositive ? '+' : ''}
                      {changePercent.toFixed(2)}%)
                    </span>
                  );
                })()}
              </div>
              <div className={`text-xs ${theme === 'dark' 
                ? 'text-[color:var(--color-gray)]' 
                : 'text-gray-500'}`
              }>
                Volume <span className={theme === 'dark' 
                  ? 'text-[color:var(--color-gray-300)]' 
                  : 'text-gray-400'
                }>
                  {chartData && chartData.length > 0 && chartData[chartData.length - 1]?.volume
                    ? `$${new Intl.NumberFormat('en-US', { 
                        style: 'decimal',
                        maximumFractionDigits: 0,
                      }).format(chartData[chartData.length - 1].volume)}`
                    : '$0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-peach)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-peach)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={theme === 'dark' ? 'var(--color-black-200)' : 'var(--color-gray-200)'} 
              />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                tick={{ 
                  fontSize: 12, 
                  fill: theme === 'dark' ? 'var(--color-gray)' : 'var(--color-black-100)' 
                }}
                axisLine={{ 
                  stroke: theme === 'dark' ? 'var(--color-black-200)' : 'var(--color-gray-200)' 
                }}
                tickLine={false}
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={formatYAxisLabel}
                tick={{ 
                  fontSize: 12, 
                  fill: theme === 'dark' ? 'var(--color-gray)' : 'var(--color-black-100)' 
                }}
                axisLine={{ 
                  stroke: theme === 'dark' ? 'var(--color-black-200)' : 'var(--color-gray-200)' 
                }}
                tickLine={false}
                width={75}
                orientation="right"
              />
              <Tooltip 
                formatter={(value) => formatTooltipValue(Number(value))}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                contentStyle={theme === 'dark' ? {
                  backgroundColor: 'var(--color-black-300)',
                  border: '1px solid var(--color-black-200)',
                  borderRadius: '6px',
                  color: 'white',
                } : {
                  backgroundColor: 'white',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '6px',
                  color: 'var(--color-black)',
                }}
              />
              {/* Reference line for opening price */}
              {chartData.length > 0 && (
                <ReferenceLine 
                  y={chartData[0][dataKey]} 
                  stroke={theme === 'dark' ? '#666' : '#ccc'} 
                  strokeDasharray="3 3" 
                />
              )}
              {/* Fill area below the line */}
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke="var(--color-peach)" 
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={0}
              />
              {/* Main price line */}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="var(--color-peach)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 5, 
                  stroke: 'var(--color-peach)', 
                  strokeWidth: 1, 
                  fill: theme === 'dark' ? 'var(--color-black)' : 'white' 
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}