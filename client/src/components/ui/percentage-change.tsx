import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface PercentageChangeProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

export default function PercentageChange({ value, showIcon = true, className = '' }: PercentageChangeProps) {
  const isPositive = value >= 0;
  const textColor = isPositive ? 'text-green-600' : 'text-red-600';
  
  return (
    <span className={`flex items-center ${textColor} ${className}`}>
      {showIcon && (
        isPositive 
          ? <ArrowUpIcon className="mr-1 h-3 w-3" /> 
          : <ArrowDownIcon className="mr-1 h-3 w-3" />
      )}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
