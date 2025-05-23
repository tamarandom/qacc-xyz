import fetch from 'node-fetch';
import { InsertPriceHistory } from '@shared/schema';
import { getMarketCapFromGeckoWeb } from './geckoterminal';

interface DexScreenerPairResponse {
  pair: {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
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
      m5: {
        buys: number;
        sells: number;
      };
    };
    volume: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    priceChange: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    liquidity?: {
      usd: number;
      base: number;
      quote: number;
    };
    fdv?: number;
    pairCreatedAt?: number;
  };
}

interface DexScreenerChartResponse {
  schemaVersion: string;
  pair: {
    chainId: string;
    dexId: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      symbol: string;
    };
  };
  priceUsd: Array<[number, number]>; // [timestamp, price]
  priceNative: Array<[number, number]>; // [timestamp, price]
  txs: Array<[number, number, string, string, string]>; // [timestamp, base volume, type, tx hash, price usd]
  volumeUsd: Array<[number, number]>; // [timestamp, volume]
  pairCreatedAt?: number;
  priceUsdLast?: number;
}

/**
 * Fetches price history data from DexScreener for a specific pair
 * 
 * @param pairAddress - The pair address from DexScreener
 * @param timeframe - The timeframe to fetch (optional)
 * @returns An array of price history entries
 */
export async function fetchDexScreenerPriceHistory(
  pairAddress: string,
  timeframe?: string
): Promise<InsertPriceHistory[]> {
  try {
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    };
    
    // First, fetch the pair information
    const pairResponse = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${pairAddress}`, { headers });
    
    if (!pairResponse.ok) {
      console.error('DexScreener API returned status:', pairResponse.status);
      return [];
    }
    
    const pairText = await pairResponse.text();
    
    // Check if the response is actually HTML instead of JSON
    if (pairText.trim().startsWith('<!DOCTYPE') || pairText.trim().startsWith('<html')) {
      console.error('DexScreener API returned HTML instead of JSON for pair data');
      return [];
    }
    
    const pairData = JSON.parse(pairText) as { pairs: any[] };
    
    if (!pairData.pairs || pairData.pairs.length === 0) {
      console.error('No pair data found for address:', pairAddress);
      return [];
    }
    
    // Now fetch the chart data
    const chartResponse = await fetch(`https://api.dexscreener.com/latest/dex/chart/${pairAddress}`, { headers });
    
    if (!chartResponse.ok) {
      console.error('DexScreener chart API returned status:', chartResponse.status);
      return [];
    }
    
    const chartText = await chartResponse.text();
    
    // Check if the response is actually HTML instead of JSON
    if (chartText.trim().startsWith('<!DOCTYPE') || chartText.trim().startsWith('<html')) {
      console.error('DexScreener API returned HTML instead of JSON for chart data');
      return [];
    }
    
    const chartData = JSON.parse(chartText) as DexScreenerChartResponse;
    
    if (!chartData.priceUsd || chartData.priceUsd.length === 0) {
      console.error('No price data found for pair:', pairAddress);
      return [];
    }
    
    // Filter based on timeframe if specified
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe) {
      switch (timeframe) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
    }
    
    const startTimestamp = startDate.getTime();
    
    // Get volume data for the same timestamps
    const volumeMap = new Map<number, number>();
    chartData.volumeUsd?.forEach(([timestamp, volume]) => {
      volumeMap.set(timestamp, volume);
    });
    
    // Transform chart data to our PriceHistory format
    return chartData.priceUsd
      .filter(([timestamp]) => timestamp >= startTimestamp)
      .map(([timestamp, price]) => {
        return {
          projectId: 1, // X23.ai is project ID 1
          timestamp: new Date(timestamp),
          price: price.toString(),
          volume: volumeMap.has(timestamp) ? volumeMap.get(timestamp)!.toString() : null,
        };
      });
  } catch (error) {
    console.error('Error fetching data from DexScreener:', error);
    return [];
  }
}

/**
 * Gets latest price and statistics for a token pair
 * 
 * @param pairAddress - The pair address from DexScreener
 * @param tokenName - The token name for display in logs
 * @returns Current price and statistics
 */
export async function getTokenStats(pairAddress: string, tokenName: string = 'token') {
  try {
    console.log(`Retrieved real-time stats for ${tokenName} from DexScreener`);
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${pairAddress}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('DexScreener API returned status:', response.status);
      return null;
    }
    
    const textData = await response.text();
    
    // Check if the response is actually HTML instead of JSON
    if (textData.trim().startsWith('<!DOCTYPE') || textData.trim().startsWith('<html')) {
      console.error('DexScreener API returned HTML instead of JSON');
      return null;
    }
    
    const data = JSON.parse(textData) as { pairs: any[] };
    
    if (!data.pairs || data.pairs.length === 0) {
      console.error('No pair data found for address:', pairAddress);
      return null;
    }
    
    const pair = data.pairs[0];
    
    // Extract the pool address from the pairAddress
    // This will convert strings like 'polygon/0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8' to '0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8'
    const poolAddress = pairAddress.includes('/') ? pairAddress.split('/')[1] : pairAddress;
    
    // Try to get market cap from GeckoTerminal website as it's more accurate
    let marketCap = null;
    try {
      marketCap = await getMarketCapFromGeckoWeb(poolAddress);
      if (marketCap) {
        console.log(`Using market cap value from GeckoTerminal for ${tokenName}: $${marketCap.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Error fetching market cap from GeckoTerminal:', error);
    }
    
    // For X23 and other tokens in this application, we want to display the FDV (Fully Diluted Valuation)
    // as the market cap, as that matches what's shown on GeckoTerminal
    
    // Use the market cap from GeckoTerminal if available, otherwise use FDV directly 
    let finalMarketCap = marketCap || pair.fdv || 0;
    
    console.log(`For ${tokenName}: Using market cap value from GeckoTerminal: ${marketCap} or FDV from DexScreener: ${pair.fdv}`);
    
    // No hardcoding - we need a reliable data source
    
    const result = {
      priceUsd: parseFloat(pair.priceUsd),
      priceChange24h: pair.priceChange?.h24 || 0,
      volume24h: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      fdv: pair.fdv || 0,
      marketCap: finalMarketCap
    };
    
    console.log(`Retrieved real-time stats for ${tokenName} from DexScreener:`, result);
    return result;
  } catch (error) {
    console.error('Error fetching token stats from DexScreener:', error);
    return null;
  }
}

// Pool addresses on QuickSwap (Polygon)
export const X23_PAIR_ADDRESS = 'polygon/0x0De6dA16D5181a9Fe2543cE1eeb4bFD268D68838';
export const CTZN_PAIR_ADDRESS = 'polygon/0x746cf1baaa81e6f2dee39bd4e3cb5e9f0edf98a8';
export const PRSM_PAIR_ADDRESS = 'polygon/0x4dc15edc968eceaec3a5e0f12d0acecacee05e25';
export const GRNDT_PAIR_ADDRESS = 'polygon/0x460a8186aa4574c18709d1eff118efdaa5235c19';