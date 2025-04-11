import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ActiveRoundBanner() {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  
  // Query to fetch active round
  const { data: activeRound, isLoading } = useQuery({
    queryKey: ['/api/funding-rounds/active'],
    queryFn: async () => {
      const response = await fetch('/api/funding-rounds/active');
      if (!response.ok) {
        if (response.status === 404) {
          // No active round found, not an error
          return null;
        }
        throw new Error('Failed to fetch active round');
      }
      return await response.json();
    }
  });

  // Update the countdown timer every minute
  useEffect(() => {
    if (!activeRound?.round) return;

    const updateTimeLeft = () => {
      const endDate = new Date(activeRound.round.endDate);
      const now = new Date();
      
      if (now > endDate) {
        setTimeLeft("Round has ended");
        return;
      }
      
      const distance = formatDistanceToNow(endDate, { addSuffix: true });
      setTimeLeft(`Ends ${distance}`);
    };

    // Update immediately
    updateTimeLeft();
    
    // Then update every minute
    const interval = setInterval(updateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, [activeRound]);

  if (isLoading || !activeRound?.round || !timeLeft) {
    return null;
  }

  return (
    <Alert className="bg-[color:var(--color-peach-100)] border-[color:var(--color-peach)] border-2 rounded-md mb-6">
      <AlertCircle className="h-4 w-4 text-[color:var(--color-peach)]" />
      <AlertDescription className="flex justify-between items-center text-[color:var(--color-peach)] font-medium">
        <span className="font-['IBM_Plex_Mono']">
          ACTIVE ROUND: {activeRound.round.name} - {activeRound.round.projectName}
        </span>
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {timeLeft}
        </span>
      </AlertDescription>
    </Alert>
  );
}