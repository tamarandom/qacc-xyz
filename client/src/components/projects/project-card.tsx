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
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start">
          <ProjectAvatar
            name={project.name}
            bgColor={project.avatarBg}
            textColor={project.avatarColor}
            initials={project.avatarText || project.name.substring(0, 2)}
          />
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                <p className="text-xs text-gray-500">{project.shortDescription}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {project.category}
              </Badge>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Price</p>
                <p className="font-medium">{formatCurrency(project.price)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">24h</p>
                <PercentageChange value={project.change24h} />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Market Cap</p>
                <p className="font-medium">{formatCurrency(project.marketCap)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Volume (24h)</p>
                <p className="font-medium">{formatCurrency(project.volume24h)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
