import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { TokenHolding } from "@shared/schema";
import { Calendar, ChevronRight, Clock, Lock, Unlock } from "lucide-react";

interface TokenHoldingWithProject extends TokenHolding {
  project: {
    name: string;
    tokenSymbol: string;
    price: number;
    avatarBg?: string;
    avatarColor?: string;
  };
  currentValue: number;
}

export function TokenHoldings() {
  const [activeTab, setActiveTab] = useState<"all" | "locked" | "unlocked">("all");
  
  const {
    data: tokenHoldings,
    isLoading,
    error,
  } = useQuery<TokenHoldingWithProject[]>({
    queryKey: ["/api/token-holdings"],
    select: (data) => {
      // Add computed values
      return data.map((holding) => {
        const currentValue = parseFloat(holding.tokenAmount) * holding.project.price;
        return { ...holding, currentValue };
      });
    },
  });
  
  // Filter by lock status
  const filteredHoldings = tokenHoldings?.filter((holding) => {
    if (activeTab === "all") return true;
    if (activeTab === "locked") return holding.isLocked;
    if (activeTab === "unlocked") return !holding.isLocked;
    return true;
  });

  if (error) {
    return (
      <Card className="border border-[color:var(--border-color)]">
        <CardHeader className="pb-3">
          <CardTitle className="font-['Tusker_Grotesk'] text-2xl font-bold">TOKEN HOLDINGS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[color:var(--text-secondary)]">
            <p>Error loading token holdings. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[color:var(--border-color)]">
      <CardHeader className="pb-3">
        <CardTitle className="font-['Tusker_Grotesk'] text-2xl font-bold">TOKEN HOLDINGS</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "locked" | "unlocked")}>
          <TabsList className="mb-4 bg-[color:var(--border-color)] p-1">
            <TabsTrigger 
              value="all"
              className="font-['IBM_Plex_Mono'] text-xs font-medium data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]"
            >
              ALL
            </TabsTrigger>
            <TabsTrigger 
              value="locked"
              className="font-['IBM_Plex_Mono'] text-xs font-medium data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]"
            >
              LOCKED
            </TabsTrigger>
            <TabsTrigger 
              value="unlocked"
              className="font-['IBM_Plex_Mono'] text-xs font-medium data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]"
            >
              UNLOCKED
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            {renderHoldingsList(filteredHoldings, isLoading)}
          </TabsContent>
          <TabsContent value="locked" className="m-0">
            {renderHoldingsList(filteredHoldings, isLoading)}
          </TabsContent>
          <TabsContent value="unlocked" className="m-0">
            {renderHoldingsList(filteredHoldings, isLoading)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function renderHoldingsList(holdings: TokenHoldingWithProject[] | undefined, isLoading: boolean) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-md border-[color:var(--border-color)]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="text-center py-8 text-[color:var(--text-secondary)]">
        <p className="font-['IBM_Plex_Mono'] mb-2">You don't have any token holdings yet.</p>
        <p className="text-sm mb-4">Start backing projects to build your portfolio.</p>
        <Button 
          variant="outline" 
          className="font-['IBM_Plex_Mono'] text-sm"
          onClick={() => window.location.href = '/'}
        >
          Browse Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {holdings.map((holding) => (
        <div 
          key={holding.id} 
          className="flex items-center justify-between p-4 border rounded-md border-[color:var(--border-color)] hover:bg-[color:var(--border-color)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <ProjectAvatar 
              name={holding.project.name}
              tokenSymbol={holding.project.tokenSymbol}
              bgColor={holding.project.avatarBg || "bg-primary/10"}
              textColor={holding.project.avatarColor || "text-primary"}
            />
            <div>
              <h4 className="font-medium text-[color:var(--text-primary)]">{holding.project.name}</h4>
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                <span>{parseFloat(holding.tokenAmount).toLocaleString()} {holding.project.tokenSymbol}</span>
                {holding.isLocked ? (
                  <Badge variant="outline" className="text-xs py-0 h-5 gap-1 border-[color:var(--color-peach)] text-[color:var(--color-peach)]">
                    <Lock className="h-3 w-3" />
                    <span>Locked</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs py-0 h-5 gap-1 border-[color:var(--color-black-200)] text-[color:var(--text-primary)]">
                    <Unlock className="h-3 w-3" />
                    <span>Unlocked</span>
                  </Badge>
                )}
              </div>
              {holding.isLocked && holding.unlockDate && (
                <div className="flex items-center gap-1 mt-1 text-xs text-[color:var(--text-secondary)]">
                  <Calendar className="h-3 w-3" />
                  <span>Unlocks: {new Date(holding.unlockDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-[color:var(--text-primary)]">
              {formatCurrency(holding.currentValue)}
            </div>
            <div className="text-sm text-[color:var(--text-secondary)]">
              Purchased: {formatCurrency(parseFloat(holding.investmentAmount))}
            </div>
            {!holding.isLocked && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 h-7 text-xs font-['IBM_Plex_Mono']"
              >
                <span>Claim Tokens</span>
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}