import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "../lib/queryClient";
import { ArrowLeftCircle, RefreshCw, Key, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [usersData, setUsersData] = useState<any>(null);

  // We don't need this check anymore since we're using AdminRoute
  // if (!user || user.role !== 'admin') {
  //   setLocation("/");
  //   return null;
  // }

  const resetPasswordsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/reset-passwords");
      if (!response.ok) {
        throw new Error("Failed to reset passwords");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "All passwords have been reset to 'pass'",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/update-roles");
      if (!response.ok) {
        throw new Error("Failed to update user roles");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setUsersData(data);
      toast({
        title: "Success",
        description: "User roles have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResetPasswords = () => {
    resetPasswordsMutation.mutate();
  };

  const handleUpdateRoles = () => {
    updateRolesMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeftCircle className="h-5 w-5 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <h1 className="text-3xl font-['Tusker_Grotesk'] text-[color:var(--text-primary)]">
            ADMIN DASHBOARD
          </h1>
        </div>
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="users" className="text-sm font-['IBM_Plex_Mono']">USER MANAGEMENT</TabsTrigger>
          <TabsTrigger value="system" className="text-sm font-['IBM_Plex_Mono']">SYSTEM SETTINGS</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-['Tusker_Grotesk'] mb-4 text-[color:var(--text-primary)]">USER ROLES MANAGEMENT</h2>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4 font-['IBM_Plex_Mono']">
              This action will update user roles according to the following rules:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Set default users to regular role</li>
                <li>Create or maintain project owner accounts for each project</li>
                <li>Ensure Tam has admin role</li>
              </ul>
            </p>

            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="font-['IBM_Plex_Mono'] text-sm bg-[color:var(--card-background)] text-[color:var(--color-peach)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Update User Roles
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update User Roles</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will update all user roles in the system. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpdateRoles}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {usersData && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Updated User Information</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[color:var(--border-color)]">
                    <thead className="bg-[color:var(--border-color)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Role</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[color:var(--card-background)] divide-y divide-[color:var(--border-color)]">
                      {usersData.users.map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-[color:var(--color-peach-100)] text-[color:var(--color-peach)]' 
                                : user.role === 'project_owner'
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-['Tusker_Grotesk'] mb-4 text-[color:var(--text-primary)]">PASSWORD MANAGEMENT</h2>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4 font-['IBM_Plex_Mono']">
              Reset all user passwords to a default value. Use with caution.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="font-['IBM_Plex_Mono'] text-sm bg-[color:var(--card-background)] text-[color:var(--color-peach)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                  variant="outline"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Reset All Passwords
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Passwords</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset ALL user passwords to "pass". Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetPasswords}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-['Tusker_Grotesk'] mb-4 text-[color:var(--text-primary)]">CACHE MANAGEMENT</h2>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4 font-['IBM_Plex_Mono']">
              Coming soon: Tools to manage system cache and refresh market data.
            </p>

            <Button 
              className="font-['IBM_Plex_Mono'] text-sm bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
              variant="outline"
              disabled
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Market Data
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}