import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useQuery } from "@tanstack/react-query";
import type { PriceHistory } from "@shared/schema";

interface PriceChartProps {
  projectId: number;
}

type TimeFrame = "24h" | "7d" | "30d" | "90d" | "1y";

export function PriceChart({ projectId }: PriceChartProps) {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>("24h");
  
  // Fetch price history data from API
  const { data: priceHistory, isLoading, isError } = useQuery<PriceHistory[]>({
    queryKey: [`/api/projects/${projectId}/price-history`, timeframe],
    queryFn: () => fetch(`/api/projects/${projectId}/price-history?timeframe=${timeframe}`).then(res => res.json()),
    enabled: !!projectId,
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
        <CardHeader>
          <h3 className="text-lg font-semibold dark:text-white">Price History</h3>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <p className="text-muted-foreground dark:text-gray-400">Loading price data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state or empty state
  if (isError || !priceHistory || priceHistory.length === 0) {
    return (
      <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
        <CardHeader>
          <h3 className="text-lg font-semibold dark:text-white">Price History</h3>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[200px]">
            <p className="text-muted-foreground dark:text-gray-400">
              {isError 
                ? "Error loading price data" 
                : "No price data available for this token"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Main chart visualization is now handled directly in project-detail.tsx
  // This component is just a simplified version for the tabs section
  return (
    <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">Price History</h3>
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
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            A GeckoTerminal chart for this token is available at the top of this page.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latest price: {priceHistory[0]?.price ? `$${typeof priceHistory[0].price === 'string' ? parseFloat(priceHistory[0].price).toFixed(4) : priceHistory[0].price.toFixed(4)}` : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}