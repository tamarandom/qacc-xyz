// Script to update project price and market cap data with unique values
import fs from 'fs';

const storageFile = './server/storage.ts';
const content = fs.readFileSync(storageFile, 'utf8');

// Define varied prices and market caps for all projects 
const projectUpdates = [
  { id: 1, price: 1.30, marketCap: 10000000, volume: 1250000, change: 5.67 }, // SafeStake
  { id: 2, price: 1.04, marketCap: 8700000, volume: 930000, change: -2.34 }, // LiquidSwap
  { id: 3, price: 0.92, marketCap: 7300000, volume: 720000, change: 1.23 }, // NexusFi
  { id: 4, price: 0.78, marketCap: 6200000, volume: 650000, change: 7.82 }, // DecentLend
  { id: 5, price: 0.65, marketCap: 5100000, volume: 580000, change: -0.89 }, // QuantumYield
  { id: 10, price: 0.45, marketCap: 3500000, volume: 420000, change: 7.8 }, // DeFi Pulse
  { id: 11, price: 0.32, marketCap: 2200000, volume: 310000, change: -2.3 }, // NFT Marketplace
  { id: 12, price: 0.18, marketCap: 1200000, volume: 180000, change: 12.5 }, // Web3 Social
  { id: 0, price: 1.15, marketCap: 9200000, volume: 1100000, change: 3.12 }, // X23
];

// Helper function to update project data
function updateProjectData(content, projectId, price, marketCap, volume24h, change24h) {
  // Pattern to match the project section for the given ID
  const projectPattern = new RegExp(`// Project ${projectId === 0 ? 'X23' : projectId}:[\\s\\S]*?price: [0-9.]+,[\\s\\S]*?marketCap: [0-9]+,[\\s\\S]*?volume24h: [0-9]+,[\\s\\S]*?change24h: [0-9.-]+,`, 'g');
  
  // Log what we're doing
  console.log(`Updating project ${projectId} to price: ${price}, marketCap: ${marketCap}, volume: ${volume24h}, change: ${change24h}`);
  
  // Pattern to match each specific field
  const pricePattern = new RegExp(`(price: )[0-9.]+,`, 'g');
  const marketCapPattern = new RegExp(`(marketCap: )[0-9]+,`, 'g');
  const volumePattern = new RegExp(`(volume24h: )[0-9]+,`, 'g');
  const changePattern = new RegExp(`(change24h: )[0-9.-]+,`, 'g');
  
  // Find the project section
  let updatedContent = content;
  const match = projectPattern.exec(content);
  
  if (match) {
    // Extract the project section
    const projectSection = match[0];
    
    // Update the fields
    const updatedSection = projectSection
      .replace(pricePattern, `$1${price},`)
      .replace(marketCapPattern, `$1${marketCap},`)
      .replace(volumePattern, `$1${volume24h},`)
      .replace(changePattern, `$1${change24h},`);
    
    // Replace the project section with the updated one
    updatedContent = content.replace(projectSection, updatedSection);
  }
  
  return updatedContent;
}

// Apply all updates
let updatedContent = content;
for (const project of projectUpdates) {
  updatedContent = updateProjectData(
    updatedContent, 
    project.id, 
    project.price, 
    project.marketCap, 
    project.volume, 
    project.change
  );
}

// Write back to the file
fs.writeFileSync(storageFile, updatedContent, 'utf8');
console.log('Project data update complete');
