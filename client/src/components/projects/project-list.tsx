import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
import { ProjectAvatar } from "@/components/ui/project-avatar";
import PercentageChange from "@/components/ui/percentage-change";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { type Project } from "@shared/schema";

export default function ProjectList() {
  const [_, navigate] = useLocation();
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("marketCap");
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects', { category, sortBy }],
  });
  
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
          <Button
            variant={category === "defi" ? "default" : "outline"}
            className={category === "defi" 
              ? "bg-[color:var(--color-peach)] text-[color:var(--color-black)] hover:bg-[color:var(--color-peach-300)] border-none font-['IBM_Plex_Mono'] uppercase font-medium" 
              : "text-[color:var(--color-black-100)] border-[color:var(--color-gray-300)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)] font-['IBM_Plex_Mono'] uppercase font-medium"}
            onClick={() => setCategory("defi")}
          >
            DeFi
          </Button>
          <Button
            variant={category === "nft" ? "default" : "outline"}
            className={category === "nft" 
              ? "bg-[color:var(--color-peach)] text-[color:var(--color-black)] hover:bg-[color:var(--color-peach-300)] border-none font-['IBM_Plex_Mono'] uppercase font-medium" 
              : "text-[color:var(--color-black-100)] border-[color:var(--color-gray-300)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)] font-['IBM_Plex_Mono'] uppercase font-medium"}
            onClick={() => setCategory("nft")}
          >
            NFT
          </Button>
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
        </div>
      </div>
      
      <div className="overflow-hidden shadow-sm border border-[color:var(--color-gray-200)] md:rounded-lg mb-8 bg-white">
        <Table>
          <TableHeader className="bg-[color:var(--color-light-gray)]">
            <TableRow>
              <TableHead className="w-[50px] pl-4 font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">#</TableHead>
              <TableHead className="font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Project</TableHead>
              <TableHead className="font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Token</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Price</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">24h Change</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Market Cap</TableHead>
              <TableHead className="text-right font-['IBM_Plex_Mono'] uppercase text-xs text-[color:var(--color-black-100)]">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow 
                key={project.id} 
                className="hover:bg-[color:var(--color-light-gray)] cursor-pointer border-b border-[color:var(--color-gray-200)]"
                onClick={() => handleProjectClick(project.id)}
              >
                <TableCell className="font-medium pl-4 font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">{project.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <ProjectAvatar
                      name={project.name}
                      bgColor={project.avatarBg || "#FBBA80"}
                      textColor={project.avatarColor || "#101010"}
                      initials={project.avatarText || project.name.substring(0, 2)}
                    />
                    <div className="ml-4">
                      <div className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{project.name}</div>
                      <div className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono']">{project.shortDescription}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{project.tokenSymbol}</TableCell>
                <TableCell className="text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{formatCurrency(project.price)}</TableCell>
                <TableCell className="text-right">
                  <PercentageChange value={project.change24h} />
                </TableCell>
                <TableCell className="text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{formatCurrency(project.marketCap)}</TableCell>
                <TableCell className="text-right font-['IBM_Plex_Mono'] text-[color:var(--color-black)]">{formatCurrency(project.volume24h)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-white px-4 py-3 flex items-center justify-between border border-[color:var(--color-gray-200)] sm:px-6 rounded-lg shadow-sm">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">
              Showing <span className="font-medium text-[color:var(--color-black)]">1</span> to <span className="font-medium text-[color:var(--color-black)]">{projects.length}</span> of <span className="font-medium text-[color:var(--color-black)]">{projects.length}</span> results
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
