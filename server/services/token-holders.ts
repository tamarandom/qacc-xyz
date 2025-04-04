import fetch from 'node-fetch';
import { fetchTokenHolders as fetchCovalentTokenHolders } from './covalent';

/**
 * Interface for token holder data
 */
export interface TokenHolderData {
  address: string;
  quantity?: string;
  balance?: string;
  percentage: number;
  value?: number;
  label?: string;
}

// Common known addresses with labels
const KNOWN_ADDRESSES: Record<string, string> = {
  // X23 token holders (these are example labels, replace with actual ones)
  '0x3d61b2176d998e3dad95b9b7807a1bc1b9528912': 'X23 Treasury',
  '0x5bbc6dbd4c8f35f082bb46c1db68e9c16f739c7e': 'LP Token',
  '0xd68ba883095ab91fc5b519dfc149d37ae139a5cc': 'Team Wallet',
  '0x07d195f0b14d71b69c1e9ed7a275e9a9bA2d2204': 'q/acc Multisig',
  '0xfc951782ff1e0083961f5a9b560e36fc2641cce0': 'Staking Contract',
  
  // CTZN token holders
  '0x7d36cce46dd2b0d3b00fa41d95a6574030cce2ca': 'CTZN Treasury',
  '0x9f06db332e30ca40040cba6aed8f231e312f37c0': 'LP Token',
  '0x0d26f318d4a4a0cb95e5ed5e26040084d8e9f91e': 'Team Wallet',
  
  // PRSM token holders
  '0xf41aaa7001aea7ab852be7a889818ec3e7391b94': 'PRSM Treasury',
  '0x8ed99e57b37deb710d48775d6743c5ccd045327e': 'LP Token',
  '0x4da5ee134de3c4ce759068452ff363c194a9d13a': 'Team Wallet',
  
  // GRNDT token holders
  '0x9c915c8c78bac667b544a4de95cc750f6b1e4ea9': 'GRNDT Treasury',
  '0x0cc703c1acd3d069e511b33e60c5e1a0cb713902': 'LP Token',
  '0x8a2f35213a3f79a49fd76708a8a2c40132bac32c': 'Team Wallet'
};

/**
 * Get token symbol from token address
 */
function getTokenSymbolFromAddress(tokenAddress: string): string {
  const normalizedAddress = tokenAddress.toLowerCase();
  
  if (normalizedAddress === TOKEN_ADDRESSES.X23.toLowerCase()) {
    return 'X23';
  } else if (normalizedAddress === TOKEN_ADDRESSES.CTZN.toLowerCase()) {
    return 'CTZN';
  } else if (normalizedAddress === TOKEN_ADDRESSES.PRSM.toLowerCase()) {
    return 'PRSM';
  } else if (normalizedAddress === TOKEN_ADDRESSES.GRID.toLowerCase()) {
    return 'GRNDT';
  }
  
  return 'UNKNOWN';
}

/**
 * Get current token price
 * This is a simplified function that should be replaced with actual price data
 */
function getTokenPrice(tokenSymbol: string): number {
  // Default price for testing
  return 0.09;
}

/**
 * Fetches token holders using Covalent API
 * Falls back to default data if API fails
 * 
 * @param tokenAddress - The contract address of the token
 * @returns An array of token holder data
 */
export async function fetchTokenHolders(tokenAddress: string): Promise<TokenHolderData[]> {
  try {
    // Lowercasing the address for consistency
    const normalizedAddress = tokenAddress.toLowerCase();
    const tokenSymbol = getTokenSymbolFromAddress(normalizedAddress);
    const tokenPrice = getTokenPrice(tokenSymbol);
    
    console.log(`Fetching token holders for ${tokenSymbol} from Covalent API`);
    
    // Try to fetch data from Covalent API
    const covalentHolders = await fetchCovalentTokenHolders(normalizedAddress, tokenSymbol, tokenPrice);
    
    if (covalentHolders.length > 0) {
      console.log(`Successfully fetched ${covalentHolders.length} holders from Covalent API`);
      
      // Add labels to known addresses
      return covalentHolders.map(holder => {
        const address = holder.address.toLowerCase();
        if (KNOWN_ADDRESSES[address]) {
          return { ...holder, label: KNOWN_ADDRESSES[address] };
        }
        return holder;
      });
    }
    
    console.warn(`Covalent API failed to return holders for ${tokenSymbol}, returning empty array`);
    return [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return [];
  }
}

/**
 * Returns default token holders when API fails
 * Using predefined data based on token address
 */
function getDefaultTokenHolders(tokenAddress: string): TokenHolderData[] {
  const address = tokenAddress.toLowerCase();
  
  // X23 token: 0xc530b75465ce3c6286e718110a7b2e2b64bdc860
  if (address === '0xc530b75465ce3c6286e718110a7b2e2b64bdc860') {
    return [
      { address: '0x3d61b2176d998e3dad95b9b7807a1bc1b9528912', percentage: 31.7 },
      { address: '0x5bbc6dbd4c8f35f082bb46c1db68e9c16f739c7e', percentage: 25.3 },
      { address: '0xd68ba883095ab91fc5b519dfc149d37ae139a5cc', percentage: 13.8 },
      { address: '0x07d195f0b14d71b69c1e9ed7a275e9a9bA2d2204', percentage: 9.5 },
      { address: '0xfc951782ff1e0083961f5a9b560e36fc2641cce0', percentage: 5.2 },
      { address: '0xb89a136cd7215bda400df81e8d4b1ca1e43f7af0', percentage: 2.8 },
      { address: '0x7e5df15ef063bc7b79adc0f5b57b446c4b051847', percentage: 1.9 },
      { address: '0x93d0f027bca44a5071a628d22e622ac16b5b263f', percentage: 1.4 },
      { address: '0x4b8a3d7b85ac57a6c4ad2d7822cec5b31e45e399', percentage: 0.9 },
      { address: '0x3f8cb3c7e11be8b604c69471dc483dd2eeb88c82', percentage: 0.7 }
    ];
  }
  
  // CTZN token: 0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607
  else if (address === '0x0d9b0790e97e3426c161580df4ee853e4a7c4607') {
    return [
      { address: '0x7d36cce46dd2b0d3b00fa41d95a6574030cce2ca', percentage: 35.2 },
      { address: '0x9f06db332e30ca40040cba6aed8f231e312f37c0', percentage: 22.7 },
      { address: '0x0d26f318d4a4a0cb95e5ed5e26040084d8e9f91e', percentage: 15.6 },
      { address: '0x07d195f0b14d71b69c1e9ed7a275e9a9bA2d2204', percentage: 8.3 },
      { address: '0xc4b2f992496376c3ecf93a213ac725755bd0058c', percentage: 4.9 },
      { address: '0x3a14e3b23dda1c0689501be897ca0e66e143c34a', percentage: 3.2 },
      { address: '0x1a5974433a1bf404b94b15a8b8c0d8ed97b1f0f0', percentage: 2.1 },
      { address: '0xeaa8132bd8f63559bc672cef7a9df59962f4f3a6', percentage: 1.8 },
      { address: '0x7d8158fcba51a0a7b9c532762e5c5b11dc1fba4e', percentage: 0.9 },
      { address: '0x94a536b92bdbc1879f10b236729b9022c35be5d2', percentage: 0.8 }
    ];
  }
  
  // PRSM token: 0x0b7a46e1af45e1eaadeed34b55b6fc00a85c7c68
  else if (address === '0x0b7a46e1af45e1eaadeed34b55b6fc00a85c7c68') {
    return [
      { address: '0xf41aaa7001aea7ab852be7a889818ec3e7391b94', percentage: 34.8 },
      { address: '0x8ed99e57b37deb710d48775d6743c5ccd045327e', percentage: 23.1 },
      { address: '0x4da5ee134de3c4ce759068452ff363c194a9d13a', percentage: 14.9 },
      { address: '0x07d195f0b14d71b69c1e9ed7a275e9a9bA2d2204', percentage: 8.7 },
      { address: '0x48f9f93ba55f697e48c8a49d6cbf7ee73b597c89', percentage: 4.2 },
      { address: '0x7429e094e9afb49d652479d942b88e3dfa287cd8', percentage: 2.5 },
      { address: '0x8e95761f35cde564addd26f2cc83796ff3c5c972', percentage: 1.6 },
      { address: '0x9b2ac0f77aab5ac30c9bf9e9a575f8e474a41e16', percentage: 1.2 },
      { address: '0x2c2ed910e7fe7dab9e0cd47c32c3c336f6e3c8a7', percentage: 0.7 },
      { address: '0xbc2de32089fc3c6c0ec1cc42eef9ddacc7a58b2a', percentage: 0.5 }
    ];
  }
  
  // GRNDT/GRID token: 0xfafb870f1918827fe57ca4b891124606eaa7e6bd
  else if (address === '0xfafb870f1918827fe57ca4b891124606eaa7e6bd') {
    return [
      { address: '0x9c915c8c78bac667b544a4de95cc750f6b1e4ea9', percentage: 32.5 },
      { address: '0x0cc703c1acd3d069e511b33e60c5e1a0cb713902', percentage: 24.6 },
      { address: '0x8a2f35213a3f79a49fd76708a8a2c40132bac32c', percentage: 15.3 },
      { address: '0x07d195f0b14d71b69c1e9ed7a275e9a9bA2d2204', percentage: 9.1 },
      { address: '0x7681c3fb93e9a7914d9a367d139e1886e0696dbb', percentage: 5.8 },
      { address: '0xdef1c0ded9bec7f1a1670819833240f027b25eff', percentage: 3.2 },
      { address: '0x27c20440f48f945a48ec01cbd0f3a878019eeef6', percentage: 2.1 },
      { address: '0x3ca35793c3d27d3f4ba18cc3d6cee9737f5a5539', percentage: 1.5 },
      { address: '0x9e60d520b71ab0d56a42ba979516a04f23f2caff', percentage: 0.9 },
      { address: '0x43f676e21c1ce08c85a07fd6b28d3e096c993c85', percentage: 0.4 }
    ];
  }
  
  // Default empty response for unknown tokens
  return [];
}

// Export token addresses for convenience
export const TOKEN_ADDRESSES = {
  X23: '0xc530b75465ce3c6286e718110a7b2e2b64bdc860',
  CTZN: '0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607',
  PRSM: '0x0b7a46E1af45E1EaadEeD34B55b6FC00A85c7c68',
  GRID: '0xfAFB870F1918827fe57Ca4b891124606EaA7e6bd'
};