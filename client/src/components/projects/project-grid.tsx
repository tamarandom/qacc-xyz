import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Search, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectCard } from "@/components/projects/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { type Project } from "@shared/schema";
import { PROJECT_CATEGORIES } from "@/lib/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ProjectGrid() {
  const [_, navigate] = useLocation();
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("marketCap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Filter projects based on search query and category
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setFilteredProjects([]);
      return;
    }
    
    // First, filter by category
    let filtered = projects;
    if (category !== 'all') {
      filtered = filtered.filter(project => {
        // Check if project category contains the selected category ID
        return project.category.toLowerCase().includes(category.toLowerCase());
      });
    }
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.name.toLowerCase().includes(query) || 
          project.tokenSymbol.toLowerCase().includes(query) ||
          project.tokenName.toLowerCase().includes(query)
      );
    }
    
    // Sort projects
    filtered = [...filtered].sort((a, b) => {
      let result = 0;
      
      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortBy === 'volume24h') {
        result = b.volume24h - a.volume24h;
      } else if (sortBy === 'price') {
        result = b.price - a.price;
      } else {
        // Default: marketCap
        result = b.marketCap - a.marketCap;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? -result : result;
    });
    
    setFilteredProjects(filtered);
  }, [searchQuery, category, sortBy, sortDirection, projects]);
  
  // Handle project click
  const handleProjectClick = (id: number) => {
    navigate(`/projects/${id}`);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Filter and sort controls */}
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
        
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[color:var(--color-black-100)]" />
            </div>
            <Input
              type="text"
              placeholder="Search projects or tokens..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 font-['IBM_Plex_Mono'] text-sm border-[color:var(--color-gray-300)] w-full sm:w-[200px] md:w-[260px]"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">Sort by:</span>
            <Select 
              value={sortBy} 
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[180px] font-['IBM_Plex_Mono'] text-sm border-[color:var(--color-gray-300)]">
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
              {sortDirection === 'asc' ? (
                sortBy === 'name' ? <ArrowUpAZ className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
              ) : (
                sortBy === 'name' ? <ArrowDownAZ className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Project Grid View */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[color:var(--color-gray-200)] p-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <Search className="h-8 w-8 text-[color:var(--color-black-100)] mb-2" />
            <p className="text-[color:var(--color-black-100)] font-['IBM_Plex_Mono']">No projects found matching your search</p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery("")}
                className="text-[color:var(--color-peach)] font-['IBM_Plex_Mono'] hover:text-[color:var(--color-peach-300)]"
              >
                Clear search
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Results count */}
      {filteredProjects.length > 0 && (
        <div className="mt-6 text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">
          Showing <span className="font-medium text-[color:var(--color-black)]">{filteredProjects.length}</span> of <span className="font-medium text-[color:var(--color-black)]">{projects.length}</span> projects
          {(searchQuery || category !== 'all') && (
            <span className="ml-1">
              {category !== 'all' && (
                <Badge 
                  variant="outline"
                  className="ml-2 text-[10px] py-0 h-5 px-1.5 font-['IBM_Plex_Mono'] border-[color:var(--color-peach)] text-[color:var(--color-black)]"
                >
                  {PROJECT_CATEGORIES.find(cat => cat.id === category)?.name || category}
                </Badge>
              )}
              {searchQuery && (
                <Badge 
                  variant="outline"
                  className="ml-2 text-[10px] py-0 h-5 px-1.5 font-['IBM_Plex_Mono'] border-[color:var(--color-peach)] text-[color:var(--color-black)]"
                >
                  "{searchQuery}"
                </Badge>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}