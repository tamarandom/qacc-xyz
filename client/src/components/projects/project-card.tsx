import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import PercentageChange from "@/components/ui/percentage-change";
import { formatCurrency } from "@/lib/formatters";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card 
      className="relative overflow-hidden hover:shadow-lg border-[color:var(--color-gray-200)] bg-white group cursor-pointer transition-all duration-300 ease-in-out hover:border-[color:var(--color-peach)] hover:scale-[1.02] hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Project header */}
        <div className="flex flex-col sm:flex-row sm:items-start">
          <div className="flex items-start">
            <div className="relative">
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
                <div className="absolute -top-1 -left-1 bg-[color:var(--color-black)] text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold">
                  New
                </div>
              )}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono'] group-hover:text-[color:var(--color-peach)] transition-colors">{project.name}</h3>
                  <p className="text-xs text-[color:var(--color-black-100)] font-['IBM_Plex_Mono'] line-clamp-2">{project.shortDescription}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 ml-0 sm:ml-auto">
            <Badge 
              variant="outline" 
              className="text-xs font-['IBM_Plex_Mono'] uppercase border-[color:var(--color-peach)] text-[color:var(--color-black)] group-hover:bg-[color:var(--color-peach-100)] transition-colors"
            >
              {project.category}
            </Badge>
          </div>
        </div>
        
        {/* Project metrics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {project.isNew ? (
            <div className="bg-[color:var(--color-light-gray)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors col-span-full">
              <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Token Launch Status</p>
              <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">Coming Soon - First Round</p>
            </div>
          ) : (
            <>
              <div className="bg-[color:var(--color-light-gray)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors">
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Price</p>
                <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{formatCurrency(project.price)}</p>
              </div>
              <div className="bg-[color:var(--color-light-gray)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors">
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">24h</p>
                <PercentageChange value={project.change24h} />
              </div>
              <div className="bg-[color:var(--color-light-gray)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors">
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Market Cap</p>
                <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{formatCurrency(project.marketCap)}</p>
              </div>
              <div className="bg-[color:var(--color-light-gray)] p-2 rounded-md group-hover:bg-[color:var(--color-peach-50)] transition-colors">
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Volume (24h)</p>
                <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{formatCurrency(project.volume24h)}</p>
              </div>
            </>
          )}
        </div>
        
        {/* View details button indicator */}
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-[color:var(--color-peach)] text-[color:var(--color-black)] rounded-full p-1.5">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
