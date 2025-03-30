import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2Icon, Award, Target, Check } from "lucide-react";
import { type User, type PointTransaction } from "@shared/schema";
import { formatNumber } from "@/lib/formatters";

// Define achievement types
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  acquired: boolean;
}

export default function UserScorePage() {
  // In a real app, this would be fetched from authentication state
  const username = "cryptowhale";
  const userId = 1;

  // User stats - in a real app, these would be calculated from actual transaction data
  const userStats = {
    projectsFunded: 5,
    participatedRounds: 3,
    tokensByProject: [
      { name: "SAFE", amount: 40 },
      { name: "LSWP", amount: 80 },
      { name: "NEXUS", amount: 0 }
    ],
    totalPoints: 12450
  };

  // Achievement definitions
  const achievements: Achievement[] = [
    {
      id: "multiSeason",
      name: "Multi-Seasons",
      description: "Supporting projects across multiple seasons",
      icon: <Award className="h-8 w-8 text-[color:var(--color-peach)]" />,
      acquired: true
    },
    {
      id: "multiProject",
      name: "Multi-Projects",
      description: "Supported multiple projects in one round!",
      icon: <Target className="h-8 w-8 text-[color:var(--color-peach)]" />,
      acquired: true
    },
    {
      id: "claimed",
      name: "Claimed!",
      description: "Only for users who have claimed their tokens",
      icon: <Check className="h-8 w-8 text-[color:var(--color-peach)]" />,
      acquired: false
    }
  ];

  // User data and transactions from the API
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await res.json() as User[];
      const user = data.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }
  });

  // User transactions from the API
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'transactions'],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/transactions`);
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return await res.json() as PointTransaction[];
    }
  });

  const isLoading = userLoading || transactionsLoading;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-[color:var(--color-light-gray)]">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold mb-2 text-[color:var(--color-black)]">Your q/acc Points</h1>
        </div>

        {isLoading ? (
          <div className="animate-pulse bg-white rounded-lg p-10 flex justify-center items-center">
            <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono']">Loading user data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-[color:var(--color-peach-100)]">
            <div className="p-6">
              <h2 className="text-xl font-['Tusker_Grotesk'] font-bold mb-4 text-[color:var(--color-black)]">{userData?.username || username}</h2>
              
              <div className="flex flex-col md:flex-row items-center md:items-start rounded-lg p-6 mb-4 bg-[color:var(--color-light-gray)]">
                {userData?.avatarUrl ? (
                  <img 
                    src={userData.avatarUrl} 
                    alt={userData.username} 
                    className="w-32 h-32 rounded-md object-cover border-2 border-[color:var(--color-peach)] mb-4 md:mb-0 md:mr-8"
                  />
                ) : (
                  <div className="w-32 h-32 bg-[color:var(--color-peach)] rounded-md mb-4 md:mb-0 md:mr-8 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{(userData?.username || username).charAt(0)}</span>
                  </div>
                )}
                
                <div className="text-center md:text-left">
                  <div className="text-8xl font-['Tusker_Grotesk'] font-bold text-[color:var(--color-black)]">
                    {formatNumber(userData?.points || userStats.totalPoints)}
                  </div>
                  <div className="text-xl font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mt-2">POINTS</div>
                  
                  <Button variant="outline" size="sm" className="mt-4 border-[color:var(--color-peach)] text-[color:var(--color-peach)] hover:bg-[color:var(--color-peach-100)]">
                    <Share2Icon className="h-4 w-4 mr-2" />
                    Share your score
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats section */}
            <div className="p-6 border-t border-[color:var(--color-peach-100)]">
              <h3 className="text-xl font-['Tusker_Grotesk'] font-bold mb-6 text-[color:var(--color-black)]">STATS</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[color:var(--color-light-gray)] rounded-lg p-4">
                  <h4 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">PROJECTS FUNDED</h4>
                  <div className="text-3xl font-bold text-[color:var(--color-black)]">
                    {transactions ? new Set(transactions.map(t => t.projectId)).size : userStats.projectsFunded}
                  </div>
                </div>
                
                <div className="bg-[color:var(--color-light-gray)] rounded-lg p-4">
                  <h4 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">ROUNDS PARTICIPATED</h4>
                  <div className="text-3xl font-bold text-[color:var(--color-black)]">
                    {userStats.participatedRounds}
                  </div>
                </div>
                
                <div className="bg-[color:var(--color-light-gray)] rounded-lg p-4">
                  <h4 className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-gray)] mb-2">TOKENS PER PROJECT</h4>
                  {transactions ? (
                    <div className="space-y-2">
                      {transactions.map((transaction, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">
                            {transaction.description.replace("Purchased ", "").replace(" tokens", "")}
                          </span>
                          <span className="font-bold text-[color:var(--color-black)]">
                            {transaction.tokenAmount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userStats.tokensByProject.map((project, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{project.name}</span>
                          <span className="font-bold text-[color:var(--color-black)]">{project.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements section */}
            <div className="p-6 border-t border-[color:var(--color-peach-100)]">
              <h3 className="text-xl font-['Tusker_Grotesk'] font-bold mb-6 text-[color:var(--color-black)]">q/acc ACHIEVEMENTS</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`rounded-lg p-4 flex flex-col border ${
                      achievement.acquired 
                        ? "border-[color:var(--color-peach)] bg-[color:var(--color-peach-100)]" 
                        : "border-[color:var(--color-gray)] bg-[color:var(--color-light-gray)] opacity-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3">
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="font-medium font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">
                          {achievement.name}
                        </h4>
                        <p className="text-xs font-['IBM_Plex_Mono'] text-[color:var(--color-gray)]">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}