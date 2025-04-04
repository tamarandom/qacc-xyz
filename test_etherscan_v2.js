// Test script for Etherscan V2 API to fetch token holders on Polygon
import fetch from 'node-fetch';

const API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGON_CHAIN_ID = 137; // Polygon mainnet
const X23_TOKEN_ADDRESS = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860';

async function fetchTokenHolders() {
  try {
    console.log('Testing Etherscan V2 API for token holders on Polygon...');
    console.log(`Using token address: ${X23_TOKEN_ADDRESS}`);
    
    // First, let's try the tokenholderlist endpoint
    const tokenHolderListUrl = `https://api.etherscan.io/v2/api?chainid=${POLYGON_CHAIN_ID}&module=token&action=tokenholderlist&contractaddress=${X23_TOKEN_ADDRESS}&page=1&offset=10&apikey=${API_KEY}`;
    
    console.log('Making API request to:', tokenHolderListUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(tokenHolderListUrl);
    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.status === "1") {
      console.log('SUCCESS! V2 API returned token holders data');
      return data.result;
    } else {
      console.log('ERROR fetching token holders:', data.message);
      
      // If tokenholderlist doesn't work, let's try to see what other endpoints are available
      console.log('\nTesting V2 API module list...');
      const moduleListUrl = `https://api.etherscan.io/v2/api?chainid=${POLYGON_CHAIN_ID}&module=modules&action=list&apikey=${API_KEY}`;
      
      const moduleResponse = await fetch(moduleListUrl);
      const moduleData = await moduleResponse.json();
      
      console.log('Available modules:', JSON.stringify(moduleData, null, 2));
      
      return null;
    }
  } catch (error) {
    console.error('Error testing Etherscan V2 API:', error);
    return null;
  }
}

// Run the test
fetchTokenHolders();