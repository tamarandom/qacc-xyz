import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Function to fetch and parse token holders
async function scrapeTokenHolders(tokenAddress) {
  try {
    console.log(`Fetching token holders from Polygonscan for ${tokenAddress}`);
    
    const response = await fetch(`https://polygonscan.com/token/tokenholderchart/${tokenAddress}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });
    
    if (!response.ok) {
      console.error(`Polygonscan returned status: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract token holder information from the HTML table
    const holders = [];
    
    // Polygonscan presents the token holders in a table
    $('.table tbody tr').each((i, element) => {
      if (i >= 10) return; // Only get top 10 holders
      
      const addressElement = $(element).find('td:nth-child(2)');
      const address = addressElement.find('a').attr('href')?.split('/').pop() || '';
      
      // Look for label if any
      let label = '';
      const labelElement = addressElement.find('span.text-secondary');
      if (labelElement.length > 0) {
        label = labelElement.text().trim();
      }
      
      // Percentage is in the 3rd column
      const percentageText = $(element).find('td:nth-child(4)').text().trim();
      const percentage = parseFloat(percentageText.replace('%', ''));
      
      if (address && !isNaN(percentage)) {
        holders.push({
          address,
          percentage,
          label: label || undefined
        });
      }
    });
    
    console.log('Holders found:', holders);
    return holders;
  } catch (error) {
    console.error('Error scraping token holders:', error);
    return [];
  }
}

// X23 token on Polygon
const X23_TOKEN_ADDRESS = '0xc530b75465ce3c6286e718110a7b2e2b64bdc860';

// Run the scraper
(async () => {
  const holders = await scrapeTokenHolders(X23_TOKEN_ADDRESS);
  console.log(JSON.stringify(holders, null, 2));
})();