import { WalletBalance } from "@/components/wallet/wallet-balance";
import { TokenHoldings } from "@/components/wallet/token-holdings";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { UserProfileInfo } from "@/components/profile/user-profile-info";
import { UserPoints } from "@/components/profile/user-points";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";

export default function WalletPage() {
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>My Profile | q/acc - Quadratic Accelerator</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-['Tusker_Grotesk'] text-4xl md:text-5xl font-bold text-[color:var(--text-primary)]">
            MY PROFILE
          </h1>
          <p className="text-[color:var(--text-secondary)] mt-2 font-['IBM_Plex_Mono']">
            Manage your account, token holdings, and points
          </p>
        </div>
        
        <div className="mb-6">
          <UserProfileInfo />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <WalletBalance />
          </div>
          <div>
            <UserPoints />
          </div>
        </div>
        
        <Tabs defaultValue="holdings" className="mb-6">
          <TabsList className="mb-4 bg-[color:var(--border-color)] p-1">
            <TabsTrigger 
              value="holdings"
              className="font-['IBM_Plex_Mono'] text-sm font-medium data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]"
            >
              TOKEN HOLDINGS
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="font-['IBM_Plex_Mono'] text-sm font-medium data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]"
            >
              TRANSACTIONS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="holdings" className="m-0">
            <TokenHoldings />
          </TabsContent>
          <TabsContent value="transactions" className="m-0">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}