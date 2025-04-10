import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Project, FundingRound } from "@shared/schema";
import { formatCurrency } from "@/lib/formatters";

interface PurchaseTokenDialogProps {
  project: Project;
  fundingRound: FundingRound;
}

export function PurchaseTokenDialog({ project, fundingRound }: PurchaseTokenDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const userBalance = parseFloat(user?.walletBalance || "0");
  const roundMinimum = fundingRound.minimumInvestment ? parseFloat(fundingRound.minimumInvestment) : 0;
  const roundMaximum = fundingRound.maximumInvestment ? parseFloat(fundingRound.maximumInvestment) : Infinity;
  const tokenPrice = parseFloat(fundingRound.tokenPrice);
  
  // Calculate token amount based on USDT input
  const tokenAmount = amount ? parseFloat(amount) / tokenPrice : 0;

  const purchaseMutation = useMutation({
    mutationFn: async (formData: { amount: string }) => {
      const res = await apiRequest("POST", `/api/projects/${project.id}/purchase`, {
        amount: formData.amount,
        roundId: fundingRound.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: `You've successfully purchased ${tokenAmount.toFixed(2)} ${project.tokenSymbol} tokens.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id, "token-holdings"] });
      
      setOpen(false);
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to spend.",
        variant: "destructive",
      });
      return;
    }
    
    const amountNumber = parseFloat(amount);
    
    if (amountNumber > userBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough USDT in your wallet.",
        variant: "destructive",
      });
      return;
    }
    
    if (amountNumber < roundMinimum) {
      toast({
        title: "Below minimum",
        description: `The minimum purchase amount is ${formatCurrency(roundMinimum)}.`,
        variant: "destructive",
      });
      return;
    }
    
    if (amountNumber > roundMaximum) {
      toast({
        title: "Above maximum",
        description: `The maximum purchase amount is ${formatCurrency(roundMaximum)}.`,
        variant: "destructive",
      });
      return;
    }
    
    purchaseMutation.mutate({ amount });
  }

  if (!user) {
    return (
      <Button variant="outline" disabled>
        Sign in to purchase
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          Purchase {project.tokenSymbol} Tokens
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase {project.tokenSymbol} Tokens</DialogTitle>
          <DialogDescription>
            Enter the amount of USDT you want to spend to purchase {project.tokenSymbol} tokens.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                USDT Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={roundMinimum}
                max={Math.min(roundMaximum, userBalance)}
                placeholder="0.00"
                className="col-span-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Token Price</Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {formatCurrency(tokenPrice)} per {project.tokenSymbol}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">You'll Receive</Label>
              <div className="col-span-3 font-medium">
                {tokenAmount.toFixed(2)} {project.tokenSymbol}
              </div>
            </div>
            {roundMinimum > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Min Purchase</Label>
                <div className="col-span-3 text-sm text-muted-foreground">
                  {formatCurrency(roundMinimum)}
                </div>
              </div>
            )}
            {roundMaximum < Infinity && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Max Purchase</Label>
                <div className="col-span-3 text-sm text-muted-foreground">
                  {formatCurrency(roundMaximum)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Wallet Balance</Label>
              <div className="col-span-3 text-sm">
                {formatCurrency(userBalance)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={purchaseMutation.isPending || !amount || parseFloat(amount) <= 0}
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}