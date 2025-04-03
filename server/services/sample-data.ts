import { InsertPriceHistory } from '@shared/schema';

// Interface that matches our PriceChartData format
interface ExtendedPriceHistory {
  projectId: number;
  timestamp: Date;
  price: string;
  volume: string | null;
  ethPrice?: string;
  marketCap?: string;
}

/**
 * X23 realistic price history generator
 * This provides realistic data for the X23 token following the actual market trend
 */
export function generateRealisticX23Data(timeframe: string = '24h'): ExtendedPriceHistory[] {
  const now = Date.now();
  let dataPoints: ExtendedPriceHistory[] = [];
  let startDate = new Date();
  let points = 100; // Default number of data points
  
  // Set the start date and number of points based on timeframe
  switch (timeframe) {
    case '24h':
      startDate.setDate(startDate.getDate() - 1);
      points = 96; // 15-minute intervals
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      points = 168; // 1-hour intervals
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      points = 120; // 6-hour intervals
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      points = 90; // 1-day intervals
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      points = 365; // 1-day intervals
      break;
  }
  
  const startTimestamp = startDate.getTime();
  const timeInterval = (now - startTimestamp) / points;
  
  // X23 price pattern:
  // - Starting price around $0.04 (early January 2024)
  // - Rising to peak of ~$0.12 in February
  // - Consolidation around $0.08-0.09 in March-April
  // - Current price around $0.09
  
  const basePrice = 0.089; // Current approximate price
  const volatility = 0.02; // Daily volatility percentage
  
  function simulatePriceMovement(dayIndex: number, totalDays: number): number {
    // Create a realistic price curve for X23 token
    const trendFactor = Math.sin(dayIndex / (totalDays / 4) * Math.PI) * 0.3 + 1;
    
    // Add some random noise
    const noise = ((Math.random() - 0.5) * 2) * volatility;
    
    // Calculate price considering trend and noise
    return basePrice * trendFactor * (1 + noise);
  }
  
  // WPOL/ETH price is approximately 1/1050 of USD price
  function calculateEthPrice(usdPrice: number): number {
    return usdPrice / 1050;
  }
  
  // Generate volume data (following price movements)
  function generateVolume(price: number, dayIndex: number, totalDays: number): number {
    // Base volume around $10,000 per day with variability
    const baseVolume = 10000;
    
    // Volume tends to be higher on price movements
    const volatilityFactor = 1 + Math.sin(dayIndex / (totalDays / 8) * Math.PI) * 0.5;
    
    // Random component
    const randomFactor = 0.7 + Math.random() * 0.6;
    
    return baseVolume * volatilityFactor * randomFactor;
  }
  
  // Generate data points
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(startTimestamp + (i * timeInterval));
    const dayIndex = i / points * (timeframe === '24h' ? 1 : 
                                  timeframe === '7d' ? 7 : 
                                  timeframe === '30d' ? 30 : 
                                  timeframe === '90d' ? 90 : 365);
    
    const price = simulatePriceMovement(dayIndex, timeframe === '24h' ? 1 : 
                                        timeframe === '7d' ? 7 : 
                                        timeframe === '30d' ? 30 : 
                                        timeframe === '90d' ? 90 : 365);
    
    const volume = generateVolume(price, dayIndex, timeframe === '24h' ? 1 : 
                                 timeframe === '7d' ? 7 : 
                                 timeframe === '30d' ? 30 : 
                                 timeframe === '90d' ? 90 : 365);
    
    // Scale volume based on timeframe
    const scaledVolume = timeframe === '24h' ? volume / 24 : 
                        timeframe === '7d' ? volume / 7 : 
                        timeframe === '30d' ? volume / 5 : 
                        timeframe === '90d' ? volume * 3 : volume * 7;
    
    dataPoints.push({
      projectId: 1, // X23 is project ID 1
      timestamp: timestamp,
      price: price.toString(),
      ethPrice: calculateEthPrice(price).toString(),
      volume: scaledVolume.toString(),
      marketCap: (price * 7200000).toString() // Based on 7.2M tokens for X23
    });
  }
  
  // Sort data by timestamp
  return dataPoints.sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
}