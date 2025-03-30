import { useState } from "react";
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
      <div className="flex justify-center items-center w-10 h-10">
        <Trophy className="w-7 h-7 text-yellow-400" />
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="flex justify-center items-center w-10 h-10">
        <Medal className="w-7 h-7 text-gray-300" />
      </div>
    );
  } else if (rank === 3) {
    return (
      <div className="flex justify-center items-center w-10 h-10">
        <Award className="w-7 h-7 text-amber-700" />
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center w-10 h-10">
      <span className="text-xl font-bold">{rank}</span>
    </div>
  );
};

export default function PointsPage() {
  // In a real app, this would come from authentication
  const currentUserId = 3; // Mock logged in user ID
  const [activeTab, setActiveTab] = useState<string>("overall");

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
  const currentUser = users?.find(user => user.id === currentUserId);
  const totalUsers = 135424; // Mock value for total users in leaderboard

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-black text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Score Leaderboard</h1>
          <p className="text-gray-400 mb-6">Climb the ranks, showcase your expertise</p>
          
          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-2">Filter by:</p>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-gray-900 grid grid-cols-4 h-12">
                <TabsTrigger value="overall" className="data-[state=active]:bg-gray-800">Overall</TabsTrigger>
                <TabsTrigger value="dev" className="data-[state=active]:bg-gray-800">Dev</TabsTrigger>
                <TabsTrigger value="on-chain" className="data-[state=active]:bg-gray-800">On-Chain</TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-gray-800">Social</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* User standing section */}
        <div>
          <h2 className="text-xl font-bold mb-2">Your Standing</h2>
          <p className="text-gray-400 text-sm mb-4">Compared to others</p>
          
          {currentUser ? (
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">{currentUser.rank}</span>
                  <div className="h-10 w-10 bg-green-500 rounded-md mr-2 flex items-center justify-center">
                    <span className="text-black font-bold">{currentUser.username.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{currentUser.username}</span>
                </div>
                <span className="font-bold text-xl">{formatNumber(currentUser.points)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <p className="text-gray-400">Sign in to see your position on the leaderboard</p>
            </div>
          )}
        </div>

        {/* Leaderboard section */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold">Leaderboard</h2>
            <p className="text-gray-400 text-sm">{formatNumber(totalUsers)} centurions</p>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 bg-gray-900 rounded-lg">
              Failed to load leaderboard. Please try again later.
            </div>
          ) : (
            <div className="space-y-2">
              {users?.slice(0, 10).map((user) => {
                const isCurrentUser = user.id === currentUserId;
                return (
                  <div 
                    key={user.id} 
                    className={`flex items-stretch bg-gray-900 rounded-lg overflow-hidden 
                    ${isCurrentUser ? "border border-yellow-500" : ""}`}
                  >
                    <div className="w-16 bg-gray-800 flex items-center justify-center">
                      <RankBadge rank={user.rank || 0} />
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-between relative overflow-hidden">
                      {/* Diagonal lines for design */}
                      <div className="absolute right-0 top-0 bottom-0 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-[2px] h-full bg-gray-800 transform rotate-[20deg] ml-4"
                            style={{ height: '200%' }}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center z-10">
                        <Link href="/user-score" className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center">
                            <span className="font-bold text-lg">{user.username.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {isCurrentUser ? "You" : "Legion member"}
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="text-right z-10 font-bold text-lg">
                        {formatNumber(user.points)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}