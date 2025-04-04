/**
 * Project Data Caching System
 * 
 * This module provides a centralized caching system for project data, including:
 * - Market data (price, marketCap, volume24h, change24h)
 * - Token holders
 * 
 * The cache is refreshed every 30 minutes automatically, and can also be
 * refreshed on demand via the API.
 */

import { TokenHolderData as TokenHolderDataType } from "./services/token-holders";
import { Project } from "@shared/schema";

// Define interface for project market data
export interface ProjectMarketData {
  price: number | null;      // Null means no data available
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
}

// Define interface for project token holders
export interface ProjectTokenHolders {
  holders: TokenHolderDataType[];
}

// Define the complete project cache entry interface
export interface ProjectCacheEntry {
  lastUpdated: Date;
  marketData: ProjectMarketData;
  tokenHolders: ProjectTokenHolders;
  apiSuccess: boolean; // Flag to indicate if the last API call was successful
  isNew: boolean;      // Flag to indicate if this is a new project (using placeholder values)
}

// Complete project cache - stores all data for each project
const projectCache: Record<number, ProjectCacheEntry> = {};

// Cache duration in minutes (30 minutes as requested)
export const CACHE_DURATION_MINUTES = 30;

/**
 * Check if the project cache entry is valid (less than CACHE_DURATION_MINUTES old)
 * 
 * @param projectId - The project ID to check
 * @returns True if the cache entry is valid, false otherwise
 */
export function isCacheValid(projectId: number): boolean {
  if (!projectCache[projectId]) return false;
  
  const now = new Date();
  const cacheTime = projectCache[projectId].lastUpdated;
  const diffMs = now.getTime() - cacheTime.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  return diffMinutes < CACHE_DURATION_MINUTES;
}

/**
 * Get market data for a project from the cache
 * 
 * @param projectId - The project ID to retrieve market data for
 * @returns Market data from cache or null values if not available
 */
export function getProjectMarketData(projectId: number): ProjectMarketData {
  if (isCacheValid(projectId) && projectCache[projectId].marketData) {
    return projectCache[projectId].marketData;
  }
  
  // Return null values if cache not valid or market data not available
  return {
    price: null,
    marketCap: null,
    volume24h: null,
    change24h: null
  };
}

/**
 * Get token holders for a project from the cache
 * 
 * @param projectId - The project ID to retrieve token holders for
 * @returns Token holders from cache or empty array if not available
 */
export function getProjectTokenHolders(projectId: number): TokenHolderDataType[] {
  if (isCacheValid(projectId) && projectCache[projectId].tokenHolders) {
    return projectCache[projectId].tokenHolders.holders;
  }
  
  // Return empty array if cache not valid or token holders not available
  return [];
}

/**
 * Update market data in the project cache
 * 
 * @param projectId - The project ID to update
 * @param marketData - The market data to cache
 * @param apiSuccess - Whether the data was fetched successfully from the API
 */
export function updateProjectMarketData(
  projectId: number, 
  marketData: ProjectMarketData,
  apiSuccess: boolean = false,
  isNew: boolean = false
): void {
  // Create cache entry if it doesn't exist
  if (!projectCache[projectId]) {
    projectCache[projectId] = {
      lastUpdated: new Date(),
      marketData: {
        price: null,
        marketCap: null,
        volume24h: null,
        change24h: null
      },
      tokenHolders: {
        holders: []
      },
      apiSuccess: false,
      isNew: isNew
    };
  }
  
  // Update market data and refresh timestamp
  projectCache[projectId].marketData = marketData;
  projectCache[projectId].lastUpdated = new Date();
  projectCache[projectId].apiSuccess = apiSuccess;
  projectCache[projectId].isNew = isNew;
  
  console.log(`Updated market data cache for project ${projectId}`);
  if (apiSuccess) {
    console.log(`Market data fetched successfully from API.`);
  } else if (isNew) {
    console.log(`Using predefined values for new project.`);
  } else {
    console.log(`Using fallback values, API calls failed.`);
  }
}

/**
 * Update token holders in the project cache
 * 
 * @param projectId - The project ID to update
 * @param holders - The token holders to cache
 */
export function updateProjectTokenHolders(
  projectId: number, 
  holders: TokenHolderDataType[]
): void {
  // Create cache entry if it doesn't exist
  if (!projectCache[projectId]) {
    projectCache[projectId] = {
      lastUpdated: new Date(),
      marketData: {
        price: null,
        marketCap: null,
        volume24h: null,
        change24h: null
      },
      tokenHolders: {
        holders: []
      },
      apiSuccess: false,
      isNew: false
    };
  }
  
  // Update token holders but keep the original timestamp
  // This allows market data and token holders to have different refresh cycles
  projectCache[projectId].tokenHolders = { holders };
  
  console.log(`Updated token holders cache for project ${projectId} with ${holders.length} holders`);
}

/**
 * Initialize the project cache for a new project
 * 
 * @param project - The project to initialize the cache for
 */
export function initializeProjectCache(project: Project): void {
  const projectId = project.id;
  
  // For new projects, we use predefined values
  if (project.isNew) {
    updateProjectMarketData(
      projectId,
      {
        price: project.price,
        marketCap: project.marketCap,
        volume24h: project.volume24h,
        change24h: project.change24h
      },
      true, // Mark as API success since these are the correct values
      true  // Mark as new project
    );
    
    // New projects have no token holders
    updateProjectTokenHolders(projectId, []);
  } else {
    // For existing projects, start with null values - they'll be updated by the API
    updateProjectMarketData(
      projectId,
      {
        price: null,
        marketCap: null,
        volume24h: null,
        change24h: null
      },
      false,
      false
    );
  }
  
  console.log(`Initialized cache for project ${projectId} (isNew: ${project.isNew})`);
}

/**
 * Force refresh the project cache for a specific project
 * 
 * @param projectId - The project ID to refresh
 */
export function invalidateProjectCache(projectId: number): void {
  if (projectCache[projectId]) {
    // Keep the project's data but mark it as invalid by setting timestamp to 1970
    projectCache[projectId].lastUpdated = new Date(0);
    console.log(`Invalidated cache for project ${projectId}`);
  }
}

/**
 * Force refresh the entire project cache
 */
export function invalidateAllProjectCaches(): void {
  for (const projectId in projectCache) {
    invalidateProjectCache(parseInt(projectId));
  }
  console.log('Invalidated all project caches');
}

// Export the cache for testing purposes
export const _projectCache = projectCache;