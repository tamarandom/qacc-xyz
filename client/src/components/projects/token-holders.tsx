import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface TokenHolder {
  address: string;
  percentage: number;
  balance?: string | null;
  label?: string;
}

export function TokenHolders({ projectId }: { projectId: number }) {
  const { data: holders, isLoading, error } = useQuery<TokenHolder[]>({
    queryKey: [`/api/projects/${projectId}/token-holders`],
    enabled: !!projectId,
    // Setting a very short staleTime to ensure fresh data
    // while still preventing multiple simultaneous requests
    staleTime: 5 * 1000,
    // Always refetch when the component is mounted or window is focused
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Format the address to show only first few characters
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Generate a Polygonscan URL for the address
  const getAddressUrl = (address: string) => {
    return `https://polygonscan.com/address/${address}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--color-peach)]" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive py-3">Failed to load token holders</p>
    );
  }

  // If there are no holders, show placeholders with dashes
  if (!holders || holders.length === 0) {
    return (
      <div className="pt-2">
        <Table className="border-collapse w-[200px] ml-auto">
          <TableHeader className="hidden">
            <TableRow>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i} className="border-b-0">
                <TableCell className="pt-2 pb-1 pl-0 pr-1">
                  <div className="flex flex-col">
                    <span className="font-mono text-gray-500">-</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pt-2 pb-1 pl-0 pr-0 text-gray-500 font-semibold">
                  -
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Only show top 10 holders
  const topHolders = holders.slice(0, 10);
  
  return (
    <div className="pt-2">
      <Table className="border-collapse w-[200px] ml-auto">
        <TableHeader className="hidden">
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topHolders.map((holder) => (
            <TableRow key={holder.address} className="border-b-0">
              <TableCell className="pt-2 pb-1 pl-0 pr-1">
                <div className="flex flex-col">
                  <a 
                    href={getAddressUrl(holder.address)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FBBA80] hover:text-[#E89E61] font-mono"
                  >
                    {formatAddress(holder.address)}
                  </a>
                  {holder.label && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {holder.label}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right pt-2 pb-1 pl-0 pr-0 text-inherit font-semibold">
                {holder.percentage.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}