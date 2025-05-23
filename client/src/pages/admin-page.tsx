import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "../lib/queryClient";
import { 
  ArrowLeftCircle, 
  CalendarIcon, 
  CalendarDays, 
  Check, 
  Clock, 
  Key, 
  Plus, 
  RefreshCw, 
  ToggleLeft, 
  Users 
} from "lucide-react";
import { Link, useLocation } from "wouter";

// Define types for funding rounds and projects
interface RoundProject {
  id: number;
  roundId: number;
  projectId: number;
  projectName: string;
  tokenSymbol: string;
  tokenPrice: number;
  tokensAvailable: number;
  minimumInvestment: number;
  maximumInvestment: number;
}

interface FundingRound {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  projects: RoundProject[];
}

interface Project {
  id: number;
  name: string;
  status: string;
  tokenSymbol: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [usersData, setUsersData] = useState<any>(null);
  
  // State for funding round form
  const [createRoundOpen, setCreateRoundOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [roundName, setRoundName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [projectSettings, setProjectSettings] = useState<Array<{
    projectId: number;
    tokenPrice: string;
    tokensAvailable: string;
    minimumInvestment: string;
    maximumInvestment: string;
  }>>([]);
  
  // Functions for handling multiple project selection are defined below
  const [editRoundId, setEditRoundId] = useState<number | null>(null);
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined);
  const [editEndDate, setEditEndDate] = useState<Date | undefined>(undefined);

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
        description: "All passwords have been reset to 'thankyou'",
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
  
  // Query to fetch funding rounds
  const { 
    data: roundsData,
    isLoading: isLoadingRounds,
    refetch: refetchRounds
  } = useQuery({
    queryKey: ['/api/admin/funding-rounds'],
    queryFn: async () => {
      const response = await fetch('/api/admin/funding-rounds', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch funding rounds');
      }
      
      return await response.json();
    }
  });
  
  // Query to fetch all projects for selection
  const { 
    data: allProjects,
    isLoading: isLoadingProjects 
  } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      return await response.json();
    }
  });
  
  // Mutation to create a new funding round
  const createRoundMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      startDate: string;
      endDate: string;
      projects: Array<{
        projectId: number;
        tokenPrice: number;
        tokensAvailable: number;
        minimumInvestment: number;
        maximumInvestment: number;
      }>;
    }) => {
      const response = await apiRequest("POST", "/api/admin/funding-rounds/create", data);
      return await response.json();
    },
    onSuccess: () => {
      setCreateRoundOpen(false);
      setSelectedProjectIds([]);
      setRoundName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setProjectSettings([]);
      refetchRounds();
      toast({
        title: "Success",
        description: "Funding round created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to update a funding round's status
  const updateRoundStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'inactive' }) => {
      const response = await apiRequest("POST", `/api/admin/funding-rounds/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      refetchRounds();
      toast({
        title: "Success",
        description: "Funding round status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to update a funding round's dates
  const updateRoundDatesMutation = useMutation({
    mutationFn: async ({ id, startDate, endDate }: { id: number; startDate: string; endDate: string }) => {
      const response = await apiRequest("POST", `/api/admin/funding-rounds/${id}/dates`, { startDate, endDate });
      return await response.json();
    },
    onSuccess: () => {
      setEditRoundId(null);
      setEditStartDate(undefined);
      setEditEndDate(undefined);
      refetchRounds();
      toast({
        title: "Success",
        description: "Funding round dates updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Helper to add a project to the round
  const handleAddProject = (projectId: string) => {
    // Check if project is already added
    if (selectedProjectIds.includes(projectId)) {
      toast({
        title: "Info",
        description: "This project is already added to the round",
      });
      return;
    }
    
    // Get project details
    const project = allProjects?.find(
      (p: any) => p.id.toString() === projectId
    );
    
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
      return;
    }
    
    // Add project to selected projects
    setSelectedProjectIds([...selectedProjectIds, projectId]);
    
    // Add default settings for the project
    setProjectSettings([
      ...projectSettings,
      {
        projectId: parseInt(projectId),
        tokenPrice: "0.069",
        tokensAvailable: "100000",
        minimumInvestment: "50",
        maximumInvestment: "5000"
      }
    ]);
  };
  
  // Helper to remove a project from the round
  const handleRemoveProject = (projectId: number) => {
    setSelectedProjectIds(
      selectedProjectIds.filter(id => parseInt(id) !== projectId)
    );
    
    setProjectSettings(
      projectSettings.filter(setting => setting.projectId !== projectId)
    );
  };
  
  // Helper to update project settings
  const updateProjectSetting = (
    projectId: number, 
    field: 'tokenPrice' | 'tokensAvailable' | 'minimumInvestment' | 'maximumInvestment',
    value: string
  ) => {
    setProjectSettings(
      projectSettings.map(setting => 
        setting.projectId === projectId 
          ? { ...setting, [field]: value } 
          : setting
      )
    );
  };

  const handleCreateRound = () => {
    if (selectedProjectIds.length === 0 || !roundName || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one project",
        variant: "destructive",
      });
      return;
    }
    
    // Create projects array with settings
    const projects = projectSettings.map(setting => ({
      projectId: setting.projectId,
      tokenPrice: parseFloat(setting.tokenPrice),
      tokensAvailable: parseInt(setting.tokensAvailable),
      minimumInvestment: parseInt(setting.minimumInvestment),
      maximumInvestment: parseInt(setting.maximumInvestment)
    }));
    
    createRoundMutation.mutate({
      name: roundName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      projects
    });
  };
  
  const handleToggleRoundStatus = (round: FundingRound) => {
    const newStatus = round.status === 'active' ? 'inactive' : 'active';
    updateRoundStatusMutation.mutate({ id: round.id, status: newStatus });
  };
  
  const handleUpdateRoundDates = () => {
    if (!editRoundId || !editStartDate || !editEndDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    updateRoundDatesMutation.mutate({
      id: editRoundId,
      startDate: editStartDate.toISOString(),
      endDate: editEndDate.toISOString()
    });
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

      <Tabs defaultValue="rounds" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="rounds" className="text-sm font-['IBM_Plex_Mono']">ROUND MANAGEMENT</TabsTrigger>
          <TabsTrigger value="users" className="text-sm font-['IBM_Plex_Mono']">USER MANAGEMENT</TabsTrigger>
          <TabsTrigger value="system" className="text-sm font-['IBM_Plex_Mono']">SYSTEM SETTINGS</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-['Tusker_Grotesk'] mb-4 text-[color:var(--text-primary)]">USER ROLES MANAGEMENT</h2>
            <div className="text-sm text-[color:var(--text-secondary)] mb-4 font-['IBM_Plex_Mono']">
              <p className="mb-2">This action will update user roles according to the following rules:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Set default users to regular role</li>
                <li>Create or maintain project owner accounts for each project</li>
                <li>Ensure Tam has admin role</li>
              </ul>
            </div>

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
                    This will reset ALL user passwords to "thankyou". Are you sure you want to continue?
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

        <TabsContent value="rounds" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-['Tusker_Grotesk'] text-[color:var(--text-primary)]">FUNDING ROUNDS MANAGEMENT</h2>
            </div>

            <div className="text-sm text-[color:var(--text-secondary)] mb-6 font-['IBM_Plex_Mono']">
              <p>Manage funding rounds for projects in the accelerator program. Only one round can be active at a time.</p>
            </div>
            
            {/* Create New Round Form */}
            <Card className="mb-6 p-6 border border-[color:var(--border-color)]">
              <h3 className="text-lg font-['Tusker_Grotesk'] mb-4 text-[color:var(--text-primary)]">CREATE NEW FUNDING ROUND</h3>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">
                      Round Name
                    </Label>
                    <Input
                      id="name"
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      placeholder="e.g., Seed Round"
                    />
                  </div>
                  <div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "MMMM d, yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="w-[120px]">
                          <Input
                            id="startTime"
                            type="time"
                            className="h-10"
                            placeholder="Time"
                            value={startDate ? format(startDate, "HH:mm") : ""}
                            onChange={(e) => {
                              if (startDate) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(startDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setStartDate(newDate);
                              } else {
                                const now = new Date();
                                const [hours, minutes] = e.target.value.split(':');
                                now.setHours(parseInt(hours), parseInt(minutes));
                                setStartDate(now);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "MMMM d, yyyy") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="w-[120px]">
                          <Input
                            id="endTime"
                            type="time"
                            className="h-10"
                            placeholder="Time"
                            value={endDate ? format(endDate, "HH:mm") : ""}
                            onChange={(e) => {
                              if (endDate) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(endDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setEndDate(newDate);
                              } else {
                                const now = new Date();
                                const [hours, minutes] = e.target.value.split(':');
                                now.setHours(parseInt(hours), parseInt(minutes));
                                setEndDate(now);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label className="mb-2 block">
                    Select Projects for This Round
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {allProjects?.map((project: any) => {
                      const isSelected = selectedProjectIds.includes(project.id.toString());
                      const projectSetting = projectSettings.find(
                        (s) => s.projectId === project.id
                      );
                      
                      return (
                        <div 
                          key={project.id}
                          className={`border rounded-md p-3 ${isSelected ? 'border-[color:var(--color-peach)] bg-[color:var(--color-peach-10)]' : 'border-[color:var(--border-color)]'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`project-${project.id}`}
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    handleRemoveProject(project.id);
                                  } else {
                                    handleAddProject(project.id.toString());
                                  }
                                }}
                                className="mr-2 h-4 w-4 text-[color:var(--color-peach)] rounded border-[color:var(--border-color)]"
                              />
                              <label 
                                htmlFor={`project-${project.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {project.name} ({project.tokenSymbol})
                              </label>
                            </div>
                            
                            {project.status === 'pre-launch' && (
                              <Badge className="bg-[color:var(--color-peach-10)] text-[color:var(--color-peach)] hover:bg-[color:var(--color-peach-10)]">
                                NEW
                              </Badge>
                            )}
                          </div>
                          

                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleCreateRound}
                    disabled={createRoundMutation.isPending || selectedProjectIds.length === 0 || !roundName || !startDate || !endDate}
                    className="font-['IBM_Plex_Mono']"
                  >
                    {createRoundMutation.isPending ? "Creating..." : "Create Round"}
                  </Button>
                </div>
              </div>
            </Card>

            {isLoadingRounds ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[color:var(--color-peach)]"></div>
              </div>
            ) : roundsData?.rounds?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[color:var(--border-color)]">
                  <thead className="bg-[color:var(--border-color)]">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Round</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Start Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">End Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Projects</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[color:var(--text-secondary)] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[color:var(--card-background)] divide-y divide-[color:var(--border-color)]">
                    {roundsData.rounds.map((round: FundingRound) => (
                      <tr key={round.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">
                          {round.name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <Badge
                            className={round.status === 'active' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                          >
                            {round.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">
                          {format(new Date(round.startDate), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">
                          {format(new Date(round.endDate), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="px-3 py-4 text-sm text-[color:var(--text-primary)]">
                          <div className="flex flex-col gap-1">
                            {round.projects && round.projects.length > 0 ? (
                              round.projects.map((project: RoundProject) => (
                                <div key={project.id} className="flex items-center gap-2">
                                  <span className="font-medium">{project.projectName}</span>
                                  <span className="text-xs text-[color:var(--text-secondary)]">
                                    ({project.tokenSymbol}) - ${parseFloat(String(project.tokenPrice)).toFixed(4)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[color:var(--text-secondary)]">No projects</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleRoundStatus(round)}
                            disabled={updateRoundStatusMutation.isPending}
                            className="bg-[color:var(--card-background)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                          >
                            <ToggleLeft className="h-4 w-4 mr-1" />
                            {round.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          <Dialog open={editRoundId === round.id} onOpenChange={(open) => !open && setEditRoundId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditRoundId(round.id);
                                  setEditStartDate(new Date(round.startDate));
                                  setEditEndDate(new Date(round.endDate));
                                }}
                                className="bg-[color:var(--card-background)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                              >
                                <CalendarDays className="h-4 w-4 mr-1" />
                                Edit Dates
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Funding Round Dates</DialogTitle>
                                <DialogDescription>
                                  Update the start and end dates for "{round.name}" funding round.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="editStartDate">Start Date</Label>
                                  <div className="flex gap-2 items-center">
                                    <div className="flex-grow">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="editStartDate"
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editStartDate ? format(editStartDate, "MMMM d, yyyy") : "Select date"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <CalendarComponent
                                            mode="single"
                                            selected={editStartDate}
                                            onSelect={setEditStartDate}
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    
                                    <div className="w-[120px]">
                                      <Input
                                        id="editStartTime"
                                        type="time"
                                        className="h-10"
                                        placeholder="Time"
                                        value={editStartDate ? format(editStartDate, "HH:mm") : ""}
                                        onChange={(e) => {
                                          if (editStartDate) {
                                            const [hours, minutes] = e.target.value.split(':');
                                            const newDate = new Date(editStartDate);
                                            newDate.setHours(parseInt(hours), parseInt(minutes));
                                            setEditStartDate(newDate);
                                          } else {
                                            const now = new Date();
                                            const [hours, minutes] = e.target.value.split(':');
                                            now.setHours(parseInt(hours), parseInt(minutes));
                                            setEditStartDate(now);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="editEndDate">End Date</Label>
                                  <div className="flex gap-2 items-center">
                                    <div className="flex-grow">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="editEndDate"
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editEndDate ? format(editEndDate, "MMMM d, yyyy") : "Select date"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <CalendarComponent
                                            mode="single"
                                            selected={editEndDate}
                                            onSelect={setEditEndDate}
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    
                                    <div className="w-[120px]">
                                      <Input
                                        id="editEndTime"
                                        type="time"
                                        className="h-10"
                                        placeholder="Time"
                                        value={editEndDate ? format(editEndDate, "HH:mm") : ""}
                                        onChange={(e) => {
                                          if (editEndDate) {
                                            const [hours, minutes] = e.target.value.split(':');
                                            const newDate = new Date(editEndDate);
                                            newDate.setHours(parseInt(hours), parseInt(minutes));
                                            setEditEndDate(newDate);
                                          } else {
                                            const now = new Date();
                                            const [hours, minutes] = e.target.value.split(':');
                                            now.setHours(parseInt(hours), parseInt(minutes));
                                            setEditEndDate(now);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  type="submit" 
                                  onClick={handleUpdateRoundDates}
                                  disabled={updateRoundDatesMutation.isPending}
                                  className="font-['IBM_Plex_Mono']"
                                >
                                  {updateRoundDatesMutation.isPending ? "Updating..." : "Update Dates"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-[color:var(--text-secondary)]">
                <p className="mb-4">No funding rounds found.</p>
                <p>Create a new funding round using the button above.</p>
              </div>
            )}
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