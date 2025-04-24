import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { VerificationLevel } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

// Types for the funding rounds
interface FundingRound {
  id: number;
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targetAmount: string;
  minimumInvestment: string;
  maximumInvestment: string;
  status: 'active' | 'upcoming' | 'completed';
  currentAmount: string;
  projectName: string;
  projectDescription: string;
  tokenSymbol: string;
  tokenLogo: string | null;
}

interface UserVerification {
  verificationLevel: VerificationLevel;
  spendingCap: number;
}

function ActiveRoundCard({ round, onContribute }: { 
  round: FundingRound, 
  onContribute: (roundId: number) => void 
}) {
  const daysLeft = differenceInDays(new Date(round.endDate), new Date());
  const hoursLeft = differenceInHours(new Date(round.endDate), new Date()) % 24;
  const percentFilled = Math.min(100, (Number(round.currentAmount) / Number(round.targetAmount)) * 100);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{round.name}</CardTitle>
            <CardDescription>{round.projectName} ({round.tokenSymbol})</CardDescription>
          </div>
          <Badge 
            variant={round.status === 'active' ? 'default' : round.status === 'upcoming' ? 'outline' : 'secondary'}
            className={round.status === 'active' ? 'bg-green-600' : ''}
          >
            {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm mb-4">{round.description}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{formatCurrency(Number(round.currentAmount))} / {formatCurrency(Number(round.targetAmount))}</span>
            </div>
            <Progress value={percentFilled} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Minimum</p>
              <p className="font-medium">{formatCurrency(Number(round.minimumInvestment))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Maximum</p>
              <p className="font-medium">{formatCurrency(Number(round.maximumInvestment))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{format(parseISO(round.startDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{format(parseISO(round.endDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1 text-orange-400" />
            {daysLeft > 0 ? (
              <span>
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} {hoursLeft} hour{hoursLeft !== 1 ? 's' : ''} left
              </span>
            ) : (
              <span>{hoursLeft} hour{hoursLeft !== 1 ? 's' : ''} left</span>
            )}
          </div>
          <Button 
            onClick={() => onContribute(round.id)} 
            disabled={round.status !== 'active'}
          >
            Contribute
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function ContributeDialog({ 
  isOpen, 
  onClose, 
  round, 
  onContribute,
  userWallet,
  userVerification
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  round: FundingRound | null,
  onContribute: (roundId: number, amount: number) => void,
  userWallet: string,
  userVerification: UserVerification
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = () => {
    setError('');
    
    if (!round) return;
    
    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Check minimum investment
    if (numAmount < Number(round.minimumInvestment)) {
      setError(`Minimum contribution is ${formatCurrency(Number(round.minimumInvestment))}`);
      return;
    }
    
    // Check maximum investment
    if (numAmount > Number(round.maximumInvestment)) {
      setError(`Maximum contribution is ${formatCurrency(Number(round.maximumInvestment))}`);
      return;
    }
    
    // Check wallet balance
    if (numAmount > Number(userWallet)) {
      setError(`Insufficient wallet balance. You have ${formatCurrency(Number(userWallet))}`);
      return;
    }
    
    // Check spending cap based on verification level
    if (numAmount > userVerification.spendingCap) {
      setError(`This amount exceeds your spending cap of ${formatCurrency(userVerification.spendingCap)} based on your verification level (${userVerification.verificationLevel})`);
      return;
    }
    
    // Submit contribution
    onContribute(round.id, numAmount);
    onClose();
  };
  
  if (!round) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contribute to {round.name}</DialogTitle>
          <DialogDescription>
            Support {round.projectName} ({round.tokenSymbol}) by contributing to this funding round.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="amount">Contribution Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min={round.minimumInvestment}
              max={round.maximumInvestment}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your wallet balance:</span>
              <span>{formatCurrency(Number(userWallet))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Minimum contribution:</span>
              <span>{formatCurrency(Number(round.minimumInvestment))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Maximum contribution:</span>
              <span>{formatCurrency(Number(round.maximumInvestment))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Your spending cap:</span>
              <span>{formatCurrency(userVerification.spendingCap)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Verification level:</span>
              <span>{userVerification.verificationLevel}</span>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This contribution reserves tokens that will be available to claim after the funding round ends. Funds will be deducted from your wallet immediately.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Contribute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VerificationDialog({ 
  isOpen, 
  onClose,
  onUpdateVerification
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onUpdateVerification: (level: VerificationLevel) => void 
}) {
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel>(VerificationLevel.NONE);
  
  const handleSubmit = () => {
    onUpdateVerification(selectedLevel);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Verification Level</DialogTitle>
          <DialogDescription>
            Higher verification levels allow for larger contributions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${selectedLevel === VerificationLevel.NONE ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setSelectedLevel(VerificationLevel.NONE)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">No Verification</h3>
                  <p className="text-sm text-muted-foreground">Basic access</p>
                </div>
                {selectedLevel === VerificationLevel.NONE && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="text-sm mt-2">Spending cap: {formatCurrency(500)}</p>
            </div>
            
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${selectedLevel === VerificationLevel.HUMAN_PASSPORT ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setSelectedLevel(VerificationLevel.HUMAN_PASSPORT)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Human Passport</h3>
                  <p className="text-sm text-muted-foreground">Basic identity verification</p>
                </div>
                {selectedLevel === VerificationLevel.HUMAN_PASSPORT && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="text-sm mt-2">Spending cap: {formatCurrency(1000)}</p>
            </div>
            
            <div 
              className={`p-4 border rounded-lg cursor-pointer ${selectedLevel === VerificationLevel.ZK_ID ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setSelectedLevel(VerificationLevel.ZK_ID)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">zkID Verification</h3>
                  <p className="text-sm text-muted-foreground">Advanced identity verification</p>
                </div>
                {selectedLevel === VerificationLevel.ZK_ID && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="text-sm mt-2">Spending cap: {formatCurrency(25000)}</p>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>For Demo Purposes Only</AlertTitle>
            <AlertDescription>
              In a real application, these verifications would require external identity verification services.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Verification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddFundsDialog({ 
  isOpen, 
  onClose,
  onAddFunds,
  userWallet
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onAddFunds: (amount: number) => void,
  userWallet: string
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = () => {
    setError('');
    
    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Submit
    onAddFunds(numAmount);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
          <DialogDescription>
            Add USDT to your wallet to participate in funding rounds.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current wallet balance:</span>
              <span>{formatCurrency(Number(userWallet))}</span>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>For Demo Purposes Only</AlertTitle>
            <AlertDescription>
              In a real application, this would connect to a payment gateway or blockchain wallet.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Funds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ActiveRoundsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for dialogs
  const [selectedRound, setSelectedRound] = useState<FundingRound | null>(null);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  
  // Fetch active funding rounds
  const { data: fundingRounds = [], isLoading } = useQuery<FundingRound[]>({
    queryKey: ['/api/active-rounds'],
  });
  
  // Fetch user verification level
  const { data: userVerification = { verificationLevel: VerificationLevel.NONE, spendingCap: 500 } } = useQuery<UserVerification>({
    queryKey: ['/api/active-rounds/verification'],
    enabled: !!user,
  });
  
  // Contribute to funding round mutation
  const contributeMutation = useMutation({
    mutationFn: async ({ roundId, amount }: { roundId: number, amount: number }) => {
      const res = await apiRequest('POST', `/api/active-rounds/${roundId}/contribute`, { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/active-rounds'] });
      toast({
        title: "Contribution successful",
        description: "Your contribution has been processed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Contribution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update verification level mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async (verificationType: VerificationLevel) => {
      const res = await apiRequest('POST', '/api/active-rounds/verification', { verificationType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/active-rounds/verification'] });
      toast({
        title: "Verification updated",
        description: "Your verification level has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add funds to wallet mutation
  const addFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/active-rounds/add-funds', { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Funds added",
        description: "Your wallet has been funded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleContributeClick = (roundId: number) => {
    const round = fundingRounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRound(round);
      setContributeDialogOpen(true);
    }
  };
  
  const handleContributeSubmit = (roundId: number, amount: number) => {
    contributeMutation.mutate({ roundId, amount });
  };
  
  const handleUpdateVerification = (level: VerificationLevel) => {
    updateVerificationMutation.mutate(level);
  };
  
  const handleAddFunds = (amount: number) => {
    addFundsMutation.mutate(amount);
  };
  
  if (!user) {
    return (
      <div className="py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication required</AlertTitle>
            <AlertDescription>
              Please sign in to view and participate in active funding rounds.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Active Funding Rounds</h1>
            <p className="text-muted-foreground mt-2">
              Support projects by participating in their funding rounds. Tokens will be available to claim after the round ends.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setAddFundsDialogOpen(true)}>
              Add Funds
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setVerificationDialogOpen(true)}
            >
              Verification: {userVerification.verificationLevel}
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="mr-6">
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(Number(user.walletBalance))}</p>
                  </div>
                  <div className="mr-6 mt-2 md:mt-0">
                    <p className="text-sm text-muted-foreground">Verification Level</p>
                    <p className="font-medium">{userVerification.verificationLevel}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-sm text-muted-foreground">Spending Cap</p>
                    <p className="font-medium">{formatCurrency(userVerification.spendingCap)}</p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Button variant="ghost" size="sm" className="text-xs" asChild>
                    <a href="https://worldcoin.org/world-id" target="_blank" rel="noopener noreferrer" className="flex items-center">
                      Learn about verifications <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading funding rounds...</p>
          </div>
        ) : fundingRounds.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">No active funding rounds</h3>
            <p className="text-muted-foreground">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundingRounds.map((round) => (
              <ActiveRoundCard 
                key={round.id} 
                round={round} 
                onContribute={handleContributeClick} 
              />
            ))}
          </div>
        )}
        
        {/* Dialogs */}
        <ContributeDialog 
          isOpen={contributeDialogOpen}
          onClose={() => setContributeDialogOpen(false)}
          round={selectedRound}
          onContribute={handleContributeSubmit}
          userWallet={user.walletBalance}
          userVerification={userVerification}
        />
        
        <VerificationDialog 
          isOpen={verificationDialogOpen}
          onClose={() => setVerificationDialogOpen(false)}
          onUpdateVerification={handleUpdateVerification}
        />
        
        <AddFundsDialog 
          isOpen={addFundsDialogOpen}
          onClose={() => setAddFundsDialogOpen(false)}
          onAddFunds={handleAddFunds}
          userWallet={user.walletBalance}
        />
      </div>
    </div>
  );
}