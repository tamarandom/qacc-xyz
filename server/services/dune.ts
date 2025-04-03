import fetch from 'node-fetch';
import { X23_TOKEN_ADDRESS, CTZN_TOKEN_ADDRESS } from './geckoterminal';

interface DuneQueryResult {
  execution_id: string;
  query_id: number;
  state: string;
  submitted_at: string;
  expires_at: string;
  execution_started_at: string;
  execution_ended_at: string;
  result?: {
    rows: Array<Record<string, any>>;
    metadata: {
      column_names: string[];
      column_types: string[];
    };
  };
}

interface QueryParameter {
  key: string;
  value: string | number;
  type: string;
}

// Verify if the Dune API key is valid and set
export function isDuneApiKeyValid(): boolean {
  const API_KEY = process.env.DUNE_API_KEY;
  return API_KEY !== undefined && API_KEY.length > 0;
}

/**
 * Execute a Dune query by ID with optional parameters
 * 
 * @param queryId The Dune query ID to execute
 * @param parameters Optional parameters to pass to the query
 * @returns The query results
 */
export async function executeQuery(
  queryId: number,
  parameters: QueryParameter[] = []
): Promise<any> {
  const API_KEY = process.env.DUNE_API_KEY;
  
  if (!API_KEY) {
    console.warn('DUNE_API_KEY environment variable is not set. Using sample data instead.');
    throw new Error('DUNE_API_KEY environment variable is not set');
  }
  
  try {
    // Step 1: Execute the query
    const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${queryId}/execute`, {
      method: 'POST',
      headers: {
        'x-dune-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ parameters })
    });
    
    if (!executeResponse.ok) {
      const errorText = await executeResponse.text();
      console.error(`Failed to execute Dune query: ${errorText}`);
      throw new Error(`Failed to execute Dune query: ${errorText}`);
    }
    
    const executeData = await executeResponse.json() as { execution_id: string };
    const executionId = executeData.execution_id;
    
    // Step 2: Get the status and results
    let statusResponse;
    let statusData: DuneQueryResult;
    let attempts = 0;
    const maxAttempts = 10; // Maximum number of polling attempts
    
    // Poll until the query is completed or an error occurs
    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      attempts++;
      
      statusResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/status`, {
        headers: {
          'x-dune-api-key': API_KEY
        }
      });
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`Failed to get Dune query status: ${errorText}`);
        throw new Error(`Failed to get Dune query status: ${errorText}`);
      }
      
      statusData = await statusResponse.json() as DuneQueryResult;
      
      // Break out if we've been polling too long
      if (attempts >= maxAttempts && (statusData.state === 'EXECUTING' || statusData.state === 'PENDING')) {
        console.warn(`Query execution timed out after ${maxAttempts} attempts`);
        throw new Error('Query execution timed out');
      }
      
    } while (statusData.state === 'EXECUTING' || statusData.state === 'PENDING');
    
    // Step 3: Check if the query was successful
    if (statusData.state !== 'QUERY_STATE_COMPLETED') {
      console.error(`Dune query failed with state: ${statusData.state}`);
      throw new Error(`Dune query failed with state: ${statusData.state}`);
    }
    
    // Step 4: Return the results
    return statusData.result?.rows || [];
  } catch (error) {
    console.error('Error executing Dune query:', error);
    throw error;
  }
}

// Sample token distribution data for X23
const sampleX23Distribution = [
  {
    category: "Team",
    allocation: 15,
    tokens: 150000000,
    description: "Allocated to the founding team and employees with 2-year vesting"
  },
  {
    category: "Investors",
    allocation: 20,
    tokens: 200000000,
    description: "Seed and private sale investors with 18-month vesting"
  },
  {
    category: "Ecosystem",
    allocation: 25,
    tokens: 250000000,
    description: "For community initiatives, grants, and partnerships"
  },
  {
    category: "Public Sale",
    allocation: 15,
    tokens: 150000000,
    description: "Available for public purchase on DEXs"
  },
  {
    category: "Liquidity",
    allocation: 10,
    tokens: 100000000,
    description: "Reserved for DEX liquidity provision"
  },
  {
    category: "Treasury",
    allocation: 10,
    tokens: 100000000,
    description: "Long-term operational reserves with 3-year vesting"
  },
  {
    category: "Advisors",
    allocation: 5,
    tokens: 50000000,
    description: "Strategic advisors with 18-month vesting"
  }
];

// Sample token distribution data for CTZN
const sampleCTZNDistribution = [
  {
    category: "Core Team",
    allocation: 18,
    tokens: 180000000,
    description: "Founding team members with 24-month vesting"
  },
  {
    category: "Investors",
    allocation: 22,
    tokens: 220000000,
    description: "Early backers with 12-month vesting schedule"
  },
  {
    category: "Community",
    allocation: 30,
    tokens: 300000000,
    description: "Community rewards, incentives, and ecosystem growth"
  },
  {
    category: "Public Sale",
    allocation: 12,
    tokens: 120000000,
    description: "Initial DEX offering"
  },
  {
    category: "Liquidity",
    allocation: 8,
    tokens: 80000000,
    description: "DEX liquidity and market making"
  },
  {
    category: "Partnerships",
    allocation: 6,
    tokens: 60000000,
    description: "Strategic partners and integrations"
  },
  {
    category: "Foundation",
    allocation: 4,
    tokens: 40000000,
    description: "Non-profit foundation for protocol governance"
  }
];

/**
 * Get token distribution data from Dune
 * 
 * @param contractAddress The token contract address
 * @param chainId The chain ID (e.g., 'polygon', 'ethereum')
 * @returns Token distribution data
 */
export async function getTokenDistribution(
  contractAddress: string,
  chainId: string = 'polygon'
): Promise<any> {
  // This is assuming there's a Dune query that accepts a token address parameter
  // The actual query ID would need to be replaced with a real Dune query ID
  const TOKEN_DISTRIBUTION_QUERY_ID = 3181058; // Example query ID, replace with actual

  try {
    // Check if we have a valid Dune API key
    if (!isDuneApiKeyValid()) {
      console.log('No valid Dune API key found, using sample data for token distribution');
      
      // Return sample data based on the contract address
      if (contractAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
        return sampleX23Distribution;
      } else if (contractAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
        return sampleCTZNDistribution;
      } else {
        // For other tokens, return a generic distribution
        return sampleX23Distribution.map(item => ({
          ...item,
          description: `Sample ${item.category} allocation`
        }));
      }
    }
    
    const results = await executeQuery(TOKEN_DISTRIBUTION_QUERY_ID, [
      {
        key: 'contract_address',
        value: contractAddress,
        type: 'text'
      },
      {
        key: 'blockchain',
        value: chainId,
        type: 'text'
      }
    ]);
    
    return results;
  } catch (error) {
    console.error('Error fetching token distribution from Dune:', error);
    
    // Return sample data on error
    if (contractAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
      return sampleX23Distribution;
    } else if (contractAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
      return sampleCTZNDistribution;
    } else {
      return sampleX23Distribution.map(item => ({
        ...item,
        description: `Sample ${item.category} allocation`
      }));
    }
  }
}

// Generate dates for unlocks (starting from today and going forward)
function generateUnlockDates(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + (i * 30)); // Add i months (approximated as 30 days)
    dates.push(futureDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  }
  
  return dates;
}

// Sample token unlock data for X23
const unlockDates = generateUnlockDates(8);
const sampleX23Unlocks = [
  {
    date: unlockDates[0],
    tokens: 25000000,
    category: "Team",
    percentage_of_total: 2.5,
    cumulative_percentage: 2.5
  },
  {
    date: unlockDates[1],
    tokens: 35000000,
    category: "Team",
    percentage_of_total: 3.5,
    cumulative_percentage: 6.0
  },
  {
    date: unlockDates[2],
    tokens: 40000000,
    category: "Investors",
    percentage_of_total: 4.0,
    cumulative_percentage: 10.0
  },
  {
    date: unlockDates[3],
    tokens: 50000000,
    category: "Investors",
    percentage_of_total: 5.0,
    cumulative_percentage: 15.0
  },
  {
    date: unlockDates[4],
    tokens: 60000000,
    category: "Ecosystem",
    percentage_of_total: 6.0,
    cumulative_percentage: 21.0
  },
  {
    date: unlockDates[5],
    tokens: 70000000,
    category: "Ecosystem",
    percentage_of_total: 7.0,
    cumulative_percentage: 28.0
  },
  {
    date: unlockDates[6],
    tokens: 30000000,
    category: "Treasury",
    percentage_of_total: 3.0,
    cumulative_percentage: 31.0
  },
  {
    date: unlockDates[7],
    tokens: 25000000,
    category: "Advisors",
    percentage_of_total: 2.5,
    cumulative_percentage: 33.5
  }
];

// Sample token unlock data for CTZN
const sampleCTZNUnlocks = [
  {
    date: unlockDates[0],
    tokens: 30000000,
    category: "Core Team",
    percentage_of_total: 3.0,
    cumulative_percentage: 3.0
  },
  {
    date: unlockDates[1],
    tokens: 45000000,
    category: "Core Team",
    percentage_of_total: 4.5,
    cumulative_percentage: 7.5
  },
  {
    date: unlockDates[2],
    tokens: 55000000,
    category: "Investors",
    percentage_of_total: 5.5,
    cumulative_percentage: 13.0
  },
  {
    date: unlockDates[3],
    tokens: 60000000,
    category: "Community",
    percentage_of_total: 6.0,
    cumulative_percentage: 19.0
  },
  {
    date: unlockDates[4],
    tokens: 65000000,
    category: "Community",
    percentage_of_total: 6.5,
    cumulative_percentage: 25.5
  },
  {
    date: unlockDates[5],
    tokens: 40000000,
    category: "Partnerships",
    percentage_of_total: 4.0,
    cumulative_percentage: 29.5
  },
  {
    date: unlockDates[6],
    tokens: 20000000,
    category: "Foundation",
    percentage_of_total: 2.0,
    cumulative_percentage: 31.5
  }
];

/**
 * Get token unlock schedule from Dune
 * 
 * @param contractAddress The token contract address
 * @param chainId The chain ID (e.g., 'polygon', 'ethereum')
 * @returns Token unlock schedule data
 */
export async function getTokenUnlockSchedule(
  contractAddress: string,
  chainId: string = 'polygon'
): Promise<any> {
  // Replace with actual Dune query ID for token unlock schedules
  const TOKEN_UNLOCK_QUERY_ID = 3181059; // Example query ID, replace with actual
  
  try {
    // Check if we have a valid Dune API key
    if (!isDuneApiKeyValid()) {
      console.log('No valid Dune API key found, using sample data for token unlocks');
      
      // Return sample data based on the contract address
      if (contractAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
        return sampleX23Unlocks;
      } else if (contractAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
        return sampleCTZNUnlocks;
      } else {
        // For other tokens, return a generic unlock schedule
        return sampleX23Unlocks.map(item => ({
          ...item,
          category: `Generic ${item.category}`
        }));
      }
    }
    
    const results = await executeQuery(TOKEN_UNLOCK_QUERY_ID, [
      {
        key: 'contract_address',
        value: contractAddress,
        type: 'text'
      },
      {
        key: 'blockchain',
        value: chainId,
        type: 'text'
      }
    ]);
    
    return results;
  } catch (error) {
    console.error('Error fetching token unlock schedule from Dune:', error);
    
    // Return sample data on error
    if (contractAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
      return sampleX23Unlocks;
    } else if (contractAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
      return sampleCTZNUnlocks;
    } else {
      return sampleX23Unlocks.map(item => ({
        ...item,
        category: `Generic ${item.category}`
      }));
    }
  }
}

// Generate dates for trading activity (past 30 days by default)
function generateTradingDates(days: number = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    dates.push(pastDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  }
  
  return dates;
}

// Generate realistic trading data for X23
function generateX23TradingActivity(days: number = 30): any[] {
  const dates = generateTradingDates(days);
  const baseVolume = 100000; // Base trading volume
  const basePrice = 0.08; // Starting price
  const volatility = 0.05; // Price volatility
  
  return dates.map((date, index) => {
    // Generate a price with some random fluctuation
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    const priceModifier = 1 + (Math.sin(index / 5) * 0.1); // Add some cyclical pattern
    const price = basePrice * randomFactor * priceModifier;
    
    // Volume tends to be higher when price changes more dramatically
    const volumeModifier = 1 + Math.abs(Math.sin(index / 3)) * 1.5;
    const volume = baseVolume * volumeModifier * randomFactor;
    
    // Generate buy/sell ratio (typically varies between 40/60 and 60/40)
    const buyPercentage = 45 + Math.floor(Math.random() * 20);
    const sellPercentage = 100 - buyPercentage;
    
    // Number of transactions
    const transactions = Math.floor(volume / 1000);
    
    return {
      date,
      price_usd: price.toFixed(4),
      volume_usd: Math.floor(volume),
      buy_percentage: buyPercentage,
      sell_percentage: sellPercentage,
      transactions: transactions,
      unique_wallets: Math.floor(transactions * 0.7) // Approximation of unique wallets
    };
  });
}

// Generate realistic trading data for CTZN
function generateCTZNTradingActivity(days: number = 30): any[] {
  const dates = generateTradingDates(days);
  const baseVolume = 75000; // Base trading volume (lower than X23)
  const basePrice = 0.05; // Starting price
  const volatility = 0.06; // Price volatility (higher than X23)
  
  return dates.map((date, index) => {
    // Generate a price with some random fluctuation
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    const priceModifier = 1 + (Math.cos(index / 6) * 0.15); // Add some cyclical pattern
    const price = basePrice * randomFactor * priceModifier;
    
    // Volume tends to be higher when price changes more dramatically
    const volumeModifier = 1 + Math.abs(Math.cos(index / 4)) * 1.3;
    const volume = baseVolume * volumeModifier * randomFactor;
    
    // Generate buy/sell ratio (typically varies between 40/60 and 60/40)
    const buyPercentage = 40 + Math.floor(Math.random() * 25);
    const sellPercentage = 100 - buyPercentage;
    
    // Number of transactions
    const transactions = Math.floor(volume / 800);
    
    return {
      date,
      price_usd: price.toFixed(4),
      volume_usd: Math.floor(volume),
      buy_percentage: buyPercentage,
      sell_percentage: sellPercentage,
      transactions: transactions,
      unique_wallets: Math.floor(transactions * 0.65) // Approximation of unique wallets
    };
  });
}

/**
 * Get trading activity for a token from Dune
 * 
 * @param contractAddress The token contract address
 * @param chainId The chain ID (e.g., 'polygon', 'ethereum')
 * @param days Number of days of trading data to retrieve
 * @returns Trading activity data
 */
export async function getTokenTradingActivity(
  contractAddress: string,
  chainId: string = 'polygon',
  days: number = 30
): Promise<any> {
  // Replace with actual Dune query ID for token trading activity
  const TRADING_ACTIVITY_QUERY_ID = 3181060; // Example query ID, replace with actual
  
  try {
    // Check if we have a valid Dune API key
    if (!isDuneApiKeyValid()) {
      console.log('No valid Dune API key found, using sample data for trading activity');
      
      // Return sample data based on the contract address
      if (contractAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
        return generateX23TradingActivity(days);
      } else if (contractAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
        return generateCTZNTradingActivity(days);
      } else {
        // For other tokens, return a generic trading activity data
        return generateX23TradingActivity(days).map(item => ({
          ...item,
          price_usd: (parseFloat(item.price_usd) * 0.8).toFixed(4), // Different price range
          volume_usd: Math.floor(item.volume_usd * 0.7) // Lower volume for generic tokens
        }));
      }
    }
    
    const results = await executeQuery(TRADING_ACTIVITY_QUERY_ID, [
      {
        key: 'contract_address',
        value: contractAddress,
        type: 'text'
      },
      {
        key: 'blockchain',
        value: chainId,
        type: 'text'
      },
      {
        key: 'days',
        value: days,
        type: 'number'
      }
    ]);
    
    return results;
  } catch (error) {
    console.error('Error fetching token trading activity from Dune:', error);
    
    // Return sample data on error
    if (contractAddress.toLowerCase() === X23_TOKEN_ADDRESS.toLowerCase()) {
      return generateX23TradingActivity(days);
    } else if (contractAddress.toLowerCase() === CTZN_TOKEN_ADDRESS.toLowerCase()) {
      return generateCTZNTradingActivity(days);
    } else {
      return generateX23TradingActivity(days).map(item => ({
        ...item,
        price_usd: (parseFloat(item.price_usd) * 0.8).toFixed(4), // Different price range
        volume_usd: Math.floor(item.volume_usd * 0.7) // Lower volume for generic tokens
      }));
    }
  }
}

// Query IDs for X23 and CTZN tokens
export const X23_TOKEN_DISTRIBUTION_QUERY_ID = 3181058; // Replace with actual
export const X23_TOKEN_UNLOCK_QUERY_ID = 3181059; // Replace with actual
export const X23_TRADING_ACTIVITY_QUERY_ID = 3181060; // Replace with actual

export const CTZN_TOKEN_DISTRIBUTION_QUERY_ID = 3181061; // Replace with actual
export const CTZN_TOKEN_UNLOCK_QUERY_ID = 3181062; // Replace with actual
export const CTZN_TRADING_ACTIVITY_QUERY_ID = 3181063; // Replace with actual