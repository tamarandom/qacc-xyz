import { WalletBalance } from "@/components/wallet/wallet-balance";
import { TokenHoldings } from "@/components/wallet/token-holdings";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function WalletPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Wallet | q/acc Protocol</title>
      </Helmet>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col space-y-4">
            <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-2">Wallet</h1>
            <p className="text-muted-foreground font-['IBM_Plex_Mono'] mb-6">
              Manage your USDT balance and token holdings
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WalletBalance />
              <TokenHoldings />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}