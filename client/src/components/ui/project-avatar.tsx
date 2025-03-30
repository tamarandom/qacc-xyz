import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProjectAvatarProps {
  name: string;
  bgColor?: string;
  textColor?: string;
  initials?: string;
  imageUrl?: string | null;
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const displayInitials = initials || name.substring(0, 2).toUpperCase();
  
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl font-bold"
  };
  
  // Reset image states when the imageUrl changes
  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [imageUrl]);
  
  // Handle background styling
  let bgStyle = {};
  if (bgColor?.startsWith('#')) {
    bgStyle = { backgroundColor: bgColor };
  }
  
  // Handle text styling
  let textStyle = {};
  if (textColor?.startsWith('#')) {
    textStyle = { color: textColor };
  }
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
        bgColor?.startsWith('bg-') ? bgColor : "",
        textColor?.startsWith('text-') ? textColor : "",
        sizeClasses[size],
        className
      )}
      style={{
        ...(!imageUrl || !imageLoaded || imageFailed) && bgColor?.startsWith('#') ? bgStyle : {},
        ...(!imageUrl || !imageLoaded || imageFailed) && textColor?.startsWith('#') ? textStyle : {}
      }}
    >
      {imageUrl && !imageFailed ? (
        <img 
          src={imageUrl} 
          alt={`${name} logo`} 
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
}
