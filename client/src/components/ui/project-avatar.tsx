import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// List of emojis that can be used for projects
const PROJECT_EMOJIS = [
  '🚀', '🔐', '🌐', '💰', '🔄', '📊', '🏦', '⚡', 
  '🔗', '📱', '💸', '🌍', '💼', '🛡️', '💹', '🤖',
  '💻', '🧩', '🔍', '💡', '🛒', '📈', '🔑', '📝'
];

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
  const [emoji, setEmoji] = useState('🚀'); // Default emoji
  
  // Generate a deterministic emoji based on the project name
  useEffect(() => {
    // Sum the char codes to get a number from the name
    const nameSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    // Use the sum to pick an emoji from the list
    const emojiIndex = nameSum % PROJECT_EMOJIS.length;
    setEmoji(PROJECT_EMOJIS[emojiIndex]);
  }, [name]);
  
  // Size classes for emojis need larger text sizes
  const sizeClasses = {
    sm: "h-8 w-8 text-base",
    md: "h-10 w-10 text-lg",
    lg: "h-16 w-16 text-2xl"
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
      <div className="relative z-10 flex items-center justify-center h-full">
        {imageUrl && !imageFailed ? (
          <img 
            src={imageUrl} 
            alt={`${name} logo`} 
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="flex items-center justify-center" style={{ lineHeight: 1 }}>
            {emoji}
          </span>
        )}
      </div>
    </div>
  );
}
