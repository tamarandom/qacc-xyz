import { cn } from "@/lib/utils";

interface ProjectAvatarProps {
  name: string;
  bgColor?: string;
  textColor?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
}

export function ProjectAvatar({ 
  name, 
  bgColor = "bg-primary-100", 
  textColor = "text-primary-700",
  initials,
  size = "md"
}: ProjectAvatarProps) {
  const displayInitials = initials || name.substring(0, 2).toUpperCase();
  
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl font-bold"
  };
  
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center flex-shrink-0",
      bgColor,
      textColor,
      sizeClasses[size]
    )}>
      <span>{displayInitials}</span>
    </div>
  );
}
