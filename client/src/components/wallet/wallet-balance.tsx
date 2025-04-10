import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export function WalletBalance() {
  const {
    data: balanceData,
    isLoading,
    error,
  } = useQuery<{ balance: string }>({
    queryKey: ["/api/wallet/balance"],
  });

  return (
    <Card className="border border-[color:var(--border-color)]">
      <CardHeader className="pb-3">
        <CardTitle className="font-['Tusker_Grotesk'] text-2xl font-bold">WALLET BALANCE</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-md flex items-center justify-center bg-[color:var(--color-peach-200)] text-[color:var(--color-black)]">
            <Wallet className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--text-secondary)]">
              AVAILABLE BALANCE
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : error ? (
              <div className="text-3xl font-['Tusker_Grotesk'] font-bold text-[color:var(--text-primary)]">
                Error
              </div>
            ) : (
              <div className="text-3xl font-['Tusker_Grotesk'] font-bold text-[color:var(--text-primary)]">
                {formatCurrency(parseFloat(balanceData?.balance || "0"))}
              </div>
            )}
            <div className="text-xs text-[color:var(--text-secondary)] mt-1">
              Only for purchasing project tokens
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}