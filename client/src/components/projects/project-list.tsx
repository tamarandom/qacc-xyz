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

export default function ProjectList() {
  const [_, navigate] = useLocation();
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("marketCap");
  
  const { data: projects = [], isLoading } = useQuery({
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
            onClick={() => setCategory("all")}
          >
            All Projects
          </Button>
          <Button
            variant={category === "defi" ? "default" : "outline"}
            onClick={() => setCategory("defi")}
          >
            DeFi
          </Button>
          <Button
            variant={category === "nft" ? "default" : "outline"}
            onClick={() => setCategory("nft")}
          >
            NFT
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select 
            value={sortBy} 
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="volume24h">Volume</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-8">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[50px] pl-4">#</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow 
                key={project.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <TableCell className="font-medium pl-4">{project.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <ProjectAvatar
                      name={project.name}
                      bgColor={project.avatarBg}
                      textColor={project.avatarColor}
                      initials={project.avatarText || project.name.substring(0, 2)}
                    />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-gray-500 text-xs">{project.shortDescription}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{project.tokenSymbol}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(project.price)}</TableCell>
                <TableCell className="text-right">
                  <PercentageChange value={project.change24h} />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(project.marketCap)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(project.volume24h)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{projects.length}</span> of <span className="font-medium">{projects.length}</span> results
            </p>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
