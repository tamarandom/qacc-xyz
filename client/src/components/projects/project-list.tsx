import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, Filter, ArrowDownAZ, ArrowUpAZ, ArrowDownZA, ArrowUpZA } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import PercentageChange from "@/components/ui/percentage-change";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { type Project } from "@shared/schema";
import { PROJECT_CATEGORIES } from "@/lib/types";

interface ProjectListProps {
  filterOutNew?: boolean;
}

export default function ProjectList({ filterOutNew = false }: ProjectListProps = {}) {
  const [_, navigate] = useLocation();
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("marketCap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
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
    
    // Filter out new projects if requested
    if (filterOutNew) {
      filtered = filtered.filter(project => !project.isNew);
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(project => {
        // Check if project category contains the selected category ID
        // For example, if category is "defi", it should match "DeFi Staking", "DeFi Exchange", etc.
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
  }, [searchQuery, category, sortBy, sortDirection, projects, filterOutNew]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  const handleProjectClick = (id: number) => {
    navigate(`/projects/${id}`);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <>
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
      
      <div className="overflow-hidden shadow-sm border border-[color:var(--color-gray-200)] md:rounded-lg mb-8 bg-white">
        <Table>
          <TableHeader className="bg-[color:var(--color-light-gray)]">
            <TableRow>
              <TableHead className="font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Project</TableHead>
              <TableHead className="font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Ticker</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Price</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">24h Change</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Market Cap</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <TableRow 
                  key={project.id} 
                  className="hover:bg-[color:var(--color-light-gray)] cursor-pointer border-b border-[color:var(--color-gray-200)]"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center">
                      <ProjectAvatar
                        name={project.name}
                        bgColor={project.avatarBg || "#FBBA80"}
                        textColor={project.avatarColor || "#101010"}
                        initials={project.avatarText || project.name.substring(0, 2)}
                        imageUrl={project.imageUrl || undefined}
                      />
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{project.name}</div>
                          {project.isNew && (
                            <div className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold shadow-sm">
                              New
                            </div>
                          )}
                        </div>
                        <div className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono']">{project.shortDescription}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">
                    {project.isNew ? `$${project.tokenSymbol}` : project.tokenSymbol}
                  </TableCell>
                  <TableCell className="text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">
                    {project.isNew ? "-" : formatCurrency(project.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {project.isNew ? "-" : <PercentageChange value={project.change24h} />}
                  </TableCell>
                  <TableCell className="text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">
                    {project.isNew ? "$400,000" : formatCurrency(project.marketCap)}
                  </TableCell>
                  <TableCell className="text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">
                    {project.isNew ? "-" : formatCurrency(project.volume24h, true)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-white px-4 py-3 flex items-center justify-between border border-[color:var(--color-gray-200)] sm:px-6 rounded-lg shadow-sm">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">
              {filteredProjects.length > 0 ? (
                <>
                  Showing <span className="font-medium text-[color:var(--color-black)]">1</span> to <span className="font-medium text-[color:var(--color-black)]">{filteredProjects.length}</span> of <span className="font-medium text-[color:var(--color-black)]">{projects.length}</span> results
                  {searchQuery && (
                    <span className="ml-1 font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">
                      (filtered from <span className="font-medium text-[color:var(--color-black)]">{projects.length}</span> projects)
                    </span>
                  )}
                </>
              ) : (
                <>No results found</>
              )}
            </p>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" className="font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  isActive 
                  className="font-['IBM_Plex_Mono'] bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-[color:var(--color-peach)] hover:bg-[color:var(--color-peach-300)]"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  className="font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]"
                >
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  className="font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]"
                >
                  3
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" className="font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
