// Script to update project prices and marketCaps in storage.ts
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = __dirname + '/server/storage.ts';
const content = fs.readFileSync(path, 'utf8');

// Define new price and marketCap values for each project
const projects = [
  { id: 2, price: 1.04, marketCap: 8700000, volume: 930000 }, // LiquidSwap
  { id: 3, price: 0.92, marketCap: 7300000, volume: 720000 }, // NexusFi
  { id: 4, price: 0.78, marketCap: 6200000, volume: 650000 }, // DecentLend
  { id: 5, price: 0.65, marketCap: 5100000, volume: 580000 }, // QuantumYield
  { id: 10, price: 0.45, marketCap: 3500000, volume: 420000 }, // DeFi Pulse
  { id: 11, price: 0.32, marketCap: 2200000, volume: 310000 }, // NFT Marketplace
  { id: 12, price: 0.18, marketCap: 1200000, volume: 180000 }  // Web3 Social
];

// Update each project's price and marketCap
let updatedContent = content;
for (const project of projects) {
  const id = project.id;
  
  // Find the project in the content and update the values
  const projectRegex = new RegExp(`(// Project ${id}|name: "[^"]+".+?price: )[0-9.]+`, 'gs');
  updatedContent = updatedContent.replace(projectRegex, `$1${project.price}`);
  
  const marketCapRegex = new RegExp(`(price: ${project.price}[^]*?marketCap: )[0-9]+`, 'gs');
  updatedContent = updatedContent.replace(marketCapRegex, `$1${project.marketCap}`);
  
  const volumeRegex = new RegExp(`(marketCap: ${project.marketCap}[^]*?volume24h: )[0-9]+`, 'gs');
  updatedContent = updatedContent.replace(volumeRegex, `$1${project.volume}`);
}

// Write updated content back to file
fs.writeFileSync(path, updatedContent, 'utf8');
console.log('Successfully updated project prices and marketCaps');
