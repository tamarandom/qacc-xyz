// Test script for fetching token holders
import fetch from 'node-fetch';

async function testFetchTokenHolders() {
  try {
    const API_KEY = process.env.COVALENT_API_KEY;
    const CHAIN_ID = 137; // Polygon mainnet
    
    // Test X23 token
    const x23TokenAddress = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860';
    console.log('Using Covalent API key:', API_KEY ? 'API key is set' : 'API key is not set');
    console.log('Fetching token holders for X23 from Covalent API');
    console.log(`Using token address: ${x23TokenAddress}`);
    
    const url = `https://api.covalenthq.com/v1/${CHAIN_ID}/tokens/${x23TokenAddress}/token_holders/?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error(`Covalent API error: ${data.error_message}`);
      return;
    }
    
    if (!data.data || !data.data.items || data.data.items.length === 0) {
      console.log(`No token holders found for X23`);
      return;
    }
    
    console.log(`Found ${data.data.items.length} holders for X23`);
    console.log('First 3 holders:', data.data.items.slice(0, 3).map(h => ({
      address: h.address,
      balance: h.balance,
      decimals: h.contract_decimals
    })));
    
    // Test CTZN token which should be working
    const ctznTokenAddress = '0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607';
    console.log('\nFetching token holders for CTZN from Covalent API');
    console.log(`Using token address: ${ctznTokenAddress}`);
    
    const ctznUrl = `https://api.covalenthq.com/v1/${CHAIN_ID}/tokens/${ctznTokenAddress}/token_holders/?key=${API_KEY}`;
    const ctznResponse = await fetch(ctznUrl);
    const ctznData = await ctznResponse.json();
    
    if (ctznData.error) {
      console.error(`Covalent API error for CTZN: ${ctznData.error_message}`);
      return;
    }
    
    if (!ctznData.data || !ctznData.data.items || ctznData.data.items.length === 0) {
      console.log(`No token holders found for CTZN`);
      return;
    }
    
    console.log(`Found ${ctznData.data.items.length} holders for CTZN`);
    console.log('First 3 CTZN holders:', ctznData.data.items.slice(0, 3).map(h => ({
      address: h.address,
      balance: h.balance,
      decimals: h.contract_decimals
    })));
    
    // Test GRID token which is having issues
    const gridTokenAddress = '0xfAFB870F1918827fe57Ca4b891124606EaA7e6bd';
    console.log('\nFetching token holders for GRID from Covalent API');
    console.log(`Using token address: ${gridTokenAddress}`);
    
    const gridUrl = `https://api.covalenthq.com/v1/${CHAIN_ID}/tokens/${gridTokenAddress}/token_holders/?key=${API_KEY}`;
    const gridResponse = await fetch(gridUrl);
    const gridData = await gridResponse.json();
    
    if (gridData.error) {
      console.error(`Covalent API error for GRID: ${gridData.error_message}`);
      return;
    }
    
    if (!gridData.data || !gridData.data.items || gridData.data.items.length === 0) {
      console.log(`No token holders found for GRID`);
      return;
    }
    
    console.log(`Found ${gridData.data.items.length} holders for GRID`);
    
    // Test PRSM token which is also having issues
    const prsmTokenAddress = '0x0b7a46E1af45E1EaadEed34B55b6FC00A85c7c68';
    console.log('\nFetching token holders for PRSM from Covalent API');
    console.log(`Using token address: ${prsmTokenAddress}`);
    
    const prsmUrl = `https://api.covalenthq.com/v1/${CHAIN_ID}/tokens/${prsmTokenAddress}/token_holders/?key=${API_KEY}`;
    const prsmResponse = await fetch(prsmUrl);
    const prsmData = await prsmResponse.json();
    
    if (prsmData.error) {
      console.error(`Covalent API error for PRSM: ${prsmData.error_message}`);
      return;
    }
    
    if (!prsmData.data || !prsmData.data.items || prsmData.data.items.length === 0) {
      console.log(`No token holders found for PRSM`);
      return;
    }
    
    console.log(`Found ${prsmData.data.items.length} holders for PRSM`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetchTokenHolders();