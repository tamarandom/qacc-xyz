import { useState, useEffect } from 'react';
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
}

export function TokenHolders({ projectId }: { projectId: number }) {
  const { data: holders, isLoading, error } = useQuery<TokenHolder[]>({
    queryKey: [`/api/projects/${projectId}/token-holders`],
    enabled: !!projectId
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

  // If there are no holders, show a message
  if (!holders || holders.length === 0) {
    return (
      <p className="text-muted-foreground py-3">No token holders found</p>
    );
  }

  return (
    <div className="pt-2">
      <Table>
        <TableHeader className="hidden">
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holders.map((holder) => (
            <TableRow key={holder.address}>
              <TableCell className="py-3">
                <a 
                  href={getAddressUrl(holder.address)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-peach)] hover:text-[color:var(--color-peach-dark)] font-mono"
                >
                  {formatAddress(holder.address)}
                </a>
              </TableCell>
              <TableCell className="text-right py-3 text-gray-900 dark:text-white font-semibold">
                {holder.percentage.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}