import { cn } from "@/lib/utils";

interface ProjectAvatarProps {
  name: string;
  bgColor?: string;
  textColor?: string;
  initials?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProjectAvatar({ 
  name, 
  bgColor = "bg-primary-100", 
  textColor = "text-primary-700",
  initials,
  imageUrl,
  size = "md",
  className
}: ProjectAvatarProps) {
  const displayInitials = initials || name.substring(0, 2).toUpperCase();
  
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl font-bold"
  };
  
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
      !imageUrl && bgColor,
      !imageUrl && textColor,
      sizeClasses[size],
      className
    )}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`${name} logo`} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
}
