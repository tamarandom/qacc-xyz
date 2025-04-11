import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ProjectCardWithPurchase } from "@/components/projects/project-card-with-purchase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PROJECT_CATEGORIES } from "@/lib/types";
import { useFundingRound } from "@/hooks/use-funding-round";

export default function HomeWithFunding() {
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { activeRound } = useFundingRound();
  
  // Fetch projects
  const { data: projects, isLoading } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });
  
  // Filter projects:
  // 1. During active funding rounds, filter out pre-abc projects
  // 2. Apply category filter if not "all"
  // 3. Apply search filter
  const filteredProjects = projects?.filter(project => {
    // During active round, hide pre-abc projects
    if (activeRound && project.status === "pre-abc") {
      return false;
    }
    
    // Apply category filter unless "all" is selected
    const categoryMatch = category === "all" || project.categories.includes(category);
    
    // Apply search filter
    const search = searchQuery.toLowerCase();
    const searchMatch = search === "" || 
      project.name.toLowerCase().includes(search) || 
      project.symbol.toLowerCase().includes(search) || 
      project.description.toLowerCase().includes(search);
    
    return categoryMatch && searchMatch;
  });
  
  return (
    <>
      <Helmet>
        <title>q/acc - Web3 Accelerator</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="font-['Tusker_Grotesk'] text-4xl md:text-5xl font-bold mb-2">PROJECTS</h1>
            <p className="text-[color:var(--text-secondary)] font-['IBM_Plex_Mono'] text-sm">
              Discover and back innovative web3 projects in our accelerator program
            </p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[color:var(--text-secondary)]" />
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-9 bg-[color:var(--card-background)] border-[color:var(--border-color)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[160px] justify-between bg-[color:var(--card-background)] border-[color:var(--border-color)]">
                  <span>{PROJECT_CATEGORIES.find(cat => cat.id === category && cat.id !== 'all')?.name || 'Categories'}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[color:var(--card-background)] border-[color:var(--border-color)]">
                <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <DropdownMenuRadioItem 
                      key={cat.id}
                      value={cat.id}
                      className="cursor-pointer"
                    >
                      {cat.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Tabs defaultValue="grid" className="hidden lg:block" onValueChange={(v) => setView(v as "grid" | "list")}>
              <TabsList className="grid grid-cols-2 w-20 bg-[color:var(--border-color)]">
                <TabsTrigger value="grid" className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" x2="21" y1="6" y2="6" />
                    <line x1="8" x2="21" y1="12" y2="12" />
                    <line x1="8" x2="21" y1="18" y2="18" />
                    <line x1="3" x2="3.01" y1="6" y2="6" />
                    <line x1="3" x2="3.01" y1="12" y2="12" />
                    <line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Grid View */}
        <div className={`${view === 'grid' ? 'block' : 'hidden'}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[color:var(--card-background)] border border-[color:var(--border-color)] rounded-xl p-5">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[60px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-6" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-[60px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-[60px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects?.length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                  <p className="text-[color:var(--text-secondary)] text-lg">No projects found matching your filters.</p>
                </div>
              ) : (
                filteredProjects?.map((project) => (
                  <ProjectCardWithPurchase key={project.id} project={project} />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* List View - Mobile optimized version only shown on small screens */}
        <div className={`${view === 'list' ? 'block' : 'hidden'}`}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[color:var(--card-background)] border border-[color:var(--border-color)] rounded-xl p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                    <Skeleton className="h-8 w-[90px]" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[color:var(--text-secondary)] text-lg">No projects found matching your filters.</p>
                </div>
              ) : (
                filteredProjects?.map((project) => (
                  <div key={project.id} className="bg-[color:var(--card-background)] border border-[color:var(--border-color)] rounded-xl p-4">
                    <ProjectCardWithPurchase project={project} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}