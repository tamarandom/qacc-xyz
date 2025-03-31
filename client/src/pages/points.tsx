import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Award, Medal, Trophy, User as UserIcon } from "lucide-react";
import { type User } from "@shared/schema";
import { formatNumber } from "@/lib/formatters";

// Rank badge component
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="flex justify-center items-center w-11 h-11 border-2 border-[color:var(--color-black)] rounded-full">
        <div className="flex justify-center items-center w-9 h-9 bg-[color:var(--color-peach)] rounded-full">
          <span className="text-2xl font-bold font-['Tusker_Grotesk'] text-white">1</span>
        </div>
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="flex justify-center items-center w-11 h-11 border-2 border-[color:var(--color-black)] rounded-full">
        <div className="flex justify-center items-center w-9 h-9 bg-[color:var(--color-peach)] rounded-full">
          <span className="text-2xl font-bold font-['Tusker_Grotesk'] text-white">2</span>
        </div>
      </div>
    );
  } else if (rank === 3) {
    return (
      <div className="flex justify-center items-center w-11 h-11 border-2 border-[color:var(--color-black)] rounded-full">
        <div className="flex justify-center items-center w-9 h-9 bg-[color:var(--color-peach)] rounded-full">
          <span className="text-2xl font-bold font-['Tusker_Grotesk'] text-white">3</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center w-10 h-10">
      <span className="text-xl font-bold font-['Tusker_Grotesk'] text-[color:var(--color-black)]">{rank}</span>
    </div>
  );
};

export default function PointsPage() {
  // In a real app, this would come from authentication
  // Initialize isAuthenticated from localStorage if available
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if the user logged in from navbar
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
      return loggedIn;
    }
    return false;
  });
  const currentUserId = 3; // Mock logged in user ID
  
  // Update authentication status when navbar login changes
  useEffect(() => {
    // Listen for changes to localStorage from navbar login
    const handleStorageChange = () => {
      const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isLoggedIn);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check on mount too
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch top users for the leaderboard
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard?limit=20');
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return res.json() as Promise<User[]>;
    }
  });
  
  // Find current user in leaderboard
  const currentUser = Array.isArray(users) ? users.find(user => user.id === currentUserId) : null;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-light-gray)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-2 text-[color:var(--color-black)]">Points Leaderboard</h1>
          <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] mb-6">Climb the ranks, showcase your expertise</p>
        </div>

        {/* User standing section - Only show when authenticated */}
        {isAuthenticated && (
          <div>
            <h2 className="text-xl font-['Tusker_Grotesk'] font-bold mb-2 text-[color:var(--color-black)]">Your Standing</h2>
            <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] text-sm mb-4">Compared to others</p>
            
            {currentUser ? (
              <div className="rounded-lg p-3 border border-[color:var(--color-peach-100)] bg-white">
                <div className="flex items-center justify-between">
                  <Link href={`/user-score?id=${currentUser.id}`} className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
                    <span className="text-2xl font-bold text-[color:var(--color-black)]">#{currentUser.rank}</span>
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.username} 
                        className="h-10 w-10 rounded-md object-cover border border-[color:var(--color-peach)] mr-2"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-[color:var(--color-peach)] rounded-md mr-2 flex items-center justify-center">
                        <span className="text-white font-bold">{currentUser.username.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{currentUser.username}</div>
                      <div className="text-xs text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] mt-1">
                        You
                      </div>
                    </div>
                  </Link>
                  <span className="font-bold text-xl text-[color:var(--color-black)]">{formatNumber(currentUser.points)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg p-6 text-center border border-[color:var(--color-peach-100)] bg-white">
                <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono']">Sign in to see your position on the leaderboard</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard section */}
        <div>
          <h2 className="text-xl font-['Tusker_Grotesk'] font-bold mb-4 text-[color:var(--color-black)]">Leaderboard</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-[color:var(--color-peach-100)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 bg-white rounded-lg border border-[color:var(--color-peach-100)]">
              Failed to load leaderboard. Please try again later.
            </div>
          ) : (
            <div className="space-y-2">
              {Array.isArray(users) ? users.slice(0, 10).map((user) => {
                const isCurrentUser = user.id === currentUserId;
                return (
                  <Link 
                    href={`/user-score?id=${user.id}`}
                    key={user.id}
                    className={`flex items-stretch bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity
                    ${isAuthenticated && isCurrentUser ? "border-2 border-[color:var(--color-peach)]" : "border border-[color:var(--color-peach-100)]"}`}
                  >
                    <div className="w-16 bg-[color:var(--color-light-gray)] flex items-center justify-center">
                      <RankBadge rank={user.rank || 0} />
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-between relative overflow-hidden">
                      {/* Diagonal lines for design */}
                      <div className="absolute right-0 top-0 bottom-0 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-[2px] h-full bg-[color:var(--color-light-gray)] transform rotate-[20deg] ml-4"
                            style={{ height: '200%' }}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center z-10">
                        <div className="flex items-center space-x-3">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.username} 
                              className="h-10 w-10 rounded-md object-cover border border-[color:var(--color-peach)]"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-[color:var(--color-peach)] flex items-center justify-center">
                              <span className="font-bold text-lg text-white">{user.username.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{user.username}</div>
                            <div className="text-xs text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] mt-1">
                              {isCurrentUser ? "You" : "project backer"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right z-10 font-bold text-lg text-[color:var(--color-black)]">
                        {formatNumber(user.points)}
                      </div>
                    </div>
                  </Link>
                );
              }) : <p className="p-4 text-center text-[color:var(--color-gray)]">No users found</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}