import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Coins, ArrowUpRight, Check, LockOpen } from "lucide-react";
import { type Project, type User, type PointTransaction, type TokenHolding } from "@shared/schema";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";

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

interface PortfolioItem {
  transaction: PointTransaction;
  project: Project | undefined;
  unlock: TokenUnlock | undefined;
  allUnlocks: TokenUnlock[]; // All unlocks for this project
  totalTokenAmount: number; // Total tokens across all purchases
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
  
  // Convert the token holdings from database into the TokenUnlock structure
  const tokenUnlocks: TokenUnlock[] = tokenHoldings?.map(holding => {
    // Generate a unique ID for each holding using the database holding id
    const id = `${holding.id}-${holding.projectId}-${holding.roundId || 0}`;
    
    // Calculate cliff and end dates - assume 6 month cliff and 12 month vesting
    const purchaseDate = new Date(holding.purchaseDate || holding.createdAt);
    const cliffDate = new Date(purchaseDate);
    cliffDate.setMonth(cliffDate.getMonth() + 6);
    
    const endDate = new Date(purchaseDate);
    endDate.setMonth(endDate.getMonth() + 12);
    
    // Check if token is claimable based on current date vs cliff date
    const now = new Date();
    const claimable = !holding.isLocked && now >= cliffDate;
    
    return {
      projectId: holding.projectId,
      amount: Number(holding.tokenAmount),
      cliffDate,
      endDate,
      claimed: !holding.isLocked,
      claimable,
      id,
      round: holding.roundId,
      buyDate: purchaseDate,
      spent: Number(holding.investmentAmount)
    };
  }) || [];
  
  // Group transactions by project ID for reference
  const transactionsByProject = transactions?.reduce<Record<number, PointTransaction[]>>((acc, transaction) => {
    if (!acc[transaction.projectId]) {
      acc[transaction.projectId] = [];
    }
    acc[transaction.projectId].push(transaction);
    return acc;
  }, {}) || {};
  
  // Filter out unlocks for projects 9, 11, and 12
  const filteredUnlocks = tokenUnlocks?.filter(unlock => 
    unlock.projectId !== 9 && unlock.projectId !== 11 && unlock.projectId !== 12
  ) || [];
  
  // Create a unified list of portfolio items with projects and their unlocks
  const portfolioItems: PortfolioItem[] = [];
  
  // For each project, create a single portfolio item with all its unlocks
  Object.entries(transactionsByProject).forEach(([projectIdStr, transactions]) => {
    const projectId = parseInt(projectIdStr);
    
    // Skip Project #0 to remove it from portfolio display
    // Also skip Projects #9, #11, and #12 as requested
    if (projectId === 0 || projectId === 9 || projectId === 11 || projectId === 12) {
      return;
    }
    
    const project = projects?.find(p => p.id === projectId);
    
    // Only proceed if we have a valid project
    if (!project) {
      return;
    }
    
    // Find all unlocks for this project from filtered unlocks
    const unlocks = filteredUnlocks.filter((t: TokenUnlock) => t.projectId === projectId);
    
    // Calculate total token amount across all transactions for this project
    const totalTokens = unlocks.reduce((sum, unlock) => sum + unlock.amount, 0);
    
    // Calculate total spent across all transactions for this project
    const totalSpent = unlocks.reduce((sum, unlock) => sum + (unlock.spent || 0), 0);
    
    // Use the most recent transaction data as a base, but override with calculated totals
    const latestTransaction = {
      ...transactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0],
      // Override with total values
      amount: totalSpent,
      tokenAmount: totalTokens
    };
    
    // For this project, create one item with the aggregated transaction data and all unlocks
    portfolioItems.push({
      transaction: latestTransaction,
      project,
      unlock: unlocks.length > 0 ? unlocks[0] : undefined,
      allUnlocks: unlocks,
      totalTokenAmount: totalTokens
    });
  });
  
  // Calculate totals
  const totalUsdSpent = portfolioItems?.reduce((total, item) => {
    return total + (item.transaction.amount || 0);
  }, 0) || 0;
  
  const projectsCount = new Set(portfolioItems?.map(item => item.transaction.projectId)).size || 0;
  
  // Check if there are any tokens available to claim
  const hasClaimableTokens = filteredUnlocks.some((t: TokenUnlock) => t.claimable && !t.claimed);
  
  // Get user points from the authenticated user
  const userPoints = user?.points || 0;
  
  // Handle claiming tokens for a specific unlock
  const handleClaimTokens = async (tokenId: string) => {
    const unlock = filteredUnlocks.find((t: TokenUnlock) => t.id === tokenId);
    if (!unlock?.claimable) return;
    
    // Extract the database ID from the tokenId (which is now in format holdingId-projectId-roundId)
    const [holdingId, projectId, roundId] = tokenId.split('-');
    
    try {
      // We can directly use the holdingId from the token ID
      // No need to find the holding from the list since we already have its ID
      
      // Call the API to claim this token
      const response = await fetch(`/api/wallet/claim-token/${holdingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim token');
      }
      
      const responseData = await response.json();
      
      // Update local state to show the token as claimed
      setClaimedTokens(prev => ({
        ...prev,
        [tokenId]: true
      }));
      
      // Get project details for the toast
      const project = projects?.find(p => p.id === unlock.projectId);
      const roundInfo = unlock.round ? ` (Round ${unlock.round})` : '';
      
      // Show success message
      toast({
        title: "Tokens Claimed!",
        description: responseData.message || `Successfully claimed tokens for ${project?.name || `Project #${unlock.projectId}`}${roundInfo}`,
      });
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      
    } catch (error) {
      console.error('Error claiming token:', error);
      toast({
        title: "Error Claiming Token",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle claiming all available tokens
  const handleClaimAllTokens = async () => {
    const claimableTokens = filteredUnlocks
      .filter((t: TokenUnlock) => t.claimable && !t.claimed);
      
    if (claimableTokens.length === 0) return;
    
    try {
      // Call the API to claim all tokens
      const response = await fetch('/api/wallet/claim-all-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim tokens');
      }
      
      const responseData = await response.json();
      
      // Update local state to show all tokens as claimed
      const newClaimedTokens = { ...claimedTokens };
      claimableTokens.forEach((unlock: TokenUnlock) => {
        newClaimedTokens[unlock.id] = true;
      });
      
      setClaimedTokens(newClaimedTokens);
      
      // Show success message
      toast({
        title: "All Tokens Claimed!",
        description: responseData.message || `Successfully claimed tokens for ${claimableTokens.length} token unlocks`,
      });
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      
    } catch (error) {
      console.error('Error claiming all tokens:', error);
      toast({
        title: "Error Claiming Tokens",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Format dates helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-black)] text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-2 text-white">Your Portfolio</h1>
          <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] mb-6">Track your holdings and token unlocks</p>
        </div>
        
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[color:var(--color-black-200)] rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">TOTAL SPENT</h3>
            <div className="text-3xl font-bold text-white">
              {isLoading ? <Skeleton className="h-8 w-24 bg-gray-700" /> : formatCurrency(totalUsdSpent, true)}
            </div>
          </div>
          
          <div className="bg-[color:var(--color-black-200)] rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">PROJECTS FUNDED</h3>
            <div className="text-3xl font-bold text-white">
              {isLoading ? <Skeleton className="h-8 w-16 bg-gray-700" /> : projectsCount}
            </div>
          </div>
          
          <div className="bg-[color:var(--color-black-200)] rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">Q/ACC POINTS</h3>
            <div className="text-3xl font-bold text-white">
              {isLoading ? <Skeleton className="h-8 w-24 bg-gray-700" /> : formatNumber(user?.points || 0)}
            </div>
          </div>
        </div>
        
        {/* Projects List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-['Tusker_Grotesk'] font-bold text-white">Your Holdings</h2>
            
            <Button 
              onClick={handleClaimAllTokens}
              disabled={!hasClaimableTokens || isLoading}
              className={`font-['IBM_Plex_Mono'] text-sm font-medium ${!hasClaimableTokens ? 'opacity-50 cursor-not-allowed' : ''}`}
              variant="default"
            >
              <LockOpen className="mr-2 h-4 w-4" />
              Claim All Tokens
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-[color:var(--color-black-200)] rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-10 w-10 rounded-md mr-4 bg-gray-700" />
                    <Skeleton className="h-6 w-32 bg-gray-700" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-16 w-full bg-gray-700" />
                    <Skeleton className="h-16 w-full bg-gray-700" />
                    <Skeleton className="h-16 w-full bg-gray-700" />
                    <Skeleton className="h-16 w-full bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolioItems?.length === 0 ? (
            <div className="bg-[color:var(--color-black-200)] rounded-lg p-6 border border-gray-800 text-center">
              <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono']">
                You don't have any holdings yet. Explore projects to get started!
              </p>
              <Link href="/" className="inline-block mt-4 text-[color:var(--color-peach)] hover:underline font-['IBM_Plex_Mono'] font-medium">
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolioItems?.map((item, index) => (
                <div key={index} className="bg-[color:var(--color-black-200)] rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {item.project ? (
                        <>
                          <ProjectAvatar 
                            name={item.project.name} 
                            bgColor={item.project.avatarBg || "bg-primary-100"}
                            textColor={item.project.avatarColor || item.project.avatarText || "white"}
                            size="md"
                            className="mr-4"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-white font-['IBM_Plex_Mono']">
                              {item.project.name}
                            </h3>
                            <p className="text-sm text-[color:var(--color-gray)] font-['IBM_Plex_Mono']">
                              {item.project.tokenSymbol}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-[color:var(--color-light-gray)] mr-4"></div>
                          <div>
                            <h3 className="text-lg font-bold text-white font-['IBM_Plex_Mono']">
                              Project #{item.transaction.projectId}
                            </h3>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/projects/${item.transaction.projectId}`} className="text-[color:var(--color-peach)] hover:underline flex items-center">
                      <span className="mr-1 font-['IBM_Plex_Mono'] text-sm">View Project</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                  
                  {/* Summary row with totals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Briefcase size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">TOTAL SPENT</span>
                      </div>
                      <p className="font-bold text-lg text-white">
                        {formatCurrency(item.transaction.amount, true)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Coins size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">TOTAL TOKENS</span>
                      </div>
                      <p className="font-bold text-lg text-white">
                        {item.transaction.tokenAmount} {item.project?.tokenSymbol || "tokens"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Multiple token unlock rows */}
                  {item.allUnlocks && item.allUnlocks.length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <h4 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-3">TOKEN UNLOCKS</h4>
                      
                      <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">BUY DATE</th>
                              <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">SPENT</th>
                              <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal"># TOKENS</th>
                              <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">CLIFF DATE</th>
                              <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">END DATE</th>
                              <th className="text-right pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.allUnlocks.map((unlock, unlockIndex) => (
                              <tr key={`${item.project?.id || 'project'}-${unlock.id}-${unlockIndex}`} className="border-b border-gray-700 last:border-b-0">
                                <td className="py-2 pl-0 text-white">
                                  {unlock.buyDate ? formatDate(unlock.buyDate) : 'N/A'}
                                </td>
                                <td className="py-2 text-white">
                                  {unlock.spent ? formatCurrency(unlock.spent, true) : 'N/A'}
                                </td>
                                <td className="py-2 text-white">
                                  {unlock.amount}
                                </td>
                                <td className="py-2 text-white">
                                  {formatDate(unlock.cliffDate)}
                                </td>
                                <td className="py-2 text-white">
                                  {formatDate(unlock.endDate)}
                                </td>
                                <td className="py-2 pr-0 text-right">
                                  {unlock.claimed ? (
                                    <Button 
                                      disabled
                                      variant="outline"
                                      size="sm"
                                      className="font-['IBM_Plex_Mono'] text-xs opacity-50"
                                    >
                                      <Check className="mr-1 h-3 w-3" />
                                      Claimed
                                    </Button>
                                  ) : unlock.claimable ? (
                                    <Button 
                                      onClick={() => handleClaimTokens(unlock.id)}
                                      variant="default"
                                      size="sm"
                                      className="font-['IBM_Plex_Mono'] text-xs"
                                    >
                                      <LockOpen className="mr-1 h-3 w-3" />
                                      Claim
                                    </Button>
                                  ) : (
                                    <Button 
                                      disabled
                                      variant="outline"
                                      size="sm"
                                      className="font-['IBM_Plex_Mono'] text-xs opacity-50"
                                    >
                                      <Calendar className="mr-1 h-3 w-3" />
                                      Not Claimable
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}