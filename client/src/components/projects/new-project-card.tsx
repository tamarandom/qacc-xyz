import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Rocket, Calendar, Timer } from "lucide-react";

interface NewProjectCardProps {
  projectId: number;
  projectName: string;
  tokenSymbol: string;
  price: number;
  totalSupply: number;
  blockchain: string;
  tokenStandard: string;
}

/**
 * NewProjectCard Component
 * 
 * Displays information about new projects that haven't been launched on DEX yet.
 * This template follows the QACC brand guidelines and provides essential
 * token launch information in a visually appealing format.
 */
export function NewProjectCard({
  projectId,
  projectName,
  tokenSymbol,
  price,
  totalSupply,
  blockchain,
  tokenStandard
}: NewProjectCardProps) {
  return (
    <div className="mb-8">
      <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
        <CardHeader className="border-b border-gray-100 dark:border-[color:var(--color-black-200)]">
          <CardTitle className="flex items-center gap-2 text-xl font-tusker">
            <Rocket className="h-5 w-5 text-[color:var(--color-peach)]" />
            <span className="uppercase">Token Launch Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          {/* Status banner */}
          <div className="mb-6 bg-[color:var(--color-peach)]/10 border border-[color:var(--color-peach)]/20 rounded-md p-3 flex items-center">
            <div className="bg-[color:var(--color-peach)] rounded-full p-1 mr-3">
              <Rocket className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-medium">Token currently in accelerator phase. Will be listed on DEX after this round.</span>
          </div>
          
          {/* Key details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Project Stage</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Pre-sale Round</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Token Supply</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(totalSupply)}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Blockchain</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{blockchain}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Token Standard</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{tokenStandard}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Initial Token Price</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(price)}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Token Type</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Utility & Governance</span>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="mt-8 border-t border-gray-100 dark:border-[color:var(--color-black-200)] pt-6">
            <h4 className="text-lg font-medium mb-4 font-tusker">TOKEN LAUNCH TIMELINE</h4>
            
            <div className="space-y-6">
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)]">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h5 className="text-base font-medium mb-1">Accelerator Phase</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">April 1 - May 15, 2025</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Early backers can participate in the token pre-sale with fixed pricing.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)]">
                    <Timer className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h5 className="text-base font-medium mb-1">DEX Listing</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">May 20, 2025</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Token will be listed on QuickSwap with initial liquidity.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Participation CTA */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[color:var(--color-black-200)] text-center">
            <button className="px-6 py-2 text-base font-medium bg-[color:var(--color-peach)] text-black hover:bg-[color:var(--color-peach-dark)] rounded-md transition-colors shadow-md">
              Participate in Token Pre-sale
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              By participating, you agree to the token sale terms and conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}