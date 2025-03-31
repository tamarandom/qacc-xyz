import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Sparkles, Search, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectCard } from "@/components/projects/project-card";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_CATEGORIES } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import PercentageChange from "@/components/ui/percentage-change";
import { ProjectAvatar } from "@/components/ui/project-avatar";

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [, navigate] = useLocation();
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("marketCap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Fetch projects data
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Filtered projects based on search and category
  const [filteredNewProjects, setFilteredNewProjects] = useState<Project[]>([]);
  const [filteredLaunchedProjects, setFilteredLaunchedProjects] = useState<Project[]>([]);
  
  // Apply filtering to both new and launched projects
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setFilteredNewProjects([]);
      setFilteredLaunchedProjects([]);
      return;
    }
    
    // First filter by category and search (applies to both sections)
    const filterProjects = (projectList: Project[]) => {
      let filtered = [...projectList];
      
      // Apply category filter
      if (category !== 'all') {
        filtered = filtered.filter(project => 
          project.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          project => 
            project.name.toLowerCase().includes(query) || 
            project.tokenSymbol.toLowerCase().includes(query) ||
            project.tokenName.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    };
    
    // Filter new projects
    const newProjects = projects.filter(project => project.isNew);
    setFilteredNewProjects(filterProjects(newProjects));
    
    // Filter and sort launched projects
    const launchedProjects = projects.filter(project => !project.isNew);
    let filteredLaunched = filterProjects(launchedProjects);
    
    // Sort launched projects (sorting only applies to launched projects)
    filteredLaunched = filteredLaunched.sort((a, b) => {
      let result = 0;
      
      switch(sortBy) {
        case 'name':
          result = a.name.localeCompare(b.name);
          break;
        case 'volume24h':
          result = b.volume24h - a.volume24h;
          break;
        case 'price':
          result = b.price - a.price;
          break;
        default: // marketCap
          result = b.marketCap - a.marketCap;
      }
      
      return sortDirection === 'asc' ? -result : result;
    });
    
    setFilteredLaunchedProjects(filteredLaunched);
  }, [searchQuery, category, sortBy, sortDirection, projects]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
          THE FUTURE OF <span className="text-[color:var(--color-peach)]">TOKENIZATION</span>
        </h1>
        <p className="mt-3 font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] max-w-3xl">
          Browse through our portfolio of carefully selected Web3 startups participating in our Quadratic Accelerator program.
        </p>
      </div>
      
      {/* Filter Controls - Apply to both sections */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex space-x-2 mb-4 sm:mb-0">
          <Button
            variant={category === "all" ? "default" : "outline"}
            className={category === "all" 
              ? "bg-[color:var(--color-peach)] text-[color:var(--color-black)] hover:bg-[color:var(--color-peach-300)] border-none font-['IBM_Plex_Mono'] uppercase font-medium" 
              : "text-[color:var(--color-black-100)] border-[color:var(--color-gray-300)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)] font-['IBM_Plex_Mono'] uppercase font-medium"}
            onClick={() => setCategory("all")}
          >
            All Projects
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="text-[color:var(--color-black-100)] border-[color:var(--color-gray-300)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)] font-['IBM_Plex_Mono'] uppercase font-medium"
              >
                <span>{PROJECT_CATEGORIES.find(cat => cat.id === category && cat.id !== 'all')?.name || 'Categories'}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {PROJECT_CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
                <DropdownMenuItem 
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`
                    font-['IBM_Plex_Mono'] text-sm cursor-pointer
                    ${category === cat.id ? 'bg-[color:var(--color-peach-100)] text-[color:var(--color-black)]' : ''}
                  `}
                >
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[color:var(--color-black-100)]" />
            </div>
            <Input
              type="text"
              placeholder="Search projects or tokens..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 font-['IBM_Plex_Mono'] text-sm border-[color:var(--color-gray-300)] w-full sm:w-[260px]"
            />
          </div>
          
          <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <TabsList className="bg-[color:var(--color-light-gray)]">
              <TabsTrigger 
                value="grid"
                className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] text-[color:var(--color-black-100)]"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline font-['IBM_Plex_Mono'] text-xs">Grid</span>
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] text-[color:var(--color-black-100)]"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline font-['IBM_Plex_Mono'] text-xs">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* New Projects Section */}
      {!isLoading && filteredNewProjects.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[color:var(--color-peach)]" />
            <h2 className="text-2xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
              New Projects
            </h2>
            <div className="h-1 w-12 bg-[color:var(--color-peach)] mt-1 ml-2"></div>
          </div>
          <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : ""}`}>
            {viewMode === "grid" ? (
              filteredNewProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))
            ) : (
              <div className="overflow-hidden shadow-sm border border-[color:var(--color-gray-200)] md:rounded-lg mb-8 bg-white">
                <table className="min-w-full divide-y divide-[color:var(--color-gray-200)]">
                  <thead className="bg-[color:var(--color-light-gray)]">
                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Token</th>
                      <th className="px-6 py-3 text-left text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[color:var(--color-gray-200)]">
                    {filteredNewProjects.map((project) => (
                      <tr 
                        key={project.id} 
                        className="hover:bg-[color:var(--color-light-gray)] cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ProjectAvatar
                              name={project.name}
                              bgColor={project.avatarBg || "#FBBA80"}
                              textColor={project.avatarColor || "#101010"}
                              initials={project.avatarText || project.name.substring(0, 2)}
                              imageUrl={project.imageUrl}
                              size="sm"
                            />
                            <span className="ml-3 font-medium font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{project.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{project.tokenSymbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">Coming Soon</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Launched Projects Section with Sort Controls */}
      {!isLoading && filteredLaunchedProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
                Launched Projects
              </h2>
              <div className="h-1 w-12 bg-[color:var(--color-peach)] mt-1 ml-2"></div>
            </div>
            
            {/* Sort Controls - integrated with heading */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] hidden md:inline">Sort by:</span>
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[130px] md:w-[180px] font-['IBM_Plex_Mono'] text-sm border-[color:var(--color-gray-300)]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="font-['IBM_Plex_Mono']">
                  <SelectItem value="marketCap">Market Cap</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="volume24h">Volume</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="border-[color:var(--color-gray-300)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)]"
                title={sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              >
                {sortDirection === 'asc' ? 
                  <ChevronDown className="h-4 w-4 rotate-180" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLaunchedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden shadow-sm border border-[color:var(--color-gray-200)] md:rounded-lg mb-8 bg-white">
              <table className="min-w-full divide-y divide-[color:var(--color-gray-200)]">
                <thead className="bg-[color:var(--color-light-gray)]">
                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Token</th>
                    <th className="px-6 py-3 text-right text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">24h %</th>
                    <th className="px-6 py-3 text-right text-xs font-medium font-['IBM_Plex_Mono'] uppercase text-[color:var(--color-black-100)]">Market Cap</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[color:var(--color-gray-200)]">
                  {filteredLaunchedProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:bg-[color:var(--color-light-gray)] cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ProjectAvatar
                            name={project.name}
                            bgColor={project.avatarBg || "#FBBA80"}
                            textColor={project.avatarColor || "#101010"}
                            initials={project.avatarText || project.name.substring(0, 2)}
                            imageUrl={project.imageUrl}
                            size="sm"
                          />
                          <span className="ml-3 font-medium font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{project.tokenSymbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{formatCurrency(project.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <PercentageChange value={project.change24h} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{formatCurrency(project.marketCap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* No results */}
      {!isLoading && filteredNewProjects.length === 0 && filteredLaunchedProjects.length === 0 && (
        <div className="bg-white rounded-lg border border-[color:var(--color-gray-200)] p-10 text-center mt-10">
          <div className="flex flex-col items-center justify-center">
            <Search className="h-8 w-8 text-[color:var(--color-black-100)] mb-2" />
            <p className="text-[color:var(--color-black-100)] font-['IBM_Plex_Mono']">No projects found matching your search</p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery("")}
                className="text-[color:var(--color-peach)] font-['IBM_Plex_Mono'] hover:text-[color:var(--color-peach-300)] mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}