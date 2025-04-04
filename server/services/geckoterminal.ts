import fetch from 'node-fetch';

// GeckoTerminal API base URL
const GECKO_TERMINAL_API_BASE = 'https://api.geckoterminal.com/api/v2';

// Project pool addresses on Polygon
export const X23_POOL_ADDRESS = '0x0de6da16d5181a9fe2543ce1eeb4bfd268d68838';
export const CTZN_POOL_ADDRESS = '0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8';
export const PRSM_POOL_ADDRESS = '0x4dc15edc968eceaec3a5e0f12d0acecacee05e25';
export const GRNDT_POOL_ADDRESS = '0x460a8186aa4574c18709d1eff118efdaa5235c19';
export const NETWORK_ID = 'polygon_pos';

// Token contract addresses on Polygon
export const X23_TOKEN_ADDRESS = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860';
export const CTZN_TOKEN_ADDRESS = '0xc2B0f088a0B242fD5CB46c9de92cceA6823E264B';
export const PRSM_TOKEN_ADDRESS = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860'; // Placeholder, replace with actual address
export const GRNDT_TOKEN_ADDRESS = '0x83F20F44474A2F4c32C9e8a841A9dB2121c4D46f'; // Placeholder, replace with actual address

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
      fdv_usd: string; // Updated to string as seen in the API response
      market_cap_usd: number | null; // Can be null
      base_token_price_usd: string; // Added as seen in the API response
      base_token_price_native_currency: string;
      quote_token_price_usd: string;
      quote_token_price_native_currency: string;
      reserve_in_usd: number;
      volume_usd: {
        m5: string;
        m15: string;
        m30: string;
        h1: string;
        h6: string;
        h24: string;
      };
      price_change_percentage: {
        m5: string;
        m15: string;
        m30: string;
        h1: string;
        h6: string;
        h24: string;
      };
      transactions: {
        m5: {
          buys: number;
          sells: number;
          buyers: number;
          sellers: number;
        };
        m15: {
          buys: number;
          sells: number;
          buyers: number;
          sellers: number;
        };
        m30: {
          buys: number;
          sells: number;
          buyers: number;
          sellers: number;
        };
        h1: {
          buys: number;
          sells: number;
          buyers: number;
          sellers: number;
        };
        h6: {
          buys: number;
          sells: number;
          buyers: number;
          sellers: number;
        };
        h24: {
          buys: number;
          sells: number;
          buyers: number;
          sellers: number;
        };
      };
      base_token_data?: { // Make optional as it can be missing
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
      quote_token_data?: { // Make optional as it might also be missing
        id: string;
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        price_usd: number;
      };
      // Add relationships as seen in the API response
      relationships?: {
        base_token: {
          data: {
            id: string;
            type: string;
          }
        };
        quote_token: {
          data: {
            id: string;
            type: string;
          }
        };
        dex: {
          data: {
            id: string;
            type: string;
          }
        };
      };
    };
    relationships?: {
      base_token: {
        data: {
          id: string;
          type: string;
        }
      };
      quote_token: {
        data: {
          id: string;
          type: string;
        }
      };
      dex: {
        data: {
          id: string;
          type: string;
        }
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
 * Get market cap data by scraping the GeckoTerminal website directly
 * 
 * @param poolAddress - The pool address to fetch data for
 * @param networkId - The network ID (e.g., polygon_pos)
 * @returns Market cap data or null if not found
 */
export async function getMarketCapFromGeckoWeb(poolAddress: string, networkId: string = NETWORK_ID): Promise<number | null> {
  try {
    console.log(`Fetching market cap from GeckoTerminal website for ${poolAddress} on ${networkId}`);
    // Call the actual website URL
    const response = await fetch(`https://www.geckoterminal.com/${networkId}/pools/${poolAddress}`, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`GeckoTerminal website returned status: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extract market cap from the HTML using regex
    // Looking for patterns like "$467.17K" in the market cap section
    const marketCapRegex = /Market\s+Cap[^$]*\$([0-9.,]+[KMB]?)/i;
    const match = html.match(marketCapRegex);
    
    if (match && match[1]) {
      console.log(`Found market cap value: $${match[1]}`);
      const marketCapStr = match[1];
      
      // Convert string value like "467.17K" to numeric value
      let marketCap = parseFloat(marketCapStr.replace(/,/g, ''));
      
      if (marketCapStr.endsWith('K')) {
        marketCap *= 1000;
      } else if (marketCapStr.endsWith('M')) {
        marketCap *= 1000000;
      } else if (marketCapStr.endsWith('B')) {
        marketCap *= 1000000000;
      }
      
      console.log(`Converted market cap value: ${marketCap}`);
      return marketCap;
    }
    
    console.error('Could not find market cap value in the HTML');
    return null;
  } catch (error) {
    console.error('Error fetching market cap from GeckoTerminal website:', error);
    return null;
  }
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
    
    let tokenSymbol = 'Unknown';
    let tokenName = 'Unknown Token';
    let tokenPrice = 0;
    let totalSupply = 0;
    let tokenFdv = 0;
    let tokenMarketCap = 0;

    // Try to extract token info from relationships if base_token_data is missing
    if (!attributes.base_token_data) {
      console.log('Missing base_token_data in GeckoTerminal response, extracting from attributes');
      
      // For tokens like CTZN that have the price in the top level
      if (attributes.base_token_price_usd) {
        tokenPrice = parseFloat(attributes.base_token_price_usd);
        console.log(`Using base_token_price_usd: ${tokenPrice}`);
        
        // Try to get token symbol from pool name (e.g., "CTZN / WPOL 0.01%")
        if (attributes.name && attributes.name.includes('/')) {
          tokenSymbol = attributes.name.split('/')[0].trim();
          tokenName = tokenSymbol;
          console.log(`Extracted token symbol from pool name: ${tokenSymbol}`);
        }
        
        // If fdv_usd is available, use it
        if (attributes.fdv_usd) {
          tokenFdv = parseFloat(attributes.fdv_usd);
          // For tokens where market_cap_usd is null, use fdv_usd as an estimate
          tokenMarketCap = tokenFdv;
          console.log(`Using fdv_usd as market cap: ${tokenMarketCap}`);
        }
      } else {
        console.error('Missing base_token_price_usd in GeckoTerminal response');
        return null;
      }
    } else {
      // Normal case where base_token_data is available
      const baseToken = attributes.base_token_data;
      
      // Check for required fields
      if (baseToken.price_usd === undefined) {
        console.error('Missing price_usd in base_token_data');
        return null;
      }
      
      tokenSymbol = baseToken.symbol || 'Unknown';
      tokenName = baseToken.name || 'Unknown Token';
      tokenPrice = baseToken.price_usd;
      tokenFdv = baseToken.fdv_usd || 0;
      tokenMarketCap = baseToken.market_cap_usd || 0;
      totalSupply = baseToken.total_supply 
        ? parseInt(baseToken.total_supply) / Math.pow(10, baseToken.decimals || 18)
        : 0;
    }
    
    // Check for required fields in attributes that we need regardless of base_token_data
    if (attributes.price_change_percentage === undefined || 
        attributes.volume_usd === undefined) {
      console.error('Missing required fields in attributes');
      return null;
    }
    
    // Try to get market cap from website directly as it's more accurate
    const marketCap = await getMarketCapFromGeckoWeb(poolAddress, networkId);
    
    // For tokens like CTZN where market_cap_usd is null but fdv_usd is available
    // use the top-level fdv_usd value as the market cap
    const finalMarketCap = marketCap || 
                           tokenMarketCap || 
                           (attributes.fdv_usd ? Math.round(parseFloat(attributes.fdv_usd.toString())) : 0);
    
    console.log(`Market cap sources - Web scrape: ${marketCap}, API token market cap: ${tokenMarketCap}, API fdv_usd: ${attributes.fdv_usd}`);
    
    return {
      priceUsd: tokenPrice,
      priceChange24h: parseFloat(attributes.price_change_percentage.h24 || '0'),
      volume24h: parseFloat(attributes.volume_usd.h24 || '0'),
      liquidity: attributes.reserve_in_usd || 0,
      fdv: tokenFdv || (attributes.fdv_usd ? parseFloat(attributes.fdv_usd) : 0),
      // Use the most reliable market cap source available
      marketCap: finalMarketCap,
      totalSupply: totalSupply,
      tokenSymbol: tokenSymbol,
      tokenName: tokenName,
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
    if (tokenAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
      // Sample data for X23 token
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
    // Return sample data for CTZN token
    else if (tokenAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
      return [
        { address: '0x48C5D7C9B49A0D239A93BD98A901dd3F4C7c6414', percentage: 14.75 },
        { address: '0xA91F34de933F21e71C8058ff62Ac5D05Ef6105B2', percentage: 12.38 },
        { address: '0xE23DD859A56A0424c0aF1c22b045E563Cd5f74D0', percentage: 8.91 },
        { address: '0x3D63B916C43D4B21f2a7390c75ec11947Ec3F853', percentage: 7.53 },
        { address: '0x9BD27Ac50E7714A841458268c64D44B0Ec944168', percentage: 6.42 },
        { address: '0x68473ccAD7C74DDb9A23a62F7a0DDeBf1DAc588b', percentage: 5.71 },
        { address: '0x04F124e5A070150691c490C94D401cE7E9d15974', percentage: 4.59 },
        { address: '0xfD88ceC0392a0c566110b45F83C82C4B34E37D05', percentage: 3.85 },
        { address: '0x01a7389D1Bf65fC90d439218C66D32A62c8BAB16', percentage: 3.52 },
        { address: '0xeE9562438C7fa923d2Ca818f01EC7e0E89731922', percentage: 3.17 }
      ];
    }
    
    // For other tokens, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return [];
  }
}