import { cn } from "@/lib/utils";

interface ProjectBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export function ProjectBadge({
  children,
  variant = "default",
  className,
}: ProjectBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default"
          ? "bg-[color:var(--color-peach-100)] text-[color:var(--color-black)]"
          : "border border-[color:var(--color-peach)] text-[color:var(--color-black)]",
        className
      )}
    >
      {children}
    </span>
  );
}