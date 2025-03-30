import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProjectAvatarProps {
  name: string;
  bgColor?: string;
  textColor?: string;
  initials?: string;
  imageUrl?: string | null;
  tokenSymbol?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Token icon mapping - if we have a token symbol, we'll use a specific icon
const TOKEN_ICONS: Record<string, number> = {
  // First row
  "USD": 0, // Dollar sign
  "AXS": 1, // Arrow icon
  "ALB": 2, // Potion/flask icon
  "LEAF": 3, // Leaf icon
  
  // Second row
  "CUBE": 4, // Cube/blocks
  "ORBIT": 5, // Eye icon
  "TELE": 6, // Telegram-like icon
  "STAR": 7, // Star icon
  
  // Third row
  "BOLT": 8, // Lightning bolt
  "GLOBE": 9, // Globe/earth icon
  "FOX": 10, // Fox icon
  "COIN": 11 // Circular coin icon
};

// Default icons to use if no matching token symbol
const DEFAULT_ICON_INDEXES = [0, 1, 4, 6, 7, 8, 9, 11];

export function ProjectAvatar({ 
  name, 
  bgColor = "bg-primary-100", 
  textColor = "text-primary-700",
  initials,
  imageUrl,
  tokenSymbol,
  size = "md",
  className
}: ProjectAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  
  // Display token symbol if provided, otherwise first letter of project name
  const displayText = tokenSymbol || name.charAt(0).toUpperCase();
  
  // Size classes for token symbols
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-base"
  };
  
  // Reset image states when the imageUrl changes
  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [imageUrl]);
  
  // Function to get icon index based on token symbol or name
  const getIconIndex = (): number => {
    if (tokenSymbol && TOKEN_ICONS[tokenSymbol.toUpperCase()]) {
      return TOKEN_ICONS[tokenSymbol.toUpperCase()];
    }
    
    // If no matching token symbol, use a deterministic icon based on the project name
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return DEFAULT_ICON_INDEXES[nameHash % DEFAULT_ICON_INDEXES.length];
  };
  
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
        "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative",
        bgColor?.startsWith('bg-') ? bgColor : "",
        textColor?.startsWith('text-') ? textColor : "",
        sizeClasses[size],
        className
      )}
      style={{
        ...bgColor?.startsWith('#') ? bgStyle : {},
        ...textColor?.startsWith('#') ? textStyle : {}
      }}
    >
      {/* Background with fixed coloring */}
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: bgColor?.startsWith('#') ? bgColor : "#FBBA80" }}></div>

      {/* Transparent green overlapping area at top left */}
      <div className="absolute top-0 left-0 h-1/3 w-1/3 bg-green-400 opacity-30 rounded-tl-full"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full w-full">
        {imageUrl && !imageFailed ? (
          <img 
            src={imageUrl} 
            alt={`${name} logo`} 
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/images/token-icons/token-grid.png"
              alt={tokenSymbol || name}
              className="absolute w-[1200%] h-[1200%] max-w-none max-h-none object-cover"
              style={{ 
                // Calculate position based on icon index (4 columns x 3 rows)
                // Each icon is 25% of the width and 33.33% of the height
                top: `${-100 * (Math.floor(getIconIndex() / 4))}%`, 
                left: `${-100 * (getIconIndex() % 4)}%`,
                transform: 'scale(0.083333)' // 1/12 to show just one icon
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
