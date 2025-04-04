import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";

interface GeckoTerminalChartProps {
  projectId: number;
  tokenSymbol: string;
  poolAddress?: string;
}

// Pool address mapping for launched tokens
const POOL_ADDRESSES: Record<string, string> = {
  "X23": "0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838",
  "CTZN": "0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8",
  "PRSM": "0x4dc15edc968eceaec3a5e0f12d0acecacee05e25", // Updated with correct address
  "GRNDT": "0x460a8186aa4574c18709d1eff118efdaa5235c19"
};

export function GeckoTerminalChart({ projectId, tokenSymbol }: GeckoTerminalChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poolAddress = POOL_ADDRESSES[tokenSymbol] || null;
  const geckoTerminalUrl = poolAddress ? `https://www.geckoterminal.com/polygon_pos/pools/${poolAddress}` : null;

  useEffect(() => {
    // Set a timeout to simulate loading and check if iframe loaded correctly
    const timer = setTimeout(() => {
      setIsLoading(false);
      // If poolAddress is null or invalid, show an error
      if (!poolAddress) {
        setError("Chart data not available for this token");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [poolAddress]);

  // Show iframe for all tokens with defined pool addresses
  const showIframe = poolAddress !== null;

  if (error || !showIframe) {
    return (
      <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
        <CardContent className="py-6">
          <div className="flex flex-col justify-center items-center h-[400px]">
            <p className="text-muted-foreground dark:text-gray-400 mb-4">
              {error || "Chart temporarily unavailable for this token"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white/80 dark:bg-black/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
          <p className="text-muted-foreground dark:text-gray-400">Loading chart data...</p>
        </div>
      )}
      
      {poolAddress && (
        <div className="w-full h-[400px]">
          <iframe
            src={`https://www.geckoterminal.com/polygon_pos/pools/${poolAddress}?embed=1&info=0&swaps=0&grayscale=1&light_chart=0&chart_type=price&resolution=1h`}
            title={`${tokenSymbol} Price Chart`}
            frameBorder="0"
            width="100%" 
            height="100%"
            onLoad={() => setIsLoading(false)}
            className="rounded-md"
            allow="clipboard-write"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}