import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import PercentageChange from "@/components/ui/percentage-change";
import { formatCurrency } from "@/lib/formatters";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-[color:var(--color-gray-200)] bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start">
          <ProjectAvatar
            name={project.name}
            bgColor={project.avatarBg || "#FBBA80"}
            textColor={project.avatarColor || "#101010"}
            initials={project.avatarText || project.name.substring(0, 2)}
          />
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{project.name}</h3>
                <p className="text-xs text-[color:var(--color-black-100)] font-['IBM_Plex_Mono']">{project.shortDescription}</p>
              </div>
              <Badge 
                variant="outline" 
                className="text-xs font-['IBM_Plex_Mono'] uppercase border-[color:var(--color-peach)] text-[color:var(--color-black)]"
              >
                {project.category}
              </Badge>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Price</p>
                <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{formatCurrency(project.price)}</p>
              </div>
              <div>
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">24h</p>
                <PercentageChange value={project.change24h} />
              </div>
              <div>
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Market Cap</p>
                <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{formatCurrency(project.marketCap)}</p>
              </div>
              <div>
                <p className="text-[color:var(--color-black-100)] text-xs font-['IBM_Plex_Mono'] uppercase">Volume (24h)</p>
                <p className="font-medium text-[color:var(--color-black)] font-['IBM_Plex_Mono']">{formatCurrency(project.volume24h)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
