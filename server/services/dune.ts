import fetch from 'node-fetch';
import { InsertPriceHistory } from '@shared/schema';

interface DuneQueryResult {
  execution_id: string;
  query_id: number;
  state: string;
  submitted_at: string;
  expires_at: string;
  execution_started_at: string;
  execution_ended_at: string;
  result: {
    rows: Array<{
      time: string;
      reserve0: number;
      reserve1: number;
      price_token0_in_token1: number;
      // Other fields from Dune that we might not use
    }>;
    metadata: {
      column_names: string[];
      result_set_bytes: number;
      total_row_count: number;
      datapoint_count: number;
      pending_time_millis: number;
      execution_time_millis: number;
    };
  };
}

/**
 * Fetches historical price data from Dune Analytics
 * 
 * @param queryId - The Dune query ID for X23 price history
 * @param timeframe - The timeframe to fetch (optional)
 * @returns An array of price history entries
 */
export async function fetchDuneAnalyticsData(
  queryId: number = 4915916,
  timeframe?: string
): Promise<InsertPriceHistory[]> {
  try {
    // Get API key from environment
    const apiKey = process.env.DUNE_API_KEY;
    
    if (!apiKey) {
      console.error('Dune API key is not set. Set the DUNE_API_KEY environment variable.');
      return [];
    }
    
    console.log(`Fetching data from Dune Analytics for query ${queryId}`);
    
    // Execute the query and get results
    const executionUrl = `https://api.dune.com/api/v1/query/${queryId}/execute`;
    const executionResponse = await fetch(executionUrl, {
      method: 'POST',
      headers: {
        'x-dune-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!executionResponse.ok) {
      console.error(`Failed to execute Dune query. Status: ${executionResponse.status}`);
      return [];
    }
    
    const executionData = await executionResponse.json() as { execution_id: string };
    const executionId = executionData.execution_id;
    
    // Poll for results (this might take a few seconds)
    let resultData: DuneQueryResult | null = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const statusUrl = `https://api.dune.com/api/v1/execution/${executionId}/status`;
      const statusResponse = await fetch(statusUrl, {
        headers: {
          'x-dune-api-key': apiKey
        }
      });
      
      if (!statusResponse.ok) {
        console.error(`Failed to check execution status. Status: ${statusResponse.status}`);
        return [];
      }
      
      const statusData = await statusResponse.json() as { state: string };
      
      if (statusData.state === 'QUERY_STATE_COMPLETED') {
        // Get the results
        const resultsUrl = `https://api.dune.com/api/v1/execution/${executionId}/results`;
        const resultsResponse = await fetch(resultsUrl, {
          headers: {
            'x-dune-api-key': apiKey
          }
        });
        
        if (resultsResponse.ok) {
          resultData = await resultsResponse.json() as DuneQueryResult;
          break;
        } else {
          console.error(`Failed to get execution results. Status: ${resultsResponse.status}`);
          return [];
        }
      } else if (statusData.state === 'QUERY_STATE_FAILED') {
        console.error('Dune query execution failed');
        return [];
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    if (!resultData || !resultData.result || !resultData.result.rows) {
      console.error('No data received from Dune Analytics');
      return [];
    }
    
    console.log(`Received ${resultData.result.rows.length} data points from Dune Analytics`);
    
    // Filter data based on timeframe if specified
    let filteredRows = resultData.result.rows;
    
    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      
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
      
      const startTimestamp = startDate.getTime();
      filteredRows = filteredRows.filter(row => new Date(row.time).getTime() >= startTimestamp);
    }
    
    // Transform Dune data to our PriceHistory format
    return filteredRows.map(row => {
      return {
        projectId: 1, // X23.ai is project ID 1
        timestamp: new Date(row.time),
        price: row.price_token0_in_token1.toString(),
        volume: null, // Dune might provide volume data in a different field
      };
    });
  } catch (error) {
    console.error('Error fetching data from Dune Analytics:', error);
    return [];
  }
}