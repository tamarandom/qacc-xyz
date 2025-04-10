import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletTransaction } from "@shared/schema";
import { ArrowDownRight, ArrowUpRight, CalendarClock } from "lucide-react";

export function TransactionHistory() {
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  return (
    <Card className="border border-[color:var(--border-color)]">
      <CardHeader className="pb-3">
        <CardTitle className="font-['Tusker_Grotesk'] text-2xl font-bold">TRANSACTION HISTORY</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-[color:var(--border-color)]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[color:var(--text-secondary)]">
            <p>Error loading transaction history. Please try again later.</p>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 border-b border-[color:var(--border-color)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center 
                    ${tx.type === 'purchase' 
                      ? 'bg-[#FFE0C7] text-[#E67E22]' 
                      : 'bg-[#D5F5E3] text-[#27AE60]'
                    }`}
                  >
                    {tx.type === 'purchase' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-[color:var(--text-primary)]">
                      {tx.description}
                    </div>
                    <div className="text-xs text-[color:var(--text-secondary)] flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-medium ${
                  tx.type === 'purchase' 
                    ? 'text-[#E67E22]' 
                    : 'text-[#27AE60]'
                }`}>
                  {tx.type === 'purchase' ? '-' : '+'}{formatCurrency(parseFloat(tx.amount))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[color:var(--text-secondary)]">
            <p className="font-['IBM_Plex_Mono'] mb-2">No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here when you make purchases.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}