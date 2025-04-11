import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { VerificationLevel } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ShieldCheck, X } from "lucide-react";

// Spending caps per verification level (from database)
const SPENDING_CAPS = {
  [VerificationLevel.NONE]: 0,
  [VerificationLevel.HUMAN_PASSPORT]: 1000, // $1,000
  [VerificationLevel.ZK_ID]: 25000 // $25,000
};

interface PurchaseTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: number;
    name: string;
    symbol: string;
    price: number;
  };
  walletBalance: number;
  roundId: number;
}

export function PurchaseTokenDialog({
  isOpen,
  onClose,
  project,
  walletBalance,
  roundId
}: PurchaseTokenDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>("");
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  
  // Fetch user's verification level
  const { data: verification, isLoading: verificationLoading } = useQuery<{
    roundId: number,
    verificationLevel: VerificationLevel,
    spent: number
  }>({
    queryKey: [`/api/active-rounds/verification?roundId=${roundId}`],
    enabled: isOpen && roundId > 0
  });
  
  // Calculate token amount based on price
  const tokenAmount = amount && !isNaN(parseFloat(amount)) ? parseFloat(amount) / project.price : 0;
  
  // Calculate remaining spend amount based on verification level
  const verificationLevel = verification?.verificationLevel || VerificationLevel.NONE;
  const spendCap = SPENDING_CAPS[verificationLevel];
  const alreadySpent = verification?.spent || 0;
  const remainingSpend = spendCap - alreadySpent;
  
  // Check if purchase amount exceeds verification level
  const exceedsVerificationLevel = parseFloat(amount || "0") > remainingSpend;
  
  // Contribute mutation
  const { mutate: contribute, isPending } = useMutation({
    mutationFn: async (contributionAmount: number) => {
      const res = await apiRequest("POST", "/api/active-rounds/contribute", {
        roundId: roundId,
        projectId: project.id,
        amount: contributionAmount
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful",
        description: `You have successfully purchased ${tokenAmount.toFixed(2)} ${project.symbol} tokens.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/token-holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: [`/api/active-rounds/verification`] });
      
      // Close dialog
      onClose();
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to complete this purchase.",
        variant: "destructive",
      });
      return;
    }
    
    if (exceedsVerificationLevel) {
      setIsVerificationOpen(true);
      return;
    }

    contribute(parseFloat(amount));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-[color:var(--card-background)] text-[color:var(--text-primary)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Purchase {project.symbol} Tokens</DialogTitle>
            <DialogDescription>
              Enter the amount of USDT you want to spend.
            </DialogDescription>
          </DialogHeader>
          
          {/* Verification level info */}
          {!verificationLoading && (
            <div className="bg-[color:var(--border-color)] p-3 rounded-md mb-4">
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-[color:var(--color-peach)] mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Verification Level: {verificationLevel.replace('_', ' ')}</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">
                    Maximum spend: {formatCurrency(spendCap)} 
                    <br/>
                    Already spent: {formatCurrency(alreadySpent)}
                    <br/>
                    Remaining: {formatCurrency(remainingSpend)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                USDT
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                max={walletBalance.toString()}
                placeholder="0.00"
                className="col-span-3 bg-[color:var(--background)]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tokens" className="text-right">
                {project.symbol}
              </Label>
              <Input
                id="tokens"
                value={tokenAmount ? tokenAmount.toFixed(6) : "0"}
                disabled
                className="col-span-3 bg-[color:var(--border-color)]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                value={formatCurrency(project.price)}
                disabled
                className="col-span-3 bg-[color:var(--border-color)]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Balance
              </Label>
              <Input
                id="balance"
                value={formatCurrency(walletBalance)}
                disabled
                className="col-span-3 bg-[color:var(--border-color)]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="font-['IBM_Plex_Mono'] text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={!amount || parseFloat(amount) <= 0 || isPending}
              className="font-['IBM_Plex_Mono'] text-sm bg-[color:var(--color-peach)] text-[color:var(--color-black)] hover:bg-[color:var(--color-peach-300)]"
            >
              {isPending ? "Processing..." : "Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verification level upgrade dialog */}
      <Dialog open={isVerificationOpen} onOpenChange={() => setIsVerificationOpen(false)}>
        <DialogContent className="sm:max-w-[425px] bg-[color:var(--card-background)] text-[color:var(--text-primary)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Verification Required</DialogTitle>
          </DialogHeader>
          
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Spending limit exceeded</AlertTitle>
            <AlertDescription>
              Your purchase amount exceeds your remaining spending limit of {formatCurrency(remainingSpend)}.
            </AlertDescription>
          </Alert>
          
          <div className="py-4">
            <p className="mb-4">To increase your spending limit, you need to upgrade your verification level:</p>
            
            <div className="space-y-3">
              <div className="bg-[color:var(--border-color)] p-3 rounded-md flex items-start">
                <ShieldCheck className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Human Passport</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">Spending limit: {formatCurrency(SPENDING_CAPS[VerificationLevel.HUMAN_PASSPORT])}</p>
                </div>
              </div>
              
              <div className="bg-[color:var(--border-color)] p-3 rounded-md flex items-start">
                <ShieldCheck className="h-5 w-5 text-[color:var(--color-peach)] mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">zkID Verification</p>
                  <p className="text-sm text-[color:var(--text-secondary)]">Spending limit: {formatCurrency(SPENDING_CAPS[VerificationLevel.ZK_ID])}</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsVerificationOpen(false)}
              className="font-['IBM_Plex_Mono'] text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Here we would redirect to verification page
                setIsVerificationOpen(false);
                toast({
                  title: "Verification",
                  description: "Please complete the verification process to upgrade your spending limit.",
                });
              }}
              className="font-['IBM_Plex_Mono'] text-sm bg-[color:var(--color-peach)] text-[color:var(--color-black)] hover:bg-[color:var(--color-peach-300)]"
            >
              Verify Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}