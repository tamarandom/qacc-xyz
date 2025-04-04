// Test script for Covalent API to fetch token holders on Polygon
import fetch from 'node-fetch';

const API_KEY = process.env.COVALENT_API_KEY;
const CHAIN_ID = 137; // Polygon mainnet
const X23_TOKEN_ADDRESS = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860';

async function fetchTokenHoldersWithCovalent() {
  try {
    console.log('Testing Covalent API for token holders on Polygon...');
    console.log(`Using token address: ${X23_TOKEN_ADDRESS}`);
    
    // Endpoint for token holders
    const url = `https://api.covalenthq.com/v1/${CHAIN_ID}/tokens/${X23_TOKEN_ADDRESS}/token_holders/?key=${API_KEY}`;
    
    console.log('Making API request to:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response status:', data.data?.pagination || data.error_message || 'Unknown');
    
    if (data.error) {
      console.error('Error fetching token holders:', data.error_message);
      return null;
    }
    
    if (data.data && data.data.items) {
      console.log(`SUCCESS! Found ${data.data.items.length} token holders`);
      
      // Display sample of the first few token holders
      const sample = data.data.items.slice(0, 3);
      console.log('Sample token holders:', JSON.stringify(sample, null, 2));
      
      return data.data.items;
    } else {
      console.log('No token holders found or unexpected response format');
      console.log('Full response:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('Error testing Covalent API:', error);
    return null;
  }
}

// Run the test
fetchTokenHoldersWithCovalent();