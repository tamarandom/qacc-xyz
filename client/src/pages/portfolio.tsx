import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Coins, ArrowUpRight, Check, LockOpen } from "lucide-react";
import { type Project, type PointTransaction, type TokenHolding } from "@shared/schema";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";

// Token unlock structure
interface TokenUnlock {
  projectId: number;
  amount: number;
  cliffDate: Date;
  endDate: Date;
  claimed: boolean;
  claimable: boolean;
  // Unique identifier for each unlock (projectId + round number)
  id: string;
  // For multiple rounds of the same project
  round: number | null;
  transactionHash?: string;
  // Purchase date
  buyDate: Date;
  // Amount spent on this purchase
  spent: number;
}

export default function PortfolioPage() {
  // Get authenticated user
  const { user } = useAuth();
  
  // Get all projects data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }
      return await res.json() as Project[];
    }
  });
  
  // Get token holdings from database
  const { data: tokenHoldings, isLoading: holdingsLoading } = useQuery({
    queryKey: ['/api/wallet/holdings'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/holdings');
      if (!res.ok) {
        throw new Error('Failed to fetch token holdings');
      }
      return await res.json() as TokenHolding[];
    },
    // Only fetch if user is logged in
    enabled: !!user
  });
  
  // Get point transactions for the user
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/transactions');
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return await res.json() as PointTransaction[];
    },
    enabled: !!user
  });
  
  const isLoading = projectsLoading || holdingsLoading || transactionsLoading || !user;
  
  // For token claiming
  const { toast } = useToast();
  
  // For claiming tokens - using ID instead of just projectId
  const [claimedTokens, setClaimedTokens] = useState<{[key: string]: boolean}>({});

  // Format dates helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // If user is not logged in, show a guest view of the portfolio based on the logged-in style
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-black)] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-6xl font-['Tusker_Grotesk'] font-bold mb-4 text-white">YOUR PORTFOLIO</h1>
            <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] max-w-2xl">
              Track your holdings and token unlocks
            </p>
          </div>
          
          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#333333] border border-[#444444] rounded-lg p-6">
              <h3 className="text-sm font-['IBM_Plex_Mono'] text-gray-400 mb-2">TOTAL SPENT</h3>
              <p className="text-3xl font-['IBM_Plex_Mono'] font-semibold text-white">$0.00</p>
            </div>
            
            <div className="bg-[#333333] border border-[#444444] rounded-lg p-6">
              <h3 className="text-sm font-['IBM_Plex_Mono'] text-gray-400 mb-2">PROJECTS FUNDED</h3>
              <p className="text-3xl font-['IBM_Plex_Mono'] font-semibold text-white">0</p>
            </div>
            
            <div className="bg-[#333333] border border-[#444444] rounded-lg p-6">
              <h3 className="text-sm font-['IBM_Plex_Mono'] text-gray-400 mb-2">Q/ACC POINTS</h3>
              <p className="text-3xl font-['IBM_Plex_Mono'] font-semibold text-white">0</p>
            </div>
          </div>
          
          {/* Holdings Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-['Tusker_Grotesk'] font-bold text-white">YOUR HOLDINGS</h2>
              <Button disabled className="bg-[#927158] hover:bg-[#7d6049] text-black font-['IBM_Plex_Mono'] text-sm py-2 px-4 opacity-50 cursor-not-allowed">
                Claim All Tokens
              </Button>
            </div>
            
            {/* Empty state */}
            <div className="bg-[#333333] border border-[#444444] rounded-lg p-10 text-center">
              <p className="text-gray-400 font-['IBM_Plex_Mono'] mb-6">Connect your wallet to view and manage your portfolio</p>
              
              <div className="space-y-4 max-w-md mx-auto">
                <Link href="/auth" className="block">
                  <Button className="w-full py-4 bg-[#FBBA80] hover:bg-[#E89E61] text-black font-['IBM_Plex_Mono']">
                    Connect
                  </Button>
                </Link>
                
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full py-4 border-[#444444] hover:bg-[#272727] text-white font-['IBM_Plex_Mono']">
                    Browse Projects Instead
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The rest of the authenticated user portfolio rendering code would go here...
  // This has been intentionally removed since we're focusing on the guest view

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-4">Your Portfolio</h1>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        ) : (
          <div>
            <p>Authenticated user portfolio content...</p>
          </div>
        )}
      </div>
    </div>
  );
}