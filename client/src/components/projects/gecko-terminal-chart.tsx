import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { BarChart, ExternalLink } from "lucide-react";

interface GeckoTerminalChartProps {
  projectId: number;
  tokenSymbol: string;
  poolAddress?: string;
}

// Pool address mapping for launched tokens
const POOL_ADDRESSES: Record<string, string> = {
  "X23": "0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838", 
  "CTZN": "0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8",
  "PRSM": "0x4dc15edc968eceaec3a5e0f12d0acecacee05e25",
  "GRNDT": "0x460a8186aa4574c18709d1eff118efdaa5235c19"
};

export function GeckoTerminalChart({ projectId, tokenSymbol }: GeckoTerminalChartProps) {
  const poolAddress = POOL_ADDRESSES[tokenSymbol] || null;
  const geckoTerminalUrl = poolAddress ? `https://www.geckoterminal.com/polygon_pos/pools/${poolAddress}` : null;

  // Fetch price history from our backend API
  const { data: priceHistory, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}/price-history`, '1d'],
    enabled: !!projectId,
  });

  if (!poolAddress) {
    return (
      <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-[400px]">
            <p className="text-muted-foreground dark:text-gray-400">Chart data not available for this token</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Price Chart ({tokenSymbol})</h3>
          {geckoTerminalUrl && (
            <a 
              href={geckoTerminalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[color:var(--color-peach)] hover:text-[color:var(--color-peach-dark)] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on GeckoTerminal</span>
            </a>
          )}
        </div>
        
        <div className="h-[350px] w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <p className="text-red-500 dark:text-red-400 mb-2">Error loading chart data</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please visit{" "}
                  <a 
                    href={geckoTerminalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[color:var(--color-peach)] hover:underline"
                  >
                    GeckoTerminal
                  </a>{" "}
                  for the latest price information.
                </p>
              </div>
            </div>
          ) : priceHistory && priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={priceHistory}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBA80" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FBBA80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                  }}
                  stroke="#888"
                />
                <YAxis 
                  tickFormatter={(value) => `$${Number(value).toFixed(4)}`}
                  stroke="#888"
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(Number(value))}`, 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#FBBA80" 
                  fillOpacity={1}
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <BarChart className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No chart data available yet.
                <br />
                <a 
                  href={geckoTerminalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-peach)] hover:underline mt-2 inline-block"
                >
                  View on GeckoTerminal
                </a>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}