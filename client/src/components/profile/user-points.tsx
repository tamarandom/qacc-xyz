import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export function UserPoints() {
  const { user } = useAuth();

  return (
    <Card className="border border-[color:var(--border-color)]">
      <CardHeader className="pb-3">
        <CardTitle className="font-['Tusker_Grotesk'] text-2xl font-bold">Q/ACC POINTS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-md flex items-center justify-center bg-[#6F4FE8]/20 text-[#6F4FE8]">
            <Award className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--text-secondary)]">
              TOTAL POINTS
            </div>
            {!user ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-3xl font-['Tusker_Grotesk'] font-bold text-[color:var(--text-primary)]">
                {user.points || 0}
              </div>
            )}
            <div className="text-xs text-[color:var(--text-secondary)] mt-1">
              Earned from backing projects and community activity
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}