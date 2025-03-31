import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import PercentageChange from "@/components/ui/percentage-change";
import { formatCurrency } from "@/lib/formatters";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const isMobile = useIsMobile();

  return (
    <Card 
      className="relative overflow-hidden hover:shadow-lg border-[color:var(--border-color)] bg-[color:var(--card-background)] group cursor-pointer transition-all duration-300 ease-in-out hover:border-[color:var(--color-peach)] hover:scale-[1.02] hover:-translate-y-1 touch-manipulation"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-5">
        {/* Project header */}
        <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative shrink-0">
            <ProjectAvatar
              name={project.name}
              bgColor={project.avatarBg || "#FBBA80"}
              textColor={project.avatarColor || "#101010"}
              initials={project.avatarText || project.name.substring(0, 2)}
              imageUrl={project.imageUrl}
              size="md"
            />
            {project.isFeatured && (
              <div className="absolute -top-1 -right-1 bg-[color:var(--color-peach)] rounded-full w-4 h-4 flex items-center justify-center">
                <span className="text-[7px] text-[color:var(--color-black)] font-bold">⭐</span>
              </div>
            )}
            {project.isNew && (
              <div className="absolute top-0 left-0 bg-black text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold shadow-sm">
                NEW
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h3 className="font-medium text-[color:var(--text-primary)] font-['IBM_Plex_Mono'] group-hover:text-[color:var(--color-peach)] transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-xs text-[color:var(--text-secondary)] font-['IBM_Plex_Mono'] line-clamp-2">
                  {project.shortDescription}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className="text-xs font-['IBM_Plex_Mono'] uppercase border-[color:var(--color-peach)] text-[color:var(--text-primary)] group-hover:bg-[color:var(--color-peach-100)] transition-colors whitespace-nowrap"
              >
                {project.category}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Project metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-sm">
          {project.isNew ? (
            <div className="bg-[color:var(--color-gray-100)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors col-span-full dark:text-white">
              <p className="text-[color:var(--text-secondary)] text-xs font-['IBM_Plex_Mono'] uppercase">Token Launch Status</p>
              <p className="font-medium text-[color:var(--text-primary)] font-['IBM_Plex_Mono'] text-sm">DEX listing after this round</p>
            </div>
          ) : (
            <>
              <div className="bg-[color:var(--color-gray-100)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors dark:text-white">
                <p className="text-[color:var(--text-secondary)] text-xs font-['IBM_Plex_Mono'] uppercase">Price</p>
                <p className="font-medium text-[color:var(--text-primary)] font-['IBM_Plex_Mono'] text-sm truncate">{formatCurrency(project.price)}</p>
              </div>
              <div className="bg-[color:var(--color-gray-100)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors dark:text-white">
                <p className="text-[color:var(--text-secondary)] text-xs font-['IBM_Plex_Mono'] uppercase">24h</p>
                <PercentageChange value={project.change24h} />
              </div>
              <div className="bg-[color:var(--color-gray-100)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors dark:text-white">
                <p className="text-[color:var(--text-secondary)] text-xs font-['IBM_Plex_Mono'] uppercase">Market Cap</p>
                <p className="font-medium text-[color:var(--text-primary)] font-['IBM_Plex_Mono'] text-sm truncate">{formatCurrency(project.marketCap)}</p>
              </div>
              <div className="bg-[color:var(--color-gray-100)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors dark:text-white">
                <p className="text-[color:var(--text-secondary)] text-xs font-['IBM_Plex_Mono'] uppercase">Volume (24h)</p>
                <p className="font-medium text-[color:var(--text-primary)] font-['IBM_Plex_Mono'] text-sm truncate">{formatCurrency(project.volume24h)}</p>
              </div>
            </>
          )}
        </div>
        
        {/* View details button indicator */}
        {isMobile ? (
          <div className="absolute right-3 bottom-3 bg-[color:var(--color-peach)] text-[color:var(--color-black)] rounded-full p-1.5 shadow-md">
            <ArrowUpRight size={16} />
          </div>
        ) : (
          <div className="absolute right-3 bottom-3 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 bg-[color:var(--color-peach)] text-[color:var(--color-black)] rounded-full p-1.5 shadow-md">
            <ArrowUpRight size={16} />
          </div>
        )}
        
        {/* Mobile tap effect overlay */}
        <div className="absolute inset-0 bg-[color:var(--color-peach-50)] opacity-0 pointer-events-none sm:hidden active:opacity-30 transition-opacity"></div>
        
        {/* Hover effect overlay for non-mobile */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-[color:var(--color-peach-50)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block"></div>
      </CardContent>
    </Card>
  );
}
