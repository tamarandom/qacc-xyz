import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Coins, ArrowUpRight, Check, LockOpen } from "lucide-react";
import { type Project, type User, type PointTransaction } from "@shared/schema";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { useToast } from "@/hooks/use-toast";

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
  round?: number;
  transactionHash?: string;
  // Purchase date
  buyDate?: Date;
  // Amount spent on this purchase
  spent?: number;
}

interface PortfolioItem {
  transaction: PointTransaction;
  project: Project | undefined;
  unlock: TokenUnlock | undefined;
  allUnlocks: TokenUnlock[]; // All unlocks for this project
  totalTokenAmount: number; // Total tokens across all purchases
}

export default function PortfolioPage() {
  // In a real app, this would come from authentication
  const userId = 1; // Mock logged in user ID for cryptowhale
  
  // Get user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      return await res.json() as User & { transactions: PointTransaction[] };
    }
  });
  
  // Get all projects data to join with transactions
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
  
  const isLoading = userLoading || projectsLoading;
  
  // For token claiming
  const { toast } = useToast();
  
  // For claiming tokens - using ID instead of just projectId
  const [claimedTokens, setClaimedTokens] = useState<{[key: string]: boolean}>({});
  
  // Mock token unlock data - in a real app this would come from the API
  const tokenUnlocks: TokenUnlock[] = [
    // Project #1, Round 1 - First purchase
    {
      projectId: 1,
      amount: 40,
      cliffDate: new Date(2025, 5, 15), // June 15, 2025
      endDate: new Date(2026, 5, 15), // June 15, 2026
      claimed: claimedTokens['1-1'] || false,
      claimable: new Date() >= new Date(2025, 5, 15), // Check if current date is after cliff date
      id: '1-1',
      transactionHash: "0x1234...5678",
      round: 1,
      buyDate: new Date(2024, 11, 10), // December 10, 2024
      spent: 500
    },
    // Project #1, Round 2 - Second purchase
    {
      projectId: 1,
      amount: 75,
      cliffDate: new Date(2025, 3, 20), // April 20, 2025
      endDate: new Date(2026, 3, 20), // April 20, 2026
      claimed: claimedTokens['1-2'] || false,
      claimable: new Date() >= new Date(2025, 3, 20),
      id: '1-2',
      transactionHash: "0x5678...9abc",
      round: 2,
      buyDate: new Date(2025, 0, 15), // January 15, 2025
      spent: 850
    },
    // Project #1, Round 3 - Third purchase
    {
      projectId: 1,
      amount: 120,
      cliffDate: new Date(2024, 8, 5), // September 5, 2024
      endDate: new Date(2025, 8, 5), // September 5, 2025
      claimed: claimedTokens['1-3'] || false,
      claimable: true, // This one is claimable
      id: '1-3',
      transactionHash: "0xdef0...1234",
      round: 3,
      buyDate: new Date(2024, 6, 1), // July 1, 2024
      spent: 1200
    },
    {
      projectId: 2,
      amount: 80,
      cliffDate: new Date(2025, 8, 1), // September 1, 2025
      endDate: new Date(2026, 8, 1), // September 1, 2026
      claimed: claimedTokens['2-0'] || false,
      claimable: new Date() >= new Date(2025, 8, 1), // Check if current date is after cliff date
      id: '2-0',
      transactionHash: "0x8765...4321",
      round: 1
    },
    {
      projectId: 3,
      amount: 120,
      cliffDate: new Date(2023, 2, 15), // March 15, 2023 (already passed)
      endDate: new Date(2024, 2, 15), // March 15, 2024
      claimed: claimedTokens['3-0'] || false,
      claimable: true, // This one is claimable
      id: '3-0',
      transactionHash: "0xabcd...ef01",
      round: 1
    },
    // Adding 5 more tokens with different cliff and end dates
    {
      projectId: 4,
      amount: 150,
      cliffDate: new Date(2024, 7, 10), // August 10, 2024
      endDate: new Date(2025, 7, 10), // August 10, 2025
      claimed: claimedTokens['4-0'] || false,
      claimable: true, // This one is claimable (date is in the past)
      id: '4-0',
      transactionHash: "0xdef0...1234",
      round: 1
    },
    {
      projectId: 5,
      amount: 200,
      cliffDate: new Date(2024, 11, 25), // December 25, 2024
      endDate: new Date(2025, 11, 25), // December 25, 2025
      claimed: claimedTokens['5-0'] || false,
      claimable: true, // This one is claimable (date is in the past)
      id: '5-0',
      transactionHash: "0x5678...9abc",
      round: 1
    },
    {
      projectId: 6,
      amount: 75,
      cliffDate: new Date(2025, 1, 14), // February 14, 2025
      endDate: new Date(2026, 1, 14), // February 14, 2026
      claimed: claimedTokens['6-0'] || false,
      claimable: false, // Not yet claimable
      id: '6-0',
      transactionHash: "0xfedc...ba98",
      round: 1
    },
    {
      projectId: 7,
      amount: 320,
      cliffDate: new Date(2025, 3, 30), // April 30, 2025
      endDate: new Date(2026, 9, 30), // October 30, 2026 (longer vesting period)
      claimed: claimedTokens['7-0'] || false,
      claimable: false, // Not yet claimable
      id: '7-0',
      transactionHash: "0x7654...3210",
      round: 1
    },
    {
      projectId: 8,
      amount: 90,
      cliffDate: new Date(2023, 11, 31), // December 31, 2023 (already passed)
      endDate: new Date(2025, 0, 31), // January 31, 2025
      claimed: claimedTokens['8-0'] || false,
      claimable: true, // This one is claimable
      id: '8-0',
      transactionHash: "0xcba9...8765",
      round: 1
    },
    // X23 Round 1 - First purchase: $1200 spent on 583 tokens
    // Sep 1, 2025 to Mar 1, 2026 (as per user request)
    {
      projectId: 0, // X23 has ID 0
      amount: 583,
      cliffDate: new Date(2025, 8, 1), // September 1, 2025
      endDate: new Date(2026, 2, 1), // March 1, 2026
      claimed: claimedTokens['0-1'] || false,
      claimable: false, // Not yet claimable
      id: '0-1',
      transactionHash: "0x3456...7890",
      round: 1
    },
    // X23 Round 2 - Second purchase
    // Feb 15, 2025 to Aug 15, 2025 (as per user request)
    {
      projectId: 0, // X23 has ID 0
      amount: 350,
      cliffDate: new Date(2025, 1, 15), // February 15, 2025
      endDate: new Date(2025, 7, 15), // August 15, 2025
      claimed: claimedTokens['0-2'] || false,
      claimable: false, // Not yet claimable
      id: '0-2',
      transactionHash: "0x9012...3456",
      round: 2
    }
  ];
  
  // First group all transactions by project ID
  const transactionsByProject = userData?.transactions.reduce<Record<number, PointTransaction[]>>((acc, transaction) => {
    if (!acc[transaction.projectId]) {
      acc[transaction.projectId] = [];
    }
    acc[transaction.projectId].push(transaction);
    return acc;
  }, {}) || {};
  
  // Create a unified list of portfolio items with projects and their unlocks
  const portfolioItems: PortfolioItem[] = [];
  
  // For each project, create a single portfolio item with all its unlocks
  Object.entries(transactionsByProject).forEach(([projectIdStr, transactions]) => {
    const projectId = parseInt(projectIdStr);
    const project = projects?.find(p => p.id === projectId);
    
    // Find all unlocks for this project
    const unlocks = tokenUnlocks.filter(t => t.projectId === projectId);
    
    // Calculate total token amount across all transactions for this project
    const totalTokens = transactions.reduce((sum, tx) => sum + tx.tokenAmount, 0);
    
    // Calculate total spent across all transactions for this project
    const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
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
  
  // Handle claiming tokens for a specific unlock
  const handleClaimTokens = (tokenId: string) => {
    const unlock = tokenUnlocks.find(t => t.id === tokenId);
    if (!unlock?.claimable) return;
    
    // In a real app, this would be an API call
    setClaimedTokens(prev => ({
      ...prev,
      [tokenId]: true
    }));
    
    const project = projects?.find(p => p.id === unlock.projectId);
    const roundInfo = unlock.round ? ` (Round ${unlock.round})` : '';
    
    toast({
      title: "Tokens Claimed!",
      description: `Successfully claimed tokens for ${project?.name || `Project #${unlock.projectId}`}${roundInfo}`,
    });
  };
  
  // Handle claiming all available tokens
  const handleClaimAllTokens = () => {
    const claimableTokens = tokenUnlocks
      .filter(t => t.claimable && !t.claimed);
      
    if (claimableTokens.length === 0) return;
    
    // In a real app, this would be an API call
    const newClaimedTokens = { ...claimedTokens };
    claimableTokens.forEach(unlock => {
      newClaimedTokens[unlock.id] = true;
    });
    
    setClaimedTokens(newClaimedTokens);
    
    toast({
      title: "All Tokens Claimed!",
      description: `Successfully claimed tokens for ${claimableTokens.length} token unlocks`,
    });
  };
  
  // Check if there are any tokens available to claim
  const hasClaimableTokens = tokenUnlocks.some(t => t.claimable && !t.claimed);
  
  // Format dates helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-light-gray)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-2 text-[color:var(--color-black)]">Your Portfolio</h1>
          <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] mb-6">Track your holdings and token unlocks</p>
        </div>
        
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-[color:var(--color-peach-100)]">
            <h3 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">TOTAL SPENT</h3>
            <div className="text-3xl font-bold text-[color:var(--color-black)]">
              {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalUsdSpent, true)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-[color:var(--color-peach-100)]">
            <h3 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">PROJECTS FUNDED</h3>
            <div className="text-3xl font-bold text-[color:var(--color-black)]">
              {isLoading ? <Skeleton className="h-8 w-16" /> : projectsCount}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-[color:var(--color-peach-100)]">
            <h3 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">Q/ACC POINTS</h3>
            <div className="text-3xl font-bold text-[color:var(--color-black)]">
              {isLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(userData?.points || 0)}
            </div>
          </div>
        </div>
        
        {/* Projects List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-['Tusker_Grotesk'] font-bold text-[color:var(--color-black)]">Your Holdings</h2>
            
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
                <div key={i} className="bg-white rounded-lg p-6 border border-[color:var(--color-peach-100)]">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-10 w-10 rounded-md mr-4" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolioItems?.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-[color:var(--color-peach-100)] text-center">
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
                <div key={index} className="bg-white rounded-lg p-6 border border-[color:var(--color-peach-100)]">
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
                            <h3 className="text-lg font-bold text-[color:var(--color-black)] font-['IBM_Plex_Mono']">
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
                            <h3 className="text-lg font-bold text-[color:var(--color-black)] font-['IBM_Plex_Mono']">
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
                      <p className="font-bold text-lg text-[color:var(--color-black)]">
                        {formatCurrency(item.transaction.amount, true)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Coins size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">TOTAL TOKENS</span>
                      </div>
                      <p className="font-bold text-lg text-[color:var(--color-black)]">
                        {item.transaction.tokenAmount} {item.project?.tokenSymbol || "tokens"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Multiple token unlock rows */}
                  {item.allUnlocks && item.allUnlocks.length > 0 && (
                    <div className="mt-4 border-t border-[color:var(--color-light-gray)] pt-4">
                      <h4 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-3">TOKEN UNLOCKS</h4>
                      
                      <div className="space-y-4">
                        {item.allUnlocks.map((unlock) => (
                          <div key={unlock.id} className="bg-[color:var(--color-light-gray)] p-4 rounded-lg">
                            <div className="flex flex-wrap justify-between items-center mb-2">
                              <div className="font-['IBM_Plex_Mono'] text-sm">
                                <span className="text-[color:var(--color-black)] font-bold mr-2">
                                  {unlock.amount} {item.project?.tokenSymbol || "tokens"}
                                </span>
                                {unlock.round && <span className="text-[color:var(--color-gray)]">Round {unlock.round}</span>}
                              </div>
                              
                              {/* Claim button per unlock - aligned to the right */}
                              <div>
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
                              </div>
                            </div>
                            
                            {/* Expanded token details in a table-like format */}
                            <div className="w-full overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr>
                                    <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">BUY DATE</th>
                                    <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">SPENT</th>
                                    <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal"># TOKENS</th>
                                    <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">CLIFF DATE</th>
                                    <th className="text-left pb-2 text-[color:var(--color-gray)] text-xs font-['IBM_Plex_Mono'] font-normal">END DATE</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="pr-4 text-[color:var(--color-black)]">
                                      {unlock.buyDate ? formatDate(unlock.buyDate) : 'N/A'}
                                    </td>
                                    <td className="pr-4 text-[color:var(--color-black)]">
                                      {unlock.spent ? formatCurrency(unlock.spent, true) : 'N/A'}
                                    </td>
                                    <td className="pr-4 text-[color:var(--color-black)]">
                                      {unlock.amount}
                                    </td>
                                    <td className="pr-4 text-[color:var(--color-black)]">
                                      {formatDate(unlock.cliffDate)}
                                    </td>
                                    <td className="pr-4 text-[color:var(--color-black)]">
                                      {formatDate(unlock.endDate)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
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