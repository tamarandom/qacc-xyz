/**
 * This file contains the contract addresses for all tokens in the application.
 * It serves as a centralized repository for these addresses to ensure consistency
 * across different parts of the application.
 */

export const TOKEN_ADDRESSES = {
  /**
   * X23 Token Contract Address on Polygon
   * 
   * A working contract address that can be queried successfully with Covalent API
   */
  X23: '0xc530b75465ce3c6286e718110a7b2e2b64bdc860',

  /**
   * Citizen Wallet (CTZN) Token Contract Address on Polygon
   * 
   * A working contract address that can be queried successfully with Covalent API
   */
  CTZN: '0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607',

  /**
   * Prismo Technology (PRSM) Token Contract Address on Polygon
   * 
   * Note: This address currently returns "Contract not found" from Covalent API
   * The API may not have indexed this contract yet or it might be on a network
   * not supported by Covalent's free tier
   */
  PRSM: '0x0b7a46e1af45e1eaadeed34b55b6fc00a85c7c68',

  /**
   * Grand Timeline (GRNDT/GRID) Token Contract Address on Polygon
   * 
   * Note: This address currently returns "Contract not found" from Covalent API
   * The API may not have indexed this contract yet or it might be on a network
   * not supported by Covalent's free tier
   */
  GRID: '0xfafb870f1918827fe57ca4b891124606eaa7e6bd'
};

/**
 * GeckoTerminal and DexScreener Pool/Pair Addresses
 * 
 * These are the addresses used to fetch real-time price data
 * from GeckoTerminal and DexScreener APIs
 */
export const POOL_ADDRESSES = {
  X23_POOL_ADDRESS: '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838',
  X23_PAIR_ADDRESS: '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838',
  
  CTZN_POOL_ADDRESS: '0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8',
  CTZN_PAIR_ADDRESS: '0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8',
  
  GRNDT_POOL_ADDRESS: '0x460a8186aa4574c18709d1eff118efdaa5235c19',
  GRNDT_PAIR_ADDRESS: '0x460a8186aa4574c18709d1eff118efdaa5235c19',
  
  PRSM_POOL_ADDRESS: '0x4dc15edc968eceaec3a5e0f12d0acecacee05e25',
  PRSM_PAIR_ADDRESS: '0x4dc15edc968eceaec3a5e0f12d0acecacee05e25'
};

/**
 * QuickSwap Output Currency Addresses for Swap URLs
 */
export const SWAP_ADDRESSES = {
  X23: '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838',
  CTZN: '0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607',
  GRNDT: '0x460a8186aa4574c18709d1eff118efdaa5235c19',
  PRSM: '0x4dc15edc968eceaec3a5e0f12d0acecacee05e25'
};

/**
 * Helper function to get contract address by token symbol
 * 
 * @param symbol Token symbol (X23, CTZN, PRSM, GRID)
 * @returns Contract address for the specified token
 */
export function getContractAddress(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  if (TOKEN_ADDRESSES[upperSymbol]) {
    return TOKEN_ADDRESSES[upperSymbol];
  }
  throw new Error(`Contract address not found for symbol: ${symbol}`);
}

/**
 * Helper function to get pool address by token symbol
 * 
 * @param symbol Token symbol (X23, CTZN, PRSM, GRID/GRNDT)
 * @returns Pool address for the specified token
 */
export function getPoolAddress(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  
  if (upperSymbol === 'X23') {
    return POOL_ADDRESSES.X23_POOL_ADDRESS;
  } else if (upperSymbol === 'CTZN') {
    return POOL_ADDRESSES.CTZN_POOL_ADDRESS;
  } else if (upperSymbol === 'PRSM') {
    return POOL_ADDRESSES.PRSM_POOL_ADDRESS;
  } else if (upperSymbol === 'GRID' || upperSymbol === 'GRNDT') {
    return POOL_ADDRESSES.GRNDT_POOL_ADDRESS;
  }
  
  throw new Error(`Pool address not found for symbol: ${symbol}`);
}

/**
 * Helper function to get swap URL for a token
 * 
 * @param symbol Token symbol (X23, CTZN, PRSM, GRID/GRNDT)
 * @returns QuickSwap URL for the specified token
 */
export function getSwapUrl(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  let outputCurrency;
  
  if (upperSymbol === 'X23') {
    outputCurrency = SWAP_ADDRESSES.X23;
  } else if (upperSymbol === 'CTZN') {
    outputCurrency = SWAP_ADDRESSES.CTZN;
  } else if (upperSymbol === 'PRSM') {
    outputCurrency = SWAP_ADDRESSES.PRSM;
  } else if (upperSymbol === 'GRID' || upperSymbol === 'GRNDT') {
    outputCurrency = SWAP_ADDRESSES.GRNDT;
  } else {
    throw new Error(`Swap address not found for symbol: ${symbol}`);
  }
  
  return `https://quickswap.exchange/#/swap?outputCurrency=${outputCurrency}`;
}