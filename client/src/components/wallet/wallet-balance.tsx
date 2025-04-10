import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { WalletTransaction } from "@shared/schema";
import { formatCurrency } from "@/lib/formatters";
import { 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Loader2,
  Wallet 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function WalletBalance() {
  const { user } = useAuth();

  // Get wallet balance specifically from the API to ensure it's up-to-date
  const { data: walletData, isLoading: isLoadingBalance } = useQuery<{ balance: string }>({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
  });

  // Get transaction history
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/wallet/transactions"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Wallet
          </CardTitle>
          <CardDescription>Please log in to view your wallet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Use the balance from the API if available, otherwise fall back to user object
  const balance = walletData?.balance || user.walletBalance || "0";
  
  return (
    <Card className="h-full border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center font-bold">
            <Wallet className="mr-2 h-5 w-5" />
            Wallet Balance
          </CardTitle>
          <Badge variant="outline" className="bg-black text-white px-3 py-1 font-['IBM_Plex_Mono'] text-xs">
            USDT
          </Badge>
        </div>
        <CardDescription>Your available USDT for purchasing project tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg">
            <div className="text-muted-foreground text-sm mb-1">Available</div>
            {isLoadingBalance ? (
              <div className="h-8 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="text-3xl font-bold font-['IBM_Plex_Mono']">
                {formatCurrency(parseFloat(balance))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Recent Transactions</div>
              {transactions && transactions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                </Badge>
              )}
            </div>
            
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
                    <div key={tx.id} className="flex items-center justify-between rounded-md border border-border/60 p-3 bg-black/10">
                      <div className="flex items-center gap-3">
                        {tx.type === "purchase" ? (
                          <ArrowUpCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-green-500" />
                        )}
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium font-['IBM_Plex_Mono']">{tx.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "font-medium font-['IBM_Plex_Mono']",
                        tx.type === "purchase" ? "text-red-500" : "text-green-500"
                      )}>
                        {tx.type === "purchase" ? "-" : "+"}
                        {formatCurrency(parseFloat(tx.amount))}
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