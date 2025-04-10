import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { WalletTransaction } from "@shared/schema";
import { formatCurrency } from "@/lib/formatters";
import { 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Loader2 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function WalletBalance() {
  const { user } = useAuth();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/wallet/transactions"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Please log in to view your wallet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
        <CardDescription>Your available USDT for purchasing project tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">Available</div>
            <div className="text-3xl font-bold">
              {formatCurrency(parseFloat(user.walletBalance || "0"), "USD")}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Recent Transactions</div>
            {isLoadingTransactions ? (
              <div className="flex h-[150px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="flex h-[150px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">No transactions yet</div>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        {tx.type === "purchase" ? (
                          <ArrowUpCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-green-500" />
                        )}
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">{tx.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "font-medium",
                        tx.type === "purchase" ? "text-red-500" : "text-green-500"
                      )}>
                        {tx.type === "purchase" ? "-" : "+"}
                        {formatCurrency(parseFloat(tx.amount), "USD")}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}