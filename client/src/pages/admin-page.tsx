import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { formatRelative, format, addDays, addHours } from 'date-fns';

// Types
interface Project {
  id: number;
  name: string;
  tokenSymbol: string;
  status: string;
  description?: string;
}

interface FundingRound {
  id: number;
  projectId: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  tokenPrice: string;
  tokensAvailable: string;
  minimumInvestment?: string;
  maximumInvestment?: string;
  project?: {
    id: number;
    name: string;
    tokenSymbol: string;
    status: string;
  };
}

const AdminPage = () => {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('rounds');
  
  // Form state
  const [newRound, setNewRound] = useState({
    projectId: '',
    name: '',
    days: '7',
    hours: '0',
    tokenPrice: '0.069',
    tokensAvailable: '10000',
    minimumInvestment: '100',
    maximumInvestment: '5000'
  });

  const [updateRound, setUpdateRound] = useState({
    name: '',
    days: '',
    hours: '',
    tokenPrice: '',
    tokensAvailable: '',
    minimumInvestment: '',
    maximumInvestment: ''
  });

  // Fetch all rounds (admin endpoint)
  const { 
    data: rounds = [], 
    isLoading: isLoadingRounds,
    refetch: refetchRounds
  } = useQuery<FundingRound[]>({
    queryKey: ['/api/active-rounds/admin/rounds'],
    queryFn: getQueryFn({}),
    enabled: !!user && user.role === 'admin'
  });

  // Fetch available projects
  const { 
    data: projects = [],
    isLoading: isLoadingProjects
  } = useQuery<Project[]>({
    queryKey: ['/api/active-rounds/admin/available-projects'],
    queryFn: getQueryFn(),
    enabled: !!user && user.role === 'admin'
  });

  // Create new funding round
  const createRoundMutation = useMutation({
    mutationFn: async (roundData: typeof newRound) => {
      const response = await apiRequest('POST', '/api/active-rounds/admin/rounds', roundData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Funding round created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/active-rounds/admin/rounds'] });
      // Reset form
      setNewRound({
        projectId: '',
        name: '',
        days: '7',
        hours: '0',
        tokenPrice: '0.069',
        tokensAvailable: '10000',
        minimumInvestment: '100',
        maximumInvestment: '5000'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create funding round: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update funding round
  const updateRoundMutation = useMutation({
    mutationFn: async ({ roundId, data }: { roundId: number, data: any }) => {
      const response = await apiRequest('PUT', `/api/active-rounds/admin/rounds/${roundId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Funding round updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/active-rounds/admin/rounds'] });
      setSelectedRoundId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update funding round: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Toggle funding round status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ roundId, status }: { roundId: number, status: 'active' | 'inactive' }) => {
      const response = await apiRequest('PATCH', `/api/active-rounds/admin/rounds/${roundId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Funding round status updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/active-rounds/admin/rounds'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Handle form submission for creating a new round
  const handleCreateRound = (e: React.FormEvent) => {
    e.preventDefault();
    createRoundMutation.mutate(newRound);
  };

  // Handle form submission for updating a round
  const handleUpdateRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoundId) return;
    
    // Filter out empty fields
    const filteredData = Object.fromEntries(
      Object.entries(updateRound).filter(([_, value]) => value !== '')
    );
    
    updateRoundMutation.mutate({ 
      roundId: selectedRoundId, 
      data: filteredData 
    });
  };

  // When a round is selected for editing
  useEffect(() => {
    if (selectedRoundId && rounds) {
      const round = rounds.find((r: FundingRound) => r.id === selectedRoundId);
      if (round) {
        setUpdateRound({
          name: round.name,
          days: '',
          hours: '',
          tokenPrice: round.tokenPrice,
          tokensAvailable: round.tokensAvailable,
          minimumInvestment: round.minimumInvestment || '',
          maximumInvestment: round.maximumInvestment || ''
        });
      }
    }
  }, [selectedRoundId, rounds]);

  // Redirect if not admin
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="rounds" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="rounds">Funding Rounds</TabsTrigger>
          <TabsTrigger value="create">Create New Round</TabsTrigger>
        </TabsList>
        
        {/* Manage Funding Rounds */}
        <TabsContent value="rounds">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Funding Rounds</CardTitle>
                <CardDescription>View and manage all funding rounds</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRounds ? (
                  <div className="flex justify-center py-4">Loading rounds...</div>
                ) : rounds && rounds.length > 0 ? (
                  <div className="space-y-4">
                    {rounds.map((round: FundingRound) => (
                      <Card key={round.id} className={`border ${round.status === 'active' ? 'border-green-500' : 'border-gray-300'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-xl">{round.name}</CardTitle>
                              <CardDescription>
                                {round.project?.name} ({round.project?.tokenSymbol})
                              </CardDescription>
                            </div>
                            <Badge variant={round.status === 'active' ? 'default' : 'outline'}>
                              {round.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 pt-0">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p>{format(new Date(round.startDate), 'PPP')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p>{format(new Date(round.endDate), 'PPP')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Token Price</p>
                              <p>${parseFloat(round.tokenPrice).toFixed(4)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tokens Available</p>
                              <p>{parseInt(round.tokensAvailable).toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={round.status === 'active'} 
                              onCheckedChange={(checked) => {
                                toggleStatusMutation.mutate({ 
                                  roundId: round.id, 
                                  status: checked ? 'active' : 'inactive' 
                                });
                              }}
                            />
                            <Label>{round.status === 'active' ? 'Active' : 'Inactive'}</Label>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedRoundId(round.id);
                              setActiveTab('edit');
                            }}
                          >
                            Edit Round
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No funding rounds found
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  onClick={() => {
                    refetchRounds();
                    toast({
                      title: 'Refreshed',
                      description: 'Funding rounds refreshed',
                    });
                  }}
                >
                  Refresh
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Create New Round */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Funding Round</CardTitle>
              <CardDescription>Set up a new funding round for a project</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateRound}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select 
                      value={newRound.projectId}
                      onValueChange={(value) => setNewRound({...newRound, projectId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Projects</SelectLabel>
                          {isLoadingProjects ? (
                            <SelectItem value="" disabled>Loading projects...</SelectItem>
                          ) : projects && projects.length > 0 ? (
                            projects.map((project: Project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name} ({project.tokenSymbol}) - {project.status}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No projects available</SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Round Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Seed Round" 
                      value={newRound.name}
                      onChange={(e) => setNewRound({...newRound, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="days">Duration (Days)</Label>
                    <Input 
                      id="days" 
                      type="number" 
                      min="0"
                      placeholder="7" 
                      value={newRound.days}
                      onChange={(e) => setNewRound({...newRound, days: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hours">Duration (Additional Hours)</Label>
                    <Input 
                      id="hours" 
                      type="number" 
                      min="0" 
                      max="23"
                      placeholder="0" 
                      value={newRound.hours}
                      onChange={(e) => setNewRound({...newRound, hours: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Round will end: {" "}
                      <strong>
                        {format(
                          addHours(
                            addDays(
                              new Date(), 
                              parseInt(newRound.days) || 0
                            ), 
                            parseInt(newRound.hours) || 0
                          ), 
                          'PPP pp'
                        )}
                      </strong>
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenPrice">Token Price (USD)</Label>
                    <Input 
                      id="tokenPrice" 
                      type="number" 
                      step="0.000001"
                      min="0"
                      placeholder="0.069" 
                      value={newRound.tokenPrice}
                      onChange={(e) => setNewRound({...newRound, tokenPrice: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tokensAvailable">Tokens Available</Label>
                    <Input 
                      id="tokensAvailable" 
                      type="number" 
                      min="1"
                      placeholder="10000" 
                      value={newRound.tokensAvailable}
                      onChange={(e) => setNewRound({...newRound, tokensAvailable: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumInvestment">Minimum Investment (USD)</Label>
                    <Input 
                      id="minimumInvestment" 
                      type="number" 
                      min="0"
                      placeholder="100" 
                      value={newRound.minimumInvestment}
                      onChange={(e) => setNewRound({...newRound, minimumInvestment: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maximumInvestment">Maximum Investment (USD)</Label>
                    <Input 
                      id="maximumInvestment" 
                      type="number" 
                      min="0"
                      placeholder="5000" 
                      value={newRound.maximumInvestment}
                      onChange={(e) => setNewRound({...newRound, maximumInvestment: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={createRoundMutation.isPending}
                >
                  {createRoundMutation.isPending ? 'Creating...' : 'Create Funding Round'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Edit Round */}
        <TabsContent value="edit">
          {selectedRoundId && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Funding Round</CardTitle>
                <CardDescription>
                  Update the settings for this funding round
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateRound}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Round Name</Label>
                    <Input 
                      id="edit-name" 
                      placeholder="e.g., Seed Round" 
                      value={updateRound.name}
                      onChange={(e) => setUpdateRound({...updateRound, name: e.target.value})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-days">Set New Duration (Days)</Label>
                      <Input 
                        id="edit-days" 
                        type="number" 
                        min="0"
                        placeholder="7" 
                        value={updateRound.days}
                        onChange={(e) => setUpdateRound({...updateRound, days: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-hours">Set New Duration (Additional Hours)</Label>
                      <Input 
                        id="edit-hours" 
                        type="number" 
                        min="0" 
                        max="23"
                        placeholder="0" 
                        value={updateRound.hours}
                        onChange={(e) => setUpdateRound({...updateRound, hours: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {(updateRound.days || updateRound.hours) && (
                    <div className="rounded-md bg-muted p-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          New end date will be: {" "}
                          <strong>
                            {format(
                              addHours(
                                addDays(
                                  new Date(), 
                                  parseInt(updateRound.days) || 0
                                ), 
                                parseInt(updateRound.hours) || 0
                              ), 
                              'PPP pp'
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-tokenPrice">Token Price (USD)</Label>
                      <Input 
                        id="edit-tokenPrice" 
                        type="number" 
                        step="0.000001"
                        min="0"
                        placeholder="0.069" 
                        value={updateRound.tokenPrice}
                        onChange={(e) => setUpdateRound({...updateRound, tokenPrice: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-tokensAvailable">Tokens Available</Label>
                      <Input 
                        id="edit-tokensAvailable" 
                        type="number" 
                        min="1"
                        placeholder="10000" 
                        value={updateRound.tokensAvailable}
                        onChange={(e) => setUpdateRound({...updateRound, tokensAvailable: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-minimumInvestment">Minimum Investment (USD)</Label>
                      <Input 
                        id="edit-minimumInvestment" 
                        type="number" 
                        min="0"
                        placeholder="100" 
                        value={updateRound.minimumInvestment}
                        onChange={(e) => setUpdateRound({...updateRound, minimumInvestment: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-maximumInvestment">Maximum Investment (USD)</Label>
                      <Input 
                        id="edit-maximumInvestment" 
                        type="number" 
                        min="0"
                        placeholder="5000" 
                        value={updateRound.maximumInvestment}
                        onChange={(e) => setUpdateRound({...updateRound, maximumInvestment: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setSelectedRoundId(null);
                      setActiveTab('rounds');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateRoundMutation.isPending}
                  >
                    {updateRoundMutation.isPending ? 'Updating...' : 'Update Funding Round'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;