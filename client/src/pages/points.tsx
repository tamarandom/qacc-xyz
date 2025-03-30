import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Medal, Award } from "lucide-react";
import { type User } from "@shared/schema";
import { formatNumber } from "@/lib/formatters";

// Component to render rank icons/badges
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600">
        <Crown className="h-4 w-4 mr-1" />
        1st
      </Badge>
    );
  } else if (rank === 2) {
    return (
      <Badge className="bg-slate-400 hover:bg-slate-500">
        <Medal className="h-4 w-4 mr-1" />
        2nd
      </Badge>
    );
  } else if (rank === 3) {
    return (
      <Badge className="bg-amber-700 hover:bg-amber-800">
        <Award className="h-4 w-4 mr-1" />
        3rd
      </Badge>
    );
  }
  
  return <Badge variant="outline">{rank}th</Badge>;
};

export default function PointsPage() {
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

  return (
    <div className="container mx-auto py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] font-bold tracking-wide uppercase text-[color:var(--color-black)] mb-4">
            Point Leaderboard
          </h1>
          <p className="text-[color:var(--color-gray)] font-['IBM_Plex_Mono'] max-w-2xl">
            Users earn points by purchasing tokens from projects in the accelerator program. The more tokens you buy, the higher your ranking!
          </p>
        </div>
        
        <Card className="border-[color:var(--color-light-gray)]">
          <CardHeader>
            <CardTitle>Top Token Holders</CardTitle>
            <CardDescription>
              Leaderboard updated in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16 ml-auto" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Failed to load leaderboard. Please try again later.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="font-['IBM_Plex_Mono'] text-xs uppercase">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id} className="font-['IBM_Plex_Mono']">
                      <TableCell>
                        <RankBadge rank={user.rank || 0} />
                      </TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-right">
                        <span className={user.rank && user.rank <= 3 ? "font-bold" : ""}>
                          {formatNumber(user.points)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 bg-[color:var(--color-light-gray)] rounded-lg p-6">
          <h2 className="font-['Tusker_Grotesk'] text-2xl font-bold mb-4 text-[color:var(--color-black)]">
            How to Earn Points
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-[color:var(--color-peach)] p-2 rounded-full mr-4">
                <span className="font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-['IBM_Plex_Mono'] font-bold text-[color:var(--color-black)]">
                  Browse Projects
                </h3>
                <p className="text-sm text-[color:var(--color-gray)]">
                  Explore the various projects in our accelerator program
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-[color:var(--color-peach)] p-2 rounded-full mr-4">
                <span className="font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-['IBM_Plex_Mono'] font-bold text-[color:var(--color-black)]">
                  Purchase Tokens
                </h3>
                <p className="text-sm text-[color:var(--color-gray)]">
                  Buy tokens from projects you believe in
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-[color:var(--color-peach)] p-2 rounded-full mr-4">
                <span className="font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-['IBM_Plex_Mono'] font-bold text-[color:var(--color-black)]">
                  Earn Points
                </h3>
                <p className="text-sm text-[color:var(--color-gray)]">
                  Automatically earn points based on your token purchases
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}