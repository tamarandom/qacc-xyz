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
  
  // If user is not logged in, show a guest view of the portfolio
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-black)] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-4 text-white">Portfolio</h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] max-w-2xl">
                Track your holdings, token unlocks, and manage your q/acc portfolio.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="py-2 px-4 text-sm text-white bg-transparent border border-[#2A323C] font-['IBM_Plex_Mono'] hover:bg-[#161B22]">
                  Link Staking
                </Button>
                <Button variant="outline" className="py-2 px-4 text-sm text-white bg-transparent border border-[#2A323C] font-['IBM_Plex_Mono'] hover:bg-[#161B22]">
                  Perps & Spot Transfer
                </Button>
                <Button variant="outline" className="py-2 px-4 text-sm text-white bg-transparent border border-[#2A323C] font-['IBM_Plex_Mono'] hover:bg-[#161B22]">
                  EVM & Core Transfer
                </Button>
                <Button variant="outline" className="py-2 px-4 text-sm text-white bg-transparent border border-[#2A323C] font-['IBM_Plex_Mono'] hover:bg-[#161B22]">
                  Send
                </Button>
                <Button variant="outline" className="py-2 px-4 text-sm text-white bg-transparent border border-[#2A323C] font-['IBM_Plex_Mono'] hover:bg-[#161B22]">
                  Withdraw
                </Button>
                <Button className="py-2 px-4 text-sm bg-[#0D806F] text-white font-['IBM_Plex_Mono'] hover:bg-[#0A6C5D] border-none">
                  Deposit
                </Button>
              </div>
            </div>
          </div>
          
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-[#101419] border border-[#2A323C] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-['Tusker_Grotesk'] font-bold">Account Value</h3>
                  <p className="text-3xl font-bold mt-2">$0</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-[#161B22] border border-[#2A323C] rounded text-sm py-1 px-3 text-white font-['IBM_Plex_Mono']">
                    <option>14 Day</option>
                    <option>30 Day</option>
                    <option>90 Day</option>
                  </select>
                </div>
              </div>
              
              {/* Empty chart area */}
              <div className="h-32 flex items-center justify-center border-t border-[#2A323C] pt-4">
                <svg width="100%" height="60" viewBox="0 0 400 60" className="text-[#2A323C]">
                  <line x1="0" y1="30" x2="400" y2="30" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            </div>
            
            <div className="bg-[#101419] border border-[#2A323C] rounded-lg p-6">
              <h3 className="text-white font-['IBM_Plex_Mono'] font-medium mb-4">USDT Balance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#91A0A1] font-['IBM_Plex_Mono'] text-sm">Total Balance</span>
                  <span className="text-white font-['IBM_Plex_Mono'] text-sm">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#91A0A1] font-['IBM_Plex_Mono'] text-sm">Available Balance</span>
                  <span className="text-white font-['IBM_Plex_Mono'] text-sm">$0.00</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab-like navigation row */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-3 border-b border-[#2A323C]">
            <div className="py-2 px-3 bg-[#161B22] text-white border border-[#2A323C] rounded font-['IBM_Plex_Mono'] text-sm">
              Balances
            </div>
            <div className="py-2 px-3 text-[#91A0A1] font-['IBM_Plex_Mono'] text-sm">
              Positions
            </div>
            <div className="py-2 px-3 text-[#91A0A1] font-['IBM_Plex_Mono'] text-sm">
              Open Orders
            </div>
            <div className="py-2 px-3 text-[#91A0A1] font-['IBM_Plex_Mono'] text-sm">
              Trade History
            </div>
            <div className="py-2 px-3 text-[#91A0A1] font-['IBM_Plex_Mono'] text-sm">
              Funding History
            </div>
          </div>
          
          {/* Tokens Table */}
          <div className="bg-[#101419] border border-[#2A323C] rounded-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#2A323C]">
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">Coin</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">Total Balance</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">Available Balance</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">USDT Value</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">PNL</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">Send</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">Transfer</th>
                    <th className="p-4 text-sm font-medium text-[#91A0A1] font-['IBM_Plex_Mono']">Contract</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center">
                      <div className="text-center px-4 py-8">
                        <p className="text-[#91A0A1] font-['IBM_Plex_Mono'] mb-4">No balances yet</p>
                        
                        <div className="space-y-4 max-w-md mx-auto">
                          <Link href="/auth" className="block">
                            <Button className="w-full py-4 bg-[color:var(--color-peach)] hover:bg-[color:var(--color-peach-darker)] text-black font-['IBM_Plex_Mono']">
                              Sign In to Access Portfolio
                            </Button>
                          </Link>
                          
                          <Link href="/" className="block">
                            <Button variant="outline" className="w-full py-4 border-[#2A323C] hover:bg-[#161B22] text-white font-['IBM_Plex_Mono']">
                              Browse Projects Instead
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Footer row */}
          <div className="flex justify-between items-center text-sm text-[#91A0A1] font-['IBM_Plex_Mono']">
            <div className="flex items-center space-x-3">
              <span>q/acc Portfolio</span>
              <span>•</span>
              <span>Version 1.0</span>
            </div>
            <div>
              <Button variant="ghost" size="sm" className="text-[#91A0A1] hover:text-white hover:bg-[#161B22]">
                Feedback
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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