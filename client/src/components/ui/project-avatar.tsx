import { cn } from "@/lib/utils";

interface ProjectAvatarProps {
  name: string;
  bgColor?: string;
  textColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  tokenSymbol?: string;
}

export function ProjectAvatar({
  name,
  bgColor = "bg-primary/10",
  textColor = "text-primary",
  size = "md",
  tokenSymbol,
}: ProjectAvatarProps) {
  const sizes = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  // Display token symbol if available, otherwise use first letter of project name
  const displayText = tokenSymbol || (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div
      className={cn(
        "rounded-md flex items-center justify-center font-['IBM_Plex_Mono'] font-bold",
        bgColor,
        textColor,
        sizes[size]
      )}
    >
      {displayText}
    </div>
  );
}