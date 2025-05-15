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

  // Calculate total portfolio stats from holdings
  const totalSpent = tokenHoldings?.reduce((total, holding) => total + Number(holding.investmentAmount || 0), 0) || 0;
  const projectsCount = new Set(tokenHoldings?.map(h => h.projectId)).size || 0;
  
  // Calculate total points from transactions and user.points (which is more reliable)
  const totalPoints = user?.points || transactions?.reduce((total, tx) => total + (tx.amount || 0), 0) || 0;
  
  // Organize token holdings by project 
  const holdingsByProject = tokenHoldings?.reduce((acc, holding) => {
    const projectId = holding.projectId;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(holding);
    return acc;
  }, {} as Record<number, typeof tokenHoldings>) || {};
  
  // Handle token claiming
  const handleClaimTokens = async (holdingId: number) => {
    try {
      // API call to claim tokens would go here
      // const res = await fetch(`/api/wallet/claim/${holdingId}`, { method: 'POST' });
      
      // For now, just show a success message
      toast({
        title: "Tokens claimed successfully!",
        description: "Your tokens have been transferred to your wallet.",
        variant: "default",
      });
      
      // Update the cache - in a real app this would happen via the API response
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/holdings'] });
    } catch (error) {
      toast({
        title: "Failed to claim tokens",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Handle claiming all available tokens
  const handleClaimAllTokens = async () => {
    try {
      // API call to claim all tokens would go here
      // const res = await fetch('/api/wallet/claim-all', { method: 'POST' });
      
      // For now, just show a success message
      toast({
        title: "All available tokens claimed!",
        description: "Your tokens have been transferred to your wallet.",
        variant: "default",
      });
      
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/holdings'] });
    } catch (error) {
      toast({
        title: "Failed to claim tokens",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-black)] text-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-6xl font-['Tusker_Grotesk'] font-bold mb-4 text-white">YOUR PORTFOLIO</h1>
          <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] max-w-2xl">
            Track your holdings and token unlocks
          </p>
        </div>
        
        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </>
        ) : (
          <>
            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#333333] border border-[#444444] rounded-lg p-6">
                <h3 className="text-sm font-['IBM_Plex_Mono'] text-gray-400 mb-2">TOTAL SPENT</h3>
                <p className="text-3xl font-['IBM_Plex_Mono'] font-semibold text-white">${totalSpent.toLocaleString()}</p>
              </div>
              
              <div className="bg-[#333333] border border-[#444444] rounded-lg p-6">
                <h3 className="text-sm font-['IBM_Plex_Mono'] text-gray-400 mb-2">PROJECTS FUNDED</h3>
                <p className="text-3xl font-['IBM_Plex_Mono'] font-semibold text-white">{projectsCount}</p>
              </div>
              
              <div className="bg-[#333333] border border-[#444444] rounded-lg p-6">
                <h3 className="text-sm font-['IBM_Plex_Mono'] text-gray-400 mb-2">Q/ACC POINTS</h3>
                <p className="text-3xl font-['IBM_Plex_Mono'] font-semibold text-white">{Number.isFinite(totalPoints) ? Math.round(totalPoints).toLocaleString() : 0}</p>
              </div>
            </div>
            
            {/* Holdings Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-['Tusker_Grotesk'] font-bold text-white">YOUR HOLDINGS</h2>
                <Button 
                  onClick={handleClaimAllTokens}
                  disabled={!tokenHoldings || tokenHoldings.length === 0} 
                  className="bg-[#FBBA80] hover:bg-[#E89E61] text-black font-['IBM_Plex_Mono'] text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Claim All Tokens
                </Button>
              </div>
              
              {tokenHoldings && tokenHoldings.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(holdingsByProject).map(([projectIdStr, holdings]) => {
                    const projectId = parseInt(projectIdStr);
                    const project = projects?.find(p => p.id === projectId);
                    
                    if (!project) return null;
                    
                    const totalTokenAmount = holdings.reduce((total, h) => total + parseFloat(String(h.tokenAmount || 0)), 0);
                    const totalValue = totalTokenAmount * (project.price || 0);
                    const totalSpentOnProject = holdings.reduce((total, h) => total + parseFloat(String(h.investmentAmount || 0)), 0);
                    
                    return (
                      <div key={projectId} className="bg-[#333333] border border-[#444444] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <ProjectAvatar 
                              name={project.name} 
                              tokenSymbol={project.tokenSymbol} 
                              bgColor="bg-[#444444]"
                              textColor="text-white"
                              size="md"
                            />
                            <div>
                              <h3 className="text-lg font-['Tusker_Grotesk'] font-bold text-white">{project.name}</h3>
                              <p className="text-sm font-['IBM_Plex_Mono'] text-gray-400">{totalTokenAmount.toLocaleString()} {project.tokenSymbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-['IBM_Plex_Mono'] font-bold text-white">${totalValue.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 font-['IBM_Plex_Mono']">Spent: ${totalSpentOnProject.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left mt-4">
                            <thead>
                              <tr className="border-b border-[#444444] text-xs font-['IBM_Plex_Mono'] text-gray-400">
                                <th className="py-2 pr-6">Purchase Date</th>
                                <th className="py-2 pr-6">Amount</th>
                                <th className="py-2 pr-6">Spent</th>
                                <th className="py-2 pr-6">Unlock Date</th>
                                <th className="py-2 pr-0 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {holdings.map((holding) => {
                                const isUnlocked = new Date() > new Date(holding.unlockDate || "");
                                return (
                                  <tr key={holding.id} className="text-sm border-b border-[#444444] last:border-0">
                                    <td className="py-2 pr-6 font-['IBM_Plex_Mono']">
                                      {formatDate(new Date(holding.purchaseDate))}
                                    </td>
                                    <td className="py-2 pr-6 font-['IBM_Plex_Mono']">
                                      {parseFloat(String(holding.tokenAmount || 0)).toLocaleString()} {project.tokenSymbol}
                                    </td>
                                    <td className="py-2 pr-6 font-['IBM_Plex_Mono']">
                                      ${parseFloat(String(holding.investmentAmount || 0)).toLocaleString()}
                                    </td>
                                    <td className="py-2 pr-6 font-['IBM_Plex_Mono']">
                                      {holding.unlockDate ? formatDate(new Date(holding.unlockDate)) : 'N/A'}
                                    </td>
                                    <td className="py-2 pr-0 text-right">
                                      {isUnlocked && !holding.isLocked ? (
                                        <Button 
                                          onClick={() => handleClaimTokens(holding.id)}
                                          variant="default"
                                          size="sm"
                                          className="bg-[#FBBA80] hover:bg-[#E89E61] text-black font-['IBM_Plex_Mono'] text-xs"
                                        >
                                          <LockOpen className="mr-1 h-3 w-3" />
                                          Claim
                                        </Button>
                                      ) : isUnlocked ? (
                                        <Button 
                                          disabled
                                          variant="outline"
                                          size="sm"
                                          className="font-['IBM_Plex_Mono'] text-xs opacity-50"
                                        >
                                          <Check className="mr-1 h-3 w-3" />
                                          Claimed
                                        </Button>
                                      ) : (
                                        <Button 
                                          disabled
                                          variant="outline"
                                          size="sm"
                                          className="font-['IBM_Plex_Mono'] text-xs opacity-50"
                                        >
                                          <Calendar className="mr-1 h-3 w-3" />
                                          Locked
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#333333] border border-[#444444] rounded-lg p-10 text-center">
                  <p className="text-gray-400 font-['IBM_Plex_Mono'] mb-6">You haven't backed any projects yet</p>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <Link href="/" className="block">
                      <Button className="w-full py-4 bg-[#FBBA80] hover:bg-[#E89E61] text-black font-['IBM_Plex_Mono']">
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}