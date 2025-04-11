import { useFundingRound } from "@/hooks/use-funding-round";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export function CountdownBanner() {
  const { activeRound, timeRemaining, isLoading } = useFundingRound();
  
  // If not loading and no active round or no time remaining, don't show anything
  if (!isLoading && (!activeRound || !timeRemaining)) {
    return null;
  }
  
  // Calculate progress (from start date to end date)
  const calculateProgress = () => {
    if (!activeRound) return 0;
    
    const startDate = new Date(activeRound.startDate).getTime();
    const endDate = new Date(activeRound.endDate).getTime();
    const now = new Date().getTime();
    
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    
    // Calculate percentage of time elapsed
    let progress = Math.round((elapsed / totalDuration) * 100);
    
    // Ensure progress is between 0 and 100
    progress = Math.max(0, Math.min(100, progress));
    
    return progress;
  };
  
  return (
    <div className="w-full bg-[color:var(--color-peach)] text-[color:var(--color-black)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-2 sm:mb-0">
            <Clock className="h-4 w-4 mr-2" />
            <span className="font-['IBM_Plex_Mono'] text-sm font-medium">
              {isLoading ? (
                <Skeleton className="h-4 w-40 bg-black/20" />
              ) : (
                <>
                  Active round: <strong>{activeRound?.name}</strong>
                </>
              )}
            </span>
          </div>
          
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="font-['IBM_Plex_Mono'] text-xs font-medium">
                {isLoading ? (
                  <Skeleton className="h-4 w-32 bg-black/20" />
                ) : (
                  <>
                    Round ends in:
                  </>
                )}
              </span>
              <span className="font-['IBM_Plex_Mono'] text-xs font-bold">
                {isLoading ? (
                  <Skeleton className="h-4 w-24 bg-black/20" />
                ) : (
                  <>
                    {timeRemaining?.days}d {timeRemaining?.hours}h {timeRemaining?.minutes}m {timeRemaining?.seconds}s
                  </>
                )}
              </span>
            </div>
            
            <div className="w-full sm:w-64">
              {isLoading ? (
                <Skeleton className="h-2 w-full bg-black/20" />
              ) : (
                <Progress value={calculateProgress()} className="h-2 bg-black/20" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}