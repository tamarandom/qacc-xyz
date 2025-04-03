import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>Top Token Holders</CardTitle>
          <CardDescription>
            Showing the top addresses holding this token
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Token Holders</CardTitle>
          <CardDescription>
            Showing the top addresses holding this token
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load token holders</p>
        </CardContent>
      </Card>
    );
  }

  // If there are no holders, show a message
  if (!holders || holders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Token Holders</CardTitle>
          <CardDescription>
            Showing the top addresses holding this token
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No token holders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Token Holders</CardTitle>
        <CardDescription>
          Showing the top addresses holding this token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Holder</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holders.map((holder) => (
              <TableRow key={holder.address}>
                <TableCell>
                  <a 
                    href={getAddressUrl(holder.address)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {formatAddress(holder.address)}
                  </a>
                </TableCell>
                <TableCell className="text-right">{holder.percentage.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}