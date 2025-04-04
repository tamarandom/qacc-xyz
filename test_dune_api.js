// Test script for Dune API to fetch token holders on Polygon
import fetch from 'node-fetch';

const API_KEY = process.env.DUNE_API_KEY;
const X23_TOKEN_ADDRESS = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860';

async function fetchTokenHoldersWithDune() {
  try {
    console.log('Testing Dune API for token holders on Polygon...');
    console.log(`Using token address: ${X23_TOKEN_ADDRESS}`);
    
    // First let's see if we can get information about the API key and available engines
    const engineUrl = `https://api.dune.com/api/v1/engines`;
    
    const headers = {
      'x-dune-api-key': API_KEY
    };
    
    console.log('Making API request to Dune engines endpoint');
    
    const engineResponse = await fetch(engineUrl, {
      method: 'GET',
      headers
    });
    
    const engineData = await engineResponse.json();
    console.log('Dune engines response:', JSON.stringify(engineData, null, 2));
    
    // Let's create a simple query to test
    // Try to determine what network/engine to use for Polygon
    const testQuery = {
      "query": `
        -- Simple query to test Dune API access
        -- This should return token holders for X23 on Polygon
        SELECT
          holder_address,
          token_address,
          amount_raw / POWER(10, decimals) as amount,
          amount_raw,
          decimals,
          symbol,
          name
        FROM polygon.token_balances
        WHERE token_address = '${X23_TOKEN_ADDRESS.toLowerCase()}'
        ORDER BY amount_raw DESC
        LIMIT 10
      `,
      "engine": "spellbook" // Using spellbook for now, may need to be adjusted
    };
    
    console.log('Creating test query to fetch token holders');
    const queryUrl = `https://api.dune.com/api/v1/query`;
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testQuery)
    });
    
    const queryData = await queryResponse.json();
    console.log('Dune query creation response:', JSON.stringify(queryData, null, 2));
    
    // If we got a query ID, run the query
    if (queryData.query_id) {
      const queryId = queryData.query_id;
      console.log(`Query created with ID: ${queryId}, executing...`);
      
      const executeUrl = `https://api.dune.com/api/v1/query/${queryId}/execute`;
      
      const executeResponse = await fetch(executeUrl, {
        method: 'POST',
        headers
      });
      
      const executeData = await executeResponse.json();
      console.log('Query execution response:', JSON.stringify(executeData, null, 2));
      
      // If we got an execution ID, get the results
      if (executeData.execution_id) {
        const executionId = executeData.execution_id;
        console.log(`Query executing with execution ID: ${executionId}, waiting for results...`);
        
        // Wait a moment for the query to finish executing
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const resultsUrl = `https://api.dune.com/api/v1/execution/${executionId}/results`;
        
        const resultsResponse = await fetch(resultsUrl, {
          method: 'GET',
          headers
        });
        
        const resultsData = await resultsResponse.json();
        console.log('Query results:', JSON.stringify(resultsData, null, 2));
        
        return resultsData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error testing Dune API:', error);
    return null;
  }
}

// Run the test
fetchTokenHoldersWithDune();