/**
 * Covalent API service
 * Fetches token holder data from Covalent API
 */

import fetch from 'node-fetch';

// Define types for Covalent API responses
interface CovalentTokenHolderItem {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: null | string[];
  logo_url: string;
  address: string;
  balance: string;
  total_supply: string | null;
  block_height: number;
}

interface CovalentTokenHoldersResponse {
  data: {
    items: CovalentTokenHolderItem[];
    pagination: {
      has_more: boolean;
      page_number: number;
      page_size: number;
      total_count: number | null;
    };
    updated_at: string;
  };
  error: boolean;
  error_message: string | null;
  error_code: number | null;
}

// Token holder data type that our application uses
export interface TokenHolderDataType {
  address: string;
  quantity: string;
  percentage: number;
  value: number;
  label?: string;
}

/**
 * Fetches token holders data from the Covalent API
 * 
 * @param tokenAddress - The token contract address
 * @param tokenSymbol - The token symbol
 * @param tokenPrice - Current token price in USD
 * @returns Array of token holder data objects
 */
export async function fetchTokenHolders(
  tokenAddress: string,
  tokenSymbol: string,
  tokenPrice: number
): Promise<TokenHolderDataType[]> {
  try {
    const API_KEY = process.env.COVALENT_API_KEY;
    const CHAIN_ID = 137; // Polygon mainnet
    
    if (!API_KEY) {
      console.error('COVALENT_API_KEY is not set in environment variables');
      return [];
    }
    
    console.log(`Fetching token holders for ${tokenSymbol} from Covalent API`);
    console.log(`Using token address: ${tokenAddress}`);
    
    // Fetch token holders from Covalent API
    const url = `https://api.covalenthq.com/v1/${CHAIN_ID}/tokens/${tokenAddress}/token_holders/?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json() as CovalentTokenHoldersResponse;
    
    if (data.error) {
      console.error(`Covalent API error: ${data.error_message}`);
      return [];
    }
    
    if (!data.data || !data.data.items || data.data.items.length === 0) {
      console.log(`No token holders found for ${tokenSymbol}`);
      return [];
    }
    
    console.log(`Found ${data.data.items.length} holders for ${tokenSymbol}`);
    
    // Process token holders data
    const holders = data.data.items;
    
    // Calculate the total supply by summing all holder balances
    let totalSupply = 0;
    holders.forEach(holder => {
      // Convert to a large number without using BigInt for compatibility
      totalSupply += Number(holder.balance);
    });
    
    // Format the data to match our application's TokenHolderDataType
    const formattedHolders = holders.map(holder => {
      const balance = Number(holder.balance);
      const percentage = (balance * 100) / totalSupply;
      const quantity = formatTokenAmount(holder.balance, holder.contract_decimals);
      
      return {
        address: holder.address,
        quantity,
        percentage,
        value: parseFloat(quantity.replace(/,/g, '')) * tokenPrice,
        // No label by default, as per user request
      };
    });
    
    // Sort by percentage (descending)
    return formattedHolders.sort((a, b) => b.percentage - a.percentage);
  } catch (error) {
    console.error('Error fetching token holders from Covalent:', error);
    return [];
  }
}

/**
 * Format token amount from raw balance
 * 
 * @param rawBalance - The raw token balance as string
 * @param decimals - Number of decimals for the token
 * @returns Formatted token amount as string
 */
function formatTokenAmount(rawBalance: string, decimals: number): string {
  // Convert the balance to a number for calculation
  // Note: This may lose precision for very large numbers, but it's acceptable for display
  const balance = Number(rawBalance);
  
  // Calculate the divisor (10^decimals)
  const divisor = Math.pow(10, decimals);
  
  // Convert to decimal representation
  const decimalValue = balance / divisor;
  
  // Format the number with proper decimal places
  // For larger numbers (>=1), use 2 decimal places
  // For smaller numbers, use more decimal places to show significant digits
  let formattedValue: string;
  
  if (decimalValue >= 1) {
    formattedValue = decimalValue.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else {
    // Find first non-zero decimal place
    const decimalPlaces = Math.min(
      Math.max(2, -Math.floor(Math.log10(decimalValue)) + 2),
      6  // Maximum of 6 decimal places
    );
    
    formattedValue = decimalValue.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  }
  
  return formattedValue;
}