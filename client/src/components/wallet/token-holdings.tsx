import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenHolding, Project } from "@shared/schema";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { AlertCircle, Coins, Lock, LockOpen, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TokenHoldingItemProps {
  holding: TokenHolding;
  project?: Project;
}

function TokenHoldingItem({ holding, project }: TokenHoldingItemProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  
  const purchaseDate = new Date(holding.purchaseDate);
  const unlockDate = holding.unlockDate ? new Date(holding.unlockDate) : null;
  const isUnlocked = !holding.isLocked;
  const canClaim = !holding.isLocked && unlockDate && new Date() >= unlockDate;
  
  // Function to claim tokens (in a real app, this would call an API endpoint)
  const handleClaimTokens = async () => {
    setIsClaimingTokens(true);
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      toast({
        title: "Tokens Claimed!",
        description: `Successfully claimed ${holding.tokenAmount} ${project?.tokenSymbol || 'tokens'}`,
      });
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/token-holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
    } catch (error) {
      toast({
        title: "Failed to claim tokens",
        description: "There was an error claiming your tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingTokens(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 rounded-md border border-border/60 p-4 bg-black/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {project ? (
            <ProjectAvatar
              name={project.name}
              bgColor={project.avatarBg || "bg-primary-100"}
              textColor={project.avatarColor || "white"}
              size="sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium font-['IBM_Plex_Mono']">
              {project?.name || `Project #${holding.projectId}`}
            </div>
            <div className="text-xs text-muted-foreground">
              {project?.tokenSymbol || "Unknown Token"}
            </div>
          </div>
        </div>
        <Badge 
          variant={isUnlocked ? "outline" : "default"} 
          className={cn(
            "font-['IBM_Plex_Mono'] text-xs",
            isUnlocked ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
          )}
        >
          {isUnlocked ? (
            <LockOpen className="mr-1 h-3 w-3" />
          ) : (
            <Lock className="mr-1 h-3 w-3" />
          )}
          {isUnlocked ? "Unlocked" : "Locked"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Amount</div>
          <div className="font-medium font-['IBM_Plex_Mono']">
            {parseFloat(holding.tokenAmount).toFixed(2)} {project?.tokenSymbol || "tokens"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Spent</div>
          <div className="font-medium font-['IBM_Plex_Mono']">
            {formatCurrency(parseFloat(holding.investmentAmount))}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Purchase Date</div>
          <div className="font-medium text-xs">
            {purchaseDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Unlock Date</div>
          <div className="font-medium text-xs">
            {unlockDate ? unlockDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'N/A'}
          </div>
        </div>
      </div>
      
      {canClaim && (
        <Button
          size="sm"
          className="mt-2 w-full font-['IBM_Plex_Mono']"
          onClick={handleClaimTokens}
          disabled={isClaimingTokens}
        >
          {isClaimingTokens ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Claim Tokens
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function TokenHoldings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch token holdings
  const { 
    data: holdings, 
    isLoading: isLoadingHoldings,
    isError
  } = useQuery<TokenHolding[]>({
    queryKey: ["/api/token-holdings"],
    enabled: !!user,
  });
  
  // Fetch projects to get their details (name, symbol, etc.)
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });
  
  // Handle errors
  if (isError) {
    toast({
      title: "Error loading token holdings",
      description: "There was an error loading your token holdings. Please try again later.",
      variant: "destructive",
    });
  }
  
  if (!user) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="mr-2 h-5 w-5" />
            Token Holdings
          </CardTitle>
          <CardDescription>Please log in to view your token holdings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="h-full border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center font-bold">
            <Coins className="mr-2 h-5 w-5" />
            Token Holdings
          </CardTitle>
          {holdings && holdings.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {holdings.length} {holdings.length === 1 ? 'holding' : 'holdings'}
            </Badge>
          )}
        </div>
        <CardDescription>Your purchased project tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {isLoadingHoldings ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !holdings || holdings.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">No token holdings yet</div>
              <div className="text-xs text-muted-foreground max-w-[250px] mt-1">
                Purchase tokens from projects in funding rounds to see them here
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {holdings.map((holding) => (
                  <TokenHoldingItem 
                    key={holding.id} 
                    holding={holding} 
                    project={projects?.find(p => p.id === holding.projectId)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}