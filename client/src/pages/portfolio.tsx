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
  const [claimedTokens, setClaimedTokens] = useState<{[key: number]: boolean}>({});
  
  // Mock token unlock data - in a real app this would come from the API
  const tokenUnlocks: TokenUnlock[] = [
    {
      projectId: 1,
      amount: 40,
      cliffDate: new Date(2025, 5, 15), // June 15, 2025
      endDate: new Date(2026, 5, 15), // June 15, 2026
      claimed: claimedTokens[1] || false,
      claimable: new Date() >= new Date(2025, 5, 15) // Check if current date is after cliff date
    },
    {
      projectId: 2,
      amount: 80,
      cliffDate: new Date(2025, 8, 1), // September 1, 2025
      endDate: new Date(2026, 8, 1), // September 1, 2026
      claimed: claimedTokens[2] || false,
      claimable: new Date() >= new Date(2025, 8, 1) // Check if current date is after cliff date
    },
    {
      projectId: 3,
      amount: 120,
      cliffDate: new Date(2023, 2, 15), // March 15, 2023 (already passed)
      endDate: new Date(2024, 2, 15), // March 15, 2024
      claimed: claimedTokens[3] || false,
      claimable: true // This one is claimable
    },
    // Adding 5 more tokens with different cliff and end dates
    {
      projectId: 4,
      amount: 150,
      cliffDate: new Date(2024, 7, 10), // August 10, 2024
      endDate: new Date(2025, 7, 10), // August 10, 2025
      claimed: claimedTokens[4] || false,
      claimable: true // This one is claimable (date is in the past)
    },
    {
      projectId: 5,
      amount: 200,
      cliffDate: new Date(2024, 11, 25), // December 25, 2024
      endDate: new Date(2025, 11, 25), // December 25, 2025
      claimed: claimedTokens[5] || false,
      claimable: true // This one is claimable (date is in the past)
    },
    {
      projectId: 6,
      amount: 75,
      cliffDate: new Date(2025, 1, 14), // February 14, 2025
      endDate: new Date(2026, 1, 14), // February 14, 2026
      claimed: claimedTokens[6] || false,
      claimable: false // Not yet claimable
    },
    {
      projectId: 7,
      amount: 320,
      cliffDate: new Date(2025, 3, 30), // April 30, 2025
      endDate: new Date(2026, 9, 30), // October 30, 2026 (longer vesting period)
      claimed: claimedTokens[7] || false,
      claimable: false // Not yet claimable
    },
    {
      projectId: 8,
      amount: 90,
      cliffDate: new Date(2023, 11, 31), // December 31, 2023 (already passed)
      endDate: new Date(2025, 0, 31), // January 31, 2025
      claimed: claimedTokens[8] || false,
      claimable: true // This one is claimable
    }
  ];
  
  // Combine transaction data with project details
  const portfolioItems = userData?.transactions.map(transaction => {
    const project = projects?.find(p => p.id === transaction.projectId);
    const unlock = tokenUnlocks.find(t => t.projectId === transaction.projectId);
    
    return {
      transaction,
      project,
      unlock
    };
  });
  
  // Calculate totals
  const totalUsdSpent = portfolioItems?.reduce((total, item) => {
    return total + (item.transaction.amount || 0);
  }, 0) || 0;
  
  const projectsCount = new Set(portfolioItems?.map(item => item.transaction.projectId)).size || 0;
  
  // Handle claiming tokens for a specific project
  const handleClaimTokens = (projectId: number) => {
    if (!tokenUnlocks.find(t => t.projectId === projectId)?.claimable) return;
    
    // In a real app, this would be an API call
    setClaimedTokens(prev => ({
      ...prev,
      [projectId]: true
    }));
    
    const project = projects?.find(p => p.id === projectId);
    toast({
      title: "Tokens Claimed!",
      description: `Successfully claimed tokens for ${project?.name || `Project #${projectId}`}`,
    });
  };
  
  // Handle claiming all available tokens
  const handleClaimAllTokens = () => {
    const claimableProjectIds = tokenUnlocks
      .filter(t => t.claimable && !t.claimed)
      .map(t => t.projectId);
      
    if (claimableProjectIds.length === 0) return;
    
    // In a real app, this would be an API call
    const newClaimedTokens = { ...claimedTokens };
    claimableProjectIds.forEach(id => {
      newClaimedTokens[id] = true;
    });
    
    setClaimedTokens(newClaimedTokens);
    
    toast({
      title: "All Tokens Claimed!",
      description: `Successfully claimed tokens for ${claimableProjectIds.length} projects`,
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Briefcase size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">SPENT</span>
                      </div>
                      <p className="font-bold text-lg text-[color:var(--color-black)]">
                        {formatCurrency(item.transaction.amount, true)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Coins size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">TOKENS</span>
                      </div>
                      <p className="font-bold text-lg text-[color:var(--color-black)]">
                        {item.transaction.tokenAmount} {item.project?.tokenSymbol || "tokens"}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">CLIFF DATE</span>
                      </div>
                      <p className="font-bold text-lg text-[color:var(--color-black)]">
                        {item.unlock ? formatDate(item.unlock.cliffDate) : "TBD"}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-[color:var(--color-gray)] mb-1">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-xs font-['IBM_Plex_Mono']">END DATE</span>
                      </div>
                      <p className="font-bold text-lg text-[color:var(--color-black)]">
                        {item.unlock ? formatDate(item.unlock.endDate) : "TBD"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Claim Token Button */}
                  {item.unlock && (
                    <div className="mt-4 pt-4 border-t border-[color:var(--color-light-gray)]">
                      <div className="flex justify-end">
                        {item.unlock.claimed ? (
                          <Button 
                            disabled
                            variant="outline"
                            className="font-['IBM_Plex_Mono'] text-sm opacity-50"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Tokens Claimed
                          </Button>
                        ) : item.unlock.claimable ? (
                          <Button 
                            onClick={() => handleClaimTokens(item.transaction.projectId)}
                            variant="default"
                            className="font-['IBM_Plex_Mono'] text-sm"
                          >
                            <LockOpen className="mr-2 h-4 w-4" />
                            Claim Tokens
                          </Button>
                        ) : (
                          <Button 
                            disabled
                            variant="outline"
                            className="font-['IBM_Plex_Mono'] text-sm opacity-50"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Not Claimable Yet
                          </Button>
                        )}
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