import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2Icon, GlobeIcon, Lock, Thermometer, Zap } from "lucide-react";
import { type User } from "@shared/schema";
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
  const username = "Tam";
  const userId = 3;

  // Mock stats - in a real app, this would come from the API
  const userStats = {
    score: 783,
    title: "BALANCED INFLUENCER",
    dev: 680,
    degen: 600,
    clout: 710,
    kycFollowers: 202,
    totalFollowers: 1540,
    projectsFollowers: 46
  };

  // Mock achievements - in a real app these would come from the API
  const achievements: Achievement[] = [
    {
      id: "polyglot",
      name: "Polyglot",
      description: "Used 5 or more different blockchains",
      icon: <GlobeIcon className="h-8 w-8 text-gray-300" />,
      acquired: true
    },
    {
      id: "gnosis",
      name: "Gnosis User",
      description: "Made over 100 transactions on Gnosis Chain",
      icon: <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM11 6H13V14H11V6Z" 
          fill="#52C41A"/>
      </svg>,
      acquired: true
    },
    {
      id: "lawful",
      name: "Lawful Good",
      description: "Donated to Gitcoin grants",
      icon: <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z" 
          fill="#5E35B1"/>
      </svg>,
      acquired: true
    },
    {
      id: "safeSigner",
      name: "Safe Signer",
      description: "Signer on a Safe multisig",
      icon: <Lock className="h-8 w-8 text-green-500" />,
      acquired: true
    },
    {
      id: "ens",
      name: "ENS Elector",
      description: "Participated in ENS governance",
      icon: <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2ZM12 4.22L18 8.2V15.8L12 19.78L6 15.8V8.2L12 4.22Z" 
          fill="#627EEA"/>
      </svg>,
      acquired: true
    },
    {
      id: "optimism",
      name: "Optimism Tinkerer",
      description: "Interacted with over 100 smart contracts on Optimism",
      icon: <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" 
          fill="#FF4C3B"/>
      </svg>,
      acquired: true
    }
  ];

  // User position in leaderboard
  const { data: userPosition, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await res.json() as User[];
      const position = data.findIndex(user => user.id === userId);
      return position >= 0 ? position + 1 : null;
    }
  });

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-black text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Legion Score</h1>
          <p className="text-gray-400">Your investor score helps you get the opportunities that you deserve on LEGION.</p>
        </div>

        {/* User score card */}
        <div className="bg-[#0A0A0A] rounded-xl overflow-hidden">
          <div className="p-6 text-center">
            <h2 className="text-xl uppercase font-bold mb-4">{username}</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center bg-[#0F0F3D] rounded-xl p-6 mb-4">
              <div className="w-32 h-32 bg-gray-800 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-8">
                {/* Pixelated avatar */}
                <div className="w-full h-full bg-gradient-to-b from-green-500 to-blue-700"></div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-8xl font-bold">{userStats.score}</div>
                <div className="text-xl uppercase tracking-wide">{userStats.title}</div>
                
                <Button variant="outline" size="sm" className="mt-4 text-red-500 border-red-500 hover:bg-red-950">
                  <Share2Icon className="h-4 w-4 mr-2" />
                  Share legion score card
                </Button>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="p-6">
            <h3 className="text-xl uppercase font-bold mb-6">STATS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Triangle chart */}
              <div className="relative h-64 bg-gray-900 rounded-lg">
                <div className="absolute top-0 right-0 p-4 text-right">
                  <div className="flex items-center justify-end text-green-500 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>DEV</span>
                    <span className="ml-2">{userStats.dev}</span>
                  </div>
                  <div className="flex items-center justify-end text-yellow-500 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>DEGEN</span>
                    <span className="ml-2">{userStats.degen}</span>
                  </div>
                  <div className="flex items-center justify-end text-blue-500">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>CLOUT</span>
                    <span className="ml-2">{userStats.clout}</span>
                  </div>
                </div>
                
                {/* The triangle visualization would be a complex SVG in a real implementation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <polygon points="100,10 10,180 190,180" fill="none" stroke="#333" strokeWidth="2" />
                    <polygon points="100,60 60,140 140,140" fill="#2563EB" fillOpacity="0.5" />
                  </svg>
                </div>
              </div>
              
              {/* Stats boxes */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{formatNumber(userStats.kycFollowers)}</span>
                  <span className="text-xs text-center mt-1">KYC followers</span>
                </div>
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{formatNumber(userStats.totalFollowers)}</span>
                  <span className="text-xs text-center mt-1">Total followers</span>
                </div>
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{formatNumber(userStats.projectsFollowers)}</span>
                  <span className="text-xs text-center mt-1">Projects followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements section */}
          <div className="p-6">
            <h3 className="text-xl uppercase font-bold mb-6">LEGION ACHIEVEMENTS</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map(achievement => (
                <div key={achievement.id} className="bg-gray-900 rounded-lg p-4 flex flex-col">
                  <div className="flex items-start mb-2">
                    <div className="mr-3">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{achievement.name}</h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}