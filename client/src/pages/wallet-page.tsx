import { WalletBalance } from "@/components/wallet/wallet-balance";
import { TokenHoldings } from "@/components/wallet/token-holdings";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { Helmet } from "react-helmet-async";

export default function WalletPage() {
  return (
    <>
      <Helmet>
        <title>My Wallet | q/acc - Quadratic Accelerator</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Tusker_Grotesk'] text-4xl md:text-5xl font-bold text-[color:var(--text-primary)]">
            MY WALLET
          </h1>
          <p className="text-[color:var(--text-secondary)] mt-2 font-['IBM_Plex_Mono']">
            Manage your funds and token holdings
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WalletBalance />
          </div>
          <div className="lg:col-span-2">
            <TokenHoldings />
          </div>
        </div>
        
        <div className="mt-6">
          <TransactionHistory />
        </div>
      </div>
    </>
  );
}