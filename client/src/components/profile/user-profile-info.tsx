import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, LogOut } from "lucide-react";

export function UserProfileInfo() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Card className="border border-[color:var(--border-color)]">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
            <span className="font-['IBM_Plex_Mono'] text-2xl font-bold">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : ""}
            </span>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {!user ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-48 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-['Tusker_Grotesk'] font-bold text-[color:var(--text-primary)]">
                  {user.username}
                </h2>
                <p className="text-[color:var(--text-secondary)] mb-2">
                  {user.email}
                </p>
                <p className="text-[color:var(--text-secondary)] text-sm mb-4">
                  Project backer since {new Date(user.createdAt).toLocaleDateString()}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-['IBM_Plex_Mono'] text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-['IBM_Plex_Mono'] text-xs text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}