import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface PercentageChangeProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

export default function PercentageChange({ value, showIcon = true, className = '' }: PercentageChangeProps) {
  const isPositive = value >= 0;
  // Using custom QACC brand colors for positive/negative
  const textColor = isPositive ? 'text-[color:var(--color-positive)]' : 'text-[color:var(--color-negative)]';
  
  return (
    <span className={`flex items-center justify-end ${textColor} ${className} font-['IBM_Plex_Mono'] font-medium w-full`}>
      {showIcon && (
        isPositive 
          ? <ArrowUpIcon className="mr-1 h-3 w-3" /> 
          : <ArrowDownIcon className="mr-1 h-3 w-3" />
      )}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
