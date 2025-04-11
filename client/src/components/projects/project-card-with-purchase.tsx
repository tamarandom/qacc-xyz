import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PurchaseTokenDialog } from "../funding-round/purchase-token-dialog"; // Component name kept for file organization
import { useAuth } from "@/hooks/use-auth";
import { useFundingRound } from "@/hooks/use-funding-round";

interface ProjectCardWithPurchaseProps {
  project: {
    id: number;
    name: string;
    symbol: string;
    description: string;
    status: string;
    categories: string[];
    logoUrl?: string;
    marketCap: number | null;
    price: number | null;
    volume24h: number | null;
    change24h: number | null;
    address?: string;
    chain?: string;
  };
}

export function ProjectCardWithPurchase({ project }: ProjectCardWithPurchaseProps) {
  const { user } = useAuth();
  const { activeRound } = useFundingRound();
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  
  // Fetch wallet balance
  const { data: walletData } = useQuery<{ balance: string }>({
    queryKey: ['/api/wallet/balance'],
    enabled: !!user && isBuyDialogOpen,
  });
  
  const walletBalance = walletData ? parseFloat(walletData.balance) : 0;
  
  // Determine if we can buy tokens for this project
  const canBuyTokens = activeRound && 
                       (project.status === "launched" || project.status === "pre-launch") && 
                       user;
  
  // Pre-launch projects use predefined values
  const isPreLaunch = project.status === "pre-launch";
  const projectPrice = isPreLaunch ? 0.069 : (project.price || 0);
  const projectMarketCap = isPreLaunch ? 400000 : (project.marketCap || 0);
  
  // Format project symbol for avatar
  const symbolLetters = project.symbol ? project.symbol.substring(0, 2).toUpperCase() : "";
  
  return (
    <>
      <Card className="h-full overflow-hidden bg-[color:var(--card-background)] border-[color:var(--border-color)] hover:border-[color:var(--color-peach-200)] transition-all">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={`${project.name} logo`}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                  <span className="font-['IBM_Plex_Mono'] font-medium">{symbolLetters}</span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-['IBM_Plex_Mono'] font-medium text-[color:var(--text-secondary)]">
                    ${project.symbol}
                  </span>
                  
                  {project.status === "pre-launch" && (
                    <Badge variant="outline" className="bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none text-xs">
                      New
                    </Badge>
                  )}
                  
                  {project.status === "pre-abc" && (
                    <Badge variant="outline" className="bg-[#6F4FE8] text-white border-none text-xs">
                      pre-ABC
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              {project.change24h !== null && (
                <div className={`flex items-center ${project.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {project.change24h >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {Math.abs(project.change24h).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-[color:var(--text-secondary)] line-clamp-3">
            {project.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-medium text-[color:var(--text-secondary)]">Price</p>
              <p className="text-sm font-semibold">{formatCurrency(projectPrice)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[color:var(--text-secondary)]">Market Cap</p>
              <p className="text-sm font-semibold">{formatCompactNumber(projectMarketCap)}</p>
            </div>
            {project.volume24h !== null && (
              <div>
                <p className="text-xs font-medium text-[color:var(--text-secondary)]">Volume (24h)</p>
                <p className="text-sm font-semibold">{formatCompactNumber(project.volume24h)}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-[color:var(--border-color)] pt-3 pb-3 flex justify-between">
          <Link href={`/projects/${project.id}`}>
            <Button 
              variant="ghost" 
              className="font-['IBM_Plex_Mono'] text-xs h-8 px-2.5"
            >
              View Details <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
          
          {canBuyTokens && (
            <Button 
              variant="default" 
              className="font-['IBM_Plex_Mono'] text-xs h-8 px-2.5 bg-[color:var(--color-peach)] text-[color:var(--color-black)] hover:bg-[color:var(--color-peach-300)]"
              onClick={() => setIsBuyDialogOpen(true)}
            >
              Buy Tokens
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {activeRound && isBuyDialogOpen && (
        <PurchaseTokenDialog
          isOpen={isBuyDialogOpen}
          onClose={() => setIsBuyDialogOpen(false)}
          project={{
            id: project.id,
            name: project.name,
            symbol: project.symbol,
            price: projectPrice
          }}
          walletBalance={walletBalance}
          roundId={activeRound.id}
        />
      )}
    </>
  );
}