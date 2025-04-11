import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

export function WalletBalanceIndicator() {
  const { data: balance, isLoading } = useQuery<{ balance: string }>({
    queryKey: ['/api/wallet/balance'],
    // Only fetch if user is authenticated
    enabled: !!document.cookie.includes('connect.sid'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1.5">
        <Wallet className="h-3.5 w-3.5 text-[color:var(--text-secondary)]" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1.5">
      <Wallet className="h-3.5 w-3.5 text-[color:var(--text-secondary)]" />
      <span className="font-['IBM_Plex_Mono'] text-xs font-medium text-[color:var(--text-secondary)]">
        {formatCurrency(parseFloat(balance.balance))}
      </span>
    </div>
  );
}