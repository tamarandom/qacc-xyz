import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface FundingRound {
  id: number;
  projectId: number | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  contributionLimit: number;
}

export function useFundingRound() {
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  
  // Fetch active rounds
  const { data: activeRounds, isLoading, error } = useQuery<FundingRound[]>({
    queryKey: ['/api/active-rounds'],
  });
  
  // Get the current active round
  const activeRound = activeRounds?.[0];
  
  // Calculate time remaining
  useEffect(() => {
    if (!activeRound || activeRound.status !== 'active') {
      setTimeRemaining(null);
      return;
    }
    
    const endDate = new Date(activeRound.endDate);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeRemaining(null);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [activeRound]);
  
  return {
    activeRound,
    timeRemaining,
    isLoading,
    error
  };
}