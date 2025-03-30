import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, Coins, ArrowUpRight } from "lucide-react";
import { type Project, type User, type PointTransaction } from "@shared/schema";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { ProjectAvatar } from "@/components/ui/project-avatar";

// Token unlock structure
interface TokenUnlock {
  projectId: number;
  amount: number;
  cliffDate: Date;
  endDate: Date;
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
  
  // Mock token unlock data - in a real app this would come from the API
  const tokenUnlocks: TokenUnlock[] = [
    {
      projectId: 1,
      amount: 40,
      cliffDate: new Date(2025, 5, 15), // June 15, 2025
      endDate: new Date(2026, 5, 15), // June 15, 2026
    },
    {
      projectId: 2,
      amount: 80,
      cliffDate: new Date(2025, 8, 1), // September 1, 2025
      endDate: new Date(2026, 8, 1), // September 1, 2026
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
              {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalUsdSpent)}
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
          <h2 className="text-xl font-['Tusker_Grotesk'] font-bold mb-4 text-[color:var(--color-black)]">Your Holdings</h2>
          
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
                        {formatCurrency(item.transaction.amount)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}