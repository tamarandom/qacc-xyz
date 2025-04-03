import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
type PricePair = "USD" | "ETH"; // Using "ETH" as the type identifier but displaying as "WPOL"

// GeckoTerminal embed resolution mapping to our timeframes
const geckoTerminalResolutions: Record<TimeFrame, string> = {
  "24h": "15m",
  "7d": "1h",
  "30d": "4h",
  "90d": "1d",
  "1y": "1d"
};

export function PriceChart({ projectId }: PriceChartProps) {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>("24h");
  const [chartType, setChartType] = useState<ChartType>("PRICE");
  const [pricePair, setPricePair] = useState<PricePair>("USD");
  
  // Check if this is a special token that needs a GeckoTerminal embed
  const isX23 = projectId === 1;
  const isCTZN = projectId === 4;
  const usesGeckoEmbed = isX23 || isCTZN;
  
  // Define pool addresses for GeckoTerminal embeds
  const geckoPoolAddresses: Record<number, string> = {
    1: '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838', // X23 pool address
    4: '0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8'  // CTZN pool address
  };
  
  // Construct the GeckoTerminal embed URL
  const geckoTerminalUrl = usesGeckoEmbed 
    ? `https://www.geckoterminal.com/polygon_pos/pools/${geckoPoolAddresses[projectId]}?embed=1&info=1&swaps=1&grayscale=0&light_chart=${theme === 'light' ? '1' : '0'}&chart_type=${chartType === 'MCAP' ? 'market_cap' : 'price'}&resolution=${geckoTerminalResolutions[timeframe]}`
    : '';
  
  const { data: priceHistory, isLoading, isError } = useQuery<PriceHistory[]>({
    queryKey: [`/api/projects/${projectId}/price-history`, timeframe],
    queryFn: () => fetch(`/api/projects/${projectId}/price-history?timeframe=${timeframe}`).then(res => res.json()),
    enabled: !!projectId,
  });
  
  // Format data for the chart - including mock WPOL values
  const chartData = (priceHistory || []).map(entry => {
    const price = parseFloat(entry.price);
    // Mock WPOL value based on price (with a slightly different pattern to show variation)
    const ethPrice = price / 1.1; // Approximately based on WPOL price
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
  
  // Special handling for tokens with GeckoTerminal embed - don't show loading state since we're using the iframe
  if (!usesGeckoEmbed) {
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
        ? `${value.toFixed(2)} WPOL`
        : `${value.toFixed(8)} WPOL`;
    }
  };
  
  // Special styling for tokens with GeckoTerminal embed vs. standard chart for other tokens
  if (usesGeckoEmbed) {
    return (
      // Minimal card for X23 with GeckoTerminal embed - full width, no padding
      <Card className={`chart-container ${theme === 'dark' 
        ? "bg-[color:var(--color-black)] text-white" 
        : "bg-white"} border-0 shadow-none`
      }>
        <CardHeader className="pb-0 px-0">
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-2 items-center">
                <h3 className="text-lg font-semibold mr-2">Chart</h3>
                <div className={`flex items-center h-8 rounded-md px-1 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  {["24h", "7d", "30d", "90d", "1y"].map((period) => (
                    <button 
                      key={period}
                      onClick={() => setTimeframe(period as TimeFrame)} 
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        timeframe === period 
                          ? "text-[#3366FF] font-semibold" 
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {period.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className={`flex items-center h-8 rounded-md px-1 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  <button 
                    onClick={() => setChartType("PRICE")} 
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      chartType === "PRICE" 
                        ? "text-[#3366FF] font-semibold" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Price
                  </button>
                  <span className="text-gray-500">/</span>
                  <button 
                    onClick={() => setChartType("MCAP")} 
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      chartType === "MCAP" 
                        ? "text-[#3366FF] font-semibold" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    MCap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* GeckoTerminal iframe embed for tokens with real-time data */}
          <div className="h-[600px] w-full rounded-md overflow-hidden">
            <iframe 
              height="100%" 
              width="100%" 
              id="geckoterminal-embed" 
              title="GeckoTerminal Embed" 
              src={geckoTerminalUrl}
              frameBorder="0" 
              allow="clipboard-write" 
              allowFullScreen
              className="border-0"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    // Standard card for other tokens with our custom chart
    return (
      <Card className={`chart-container ${theme === 'dark' 
        ? "bg-[color:var(--color-black)] text-white border-none" 
        : "bg-white border-[color:var(--color-gray-200)]"}`
      }>
        <CardHeader className="pb-2">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 items-center">
                <div className={`flex items-center h-8 rounded-md px-1 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  {["24h", "7d", "30d", "90d", "1y"].map((period) => (
                    <button 
                      key={period}
                      onClick={() => setTimeframe(period as TimeFrame)} 
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        timeframe === period 
                          ? "text-[#3366FF] font-semibold" 
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {period.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className={`flex items-center h-8 rounded-md px-1 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  <button 
                    onClick={() => setChartType("PRICE")} 
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      chartType === "PRICE" 
                        ? "text-[#3366FF] font-semibold" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Price
                  </button>
                  <span className="text-gray-500">/</span>
                  <button 
                    onClick={() => setChartType("MCAP")} 
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      chartType === "MCAP" 
                        ? "text-[#3366FF] font-semibold" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    MCap
                  </button>
                </div>
                
                <div className={`flex items-center h-8 rounded-md px-1 ${theme === 'dark' 
                  ? 'bg-[color:var(--color-black-300)]' 
                  : 'bg-[color:var(--color-gray-200)]'}`
                }>
                  <button 
                    onClick={() => setPricePair("USD")} 
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      pricePair === "USD" 
                        ? "text-[#3366FF] font-semibold" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    USD
                  </button>
                  <span className="text-gray-500">/</span>
                  <button 
                    onClick={() => setPricePair("ETH")} 
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      pricePair === "ETH" 
                        ? "text-[#3366FF] font-semibold" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    WPOL
                  </button>
                </div>
              </div>
            </div>
            
            {/* Price details line */}
            <div className={`border-t pt-2 ${theme === 'dark' 
              ? 'border-[color:var(--color-black-200)]' 
              : 'border-[color:var(--color-gray-200)]'}`
            }>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-[#3366FF] font-mono text-xl">
                    {pricePair === "USD" 
                      ? `$${chartData[chartData.length - 1]?.price.toFixed(2)}` 
                      : `${chartData[chartData.length - 1]?.ethPrice.toFixed(8)}`}
                  </span>
                  {chartData.length > 1 && (() => {
                    // Calculate actual price change from first to last point
                    const firstValue = chartData[0][dataKey] as number;
                    const lastValue = chartData[chartData.length - 1][dataKey] as number;
                    
                    // Only calculate and display if both values are valid numbers
                    if (firstValue && lastValue && !isNaN(firstValue) && !isNaN(lastValue)) {
                      const changeValue = lastValue - firstValue;
                      const changePercent = firstValue !== 0 ? (changeValue / firstValue) * 100 : 0;
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
                    }
                    return null;
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
          {/* Original chart for other tokens */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3366FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
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
                  stroke="#3366FF" 
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  strokeWidth={0}
                />
                {/* Main price line */}
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke="#3366FF" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ 
                    r: 5, 
                    stroke: '#3366FF', 
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
}