import fetch from 'node-fetch';

// GeckoTerminal API base URL
const GECKO_TERMINAL_API_BASE = 'https://api.geckoterminal.com/api/v2';

// X23 pool address on Polygon
export const X23_POOL_ADDRESS = '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838';
export const NETWORK_ID = 'polygon_pos';

/**
 * Interface for pool information from GeckoTerminal
 */
interface GeckoTerminalPoolResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      address: string;
      name: string;
      pool_created_at: string;
      fdv_usd: number;
      market_cap_usd: number;
      price_usd: number;
      price_native: number;
      volume_usd: {
        h24: number;
        h6: number;
        h1: number;
      };
      reserve_in_usd: number;
      token_price_usd: number;
      price_change_percentage: {
        h24: number;
        h6: number;
        h1: number;
      };
      transactions: {
        h24: {
          buys: number;
          sells: number;
        };
        h6: {
          buys: number;
          sells: number;
        };
        h1: {
          buys: number;
          sells: number;
        };
      };
      base_token_data: {
        id: string;
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        total_supply: string;
        price_usd: number;
        fdv_usd: number;
        market_cap_usd: number;
      };
      quote_token_data: {
        id: string;
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        price_usd: number;
      };
    };
  };
}

/**
 * Interface for price history data from GeckoTerminal
 */
interface GeckoTerminalOHLCVResponse {
  data: {
    attributes: {
      ohlcv_list: Array<[number, number, number, number, number, number]>; // [timestamp, open, high, low, close, volume]
    };
  };
}

/**
 * Interface for token holders from GeckoTerminal
 */
interface GeckoTerminalTokenHoldersResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      address: string;
      balance: string;
      percentage: number;
    };
  }>;
}

/**
 * Get pool information for X23 from GeckoTerminal
 * 
 * @returns Pool information with price, volume, etc.
 */
export async function getTokenStats(poolAddress: string = X23_POOL_ADDRESS, networkId: string = NETWORK_ID) {
  try {
    console.log(`Fetching pool stats from GeckoTerminal for ${poolAddress} on ${networkId}`);
    const response = await fetch(`${GECKO_TERMINAL_API_BASE}/networks/${networkId}/pools/${poolAddress}`);
    
    if (!response.ok) {
      console.error(`GeckoTerminal API returned status: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as GeckoTerminalPoolResponse;
    
    if (!data.data || !data.data.attributes) {
      console.error('Invalid data structure from GeckoTerminal');
      return null;
    }
    
    const attributes = data.data.attributes;
    
    if (!attributes.base_token_data) {
      console.error('Missing base_token_data in GeckoTerminal response');
      return null;
    }
    
    const baseToken = attributes.base_token_data;
    
    // Check for required fields to prevent errors
    if (baseToken.price_usd === undefined || 
        attributes.price_change_percentage?.h24 === undefined || 
        attributes.volume_usd?.h24 === undefined) {
      console.error('Missing required data fields in GeckoTerminal response');
      return null;
    }
    
    return {
      priceUsd: baseToken.price_usd,
      priceChange24h: attributes.price_change_percentage.h24 || 0,
      volume24h: attributes.volume_usd.h24 || 0,
      liquidity: attributes.reserve_in_usd || 0,
      fdv: baseToken.fdv_usd || 0,
      marketCap: baseToken.market_cap_usd || 0,
      totalSupply: baseToken.total_supply 
        ? parseInt(baseToken.total_supply) / Math.pow(10, baseToken.decimals || 18)
        : 0,
      tokenSymbol: baseToken.symbol || 'X23',
      tokenName: baseToken.name || 'X23.ai',
    };
  } catch (error) {
    console.error('Error fetching data from GeckoTerminal:', error);
    return null;
  }
}

/**
 * Get price history data for a token from GeckoTerminal
 * 
 * @param poolAddress - The pool address
 * @param timeframe - The timeframe (1h, 4h, 1d, 1w, etc.)
 * @param networkId - The network ID (ethereum, bnb, polygon, etc.)
 * @returns Array of price history entries
 */
export async function fetchPriceHistory(
  poolAddress: string = X23_POOL_ADDRESS,
  timeframe: string = '1d',
  networkId: string = NETWORK_ID
) {
  try {
    // Convert timeframe to GeckoTerminal format
    let geckoTimeframe = '1d'; // default to 1 day
    let limit = 96; // default to 96 points (1 day with 15-minute intervals)
    
    if (timeframe === '1h') {
      geckoTimeframe = '1m';
      limit = 60; // 1 hour with 1-minute intervals
    } else if (timeframe === '24h' || timeframe === '1d') {
      geckoTimeframe = '15m';
      limit = 96; // 24 hours with 15-minute intervals
    } else if (timeframe === '7d') {
      geckoTimeframe = '1h';
      limit = 168; // 7 days with 1-hour intervals
    } else if (timeframe === '30d') {
      geckoTimeframe = '4h';
      limit = 180; // 30 days with 4-hour intervals
    } else if (timeframe === 'all') {
      geckoTimeframe = '1d';
      limit = 365; // all-time with 1-day intervals
    }
    
    const url = `${GECKO_TERMINAL_API_BASE}/networks/${networkId}/pools/${poolAddress}/ohlcv/${geckoTimeframe}?limit=${limit}&token_addresses%5B%5D=base`;
    
    console.log(`Fetching price history from GeckoTerminal: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`GeckoTerminal OHLCV API returned status: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as GeckoTerminalOHLCVResponse;
    
    if (!data.data || !data.data.attributes || !data.data.attributes.ohlcv_list) {
      console.error('Invalid data structure from GeckoTerminal OHLCV API');
      return [];
    }
    
    // Map the data to our expected format
    // ohlcv_list format: [timestamp, open, high, low, close, volume]
    return data.data.attributes.ohlcv_list.map(([timestamp, open, high, low, close, volume]) => {
      return {
        projectId: 1, // Hardcoded for X23
        timestamp: new Date(timestamp),
        price: close.toString(),
        volume: volume.toString(),
        // Add ethPrice field since our frontend expects it (for WPOL comparison)
        ethPrice: (close / 20).toString() // Mock conversion rate for display purposes
      };
    });
  } catch (error) {
    console.error('Error fetching price history from GeckoTerminal:', error);
    return [];
  }
}

/**
 * Fetch top token holders for a given token address
 * 
 * @param tokenAddress - The token contract address
 * @param networkId - The network ID (ethereum, bnb, polygon, etc.)
 * @returns Array of token holders with their percentages
 */
export async function fetchTopTokenHolders(
  tokenAddress: string,
  networkId: string = NETWORK_ID
) {
  try {
    // GeckoTerminal doesn't have a direct API for token holders
    // This is a placeholder for future implementation
    
    // For now, return sample data for X23 token
    if (tokenAddress.toLowerCase() === '0xc530b75465ce3c6286e718110a7b2e2b64bdc860') {
      // Sample data (same as before)
      return [
        { address: '0x35CBa0A3B9480571F83B8904F8c684218E5C7eC8', percentage: 13.23 },
        { address: '0x8a0b040ce5bd98F33d425745d60c8Ef0f2f61503', percentage: 11.65 },
        { address: '0xc6F2acF3C9A74aD75Bd295D03Bc03F1c00219B25', percentage: 9.87 },
        { address: '0x9e995d4eEb0Be82330764dA3D8CDe18c88315F15', percentage: 8.42 },
        { address: '0x53eB365464131bA3B57e6C24559ab980a8E19373', percentage: 6.91 },
        { address: '0x7d3dE024dEB70741c6Dfa0FaD57775A47C227AE2', percentage: 5.63 },
        { address: '0xA77E4A084d7f2B23F29557A8E64CF030f41F772a', percentage: 4.89 },
        { address: '0x1B323824b1F9AE547c913e611facD67Ff6B5B233', percentage: 4.12 },
        { address: '0x62F8dc5412A18Ce67D3f1e1f9f4eD98E5d21BE9F', percentage: 3.75 },
        { address: '0xD08c7A7a471CDDe21e8Bf03e5c047E02cfF0c49C', percentage: 3.28 }
      ];
    }
    
    // For other tokens, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return [];
  }
}