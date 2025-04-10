import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPointTransactionSchema,
  type Project
} from "@shared/schema";
import {
  ProjectMarketData,
  ProjectTokenHolders,
  ProjectCacheEntry,
  CACHE_DURATION_MINUTES,
  isCacheValid,
  getProjectMarketData,
  getProjectTokenHolders,
  updateProjectMarketData,
  updateProjectTokenHolders,
  initializeProjectCache,
  invalidateProjectCache,
  invalidateAllProjectCaches,
  _projectCache as projectCache
} from "./cache";
import { 
  fetchDexScreenerPriceHistory, 
  getTokenStats as getDexScreenerTokenStats, 
  X23_PAIR_ADDRESS,
  CTZN_PAIR_ADDRESS,
  PRSM_PAIR_ADDRESS,
  GRNDT_PAIR_ADDRESS
} from "./services/dexscreener";
import { generateRealisticX23Data } from "./services/sample-data";
import { 
  fetchTokenHolders, 
  TokenHolderData as TokenHolderDataType,
  TOKEN_ADDRESSES 
} from "./services/token-holders";
import { 
  getTokenStats as getGeckoTerminalTokenStats, 
  fetchPriceHistory as fetchGeckoTerminalPriceHistory, 
  X23_POOL_ADDRESS,
  CTZN_POOL_ADDRESS,
  PRSM_POOL_ADDRESS,
  GRNDT_POOL_ADDRESS,
  X23_TOKEN_ADDRESS,
  CTZN_TOKEN_ADDRESS,
  PRSM_TOKEN_ADDRESS,
  GRNDT_TOKEN_ADDRESS
} from "./services/geckoterminal";
import { registerAdminRoutes } from "./api/admin";
import { registerWalletRoutes } from "./api/wallet";

// Deprecated caches - use the centralized cache from './cache.ts' instead
// These are kept for backward compatibility with existing code
const projectDataCache: Record<number, { lastUpdated: Date, data: any }> = {};
const tokenHoldersCache: Record<number, { lastUpdated: Date, data: any }> = {};

// Check if token holders cache is valid (less than 15 minutes old)
function isTokenHoldersCacheValid(projectId: number): boolean {
  if (!tokenHoldersCache[projectId]) return false;
  
  // Always refetch token holders data to ensure it's up-to-date for all projects
  // This ensures consistent behavior across all project pages
  return false;
  
  // The code below is no longer used but kept for reference
  /*
  const now = new Date();
  const cacheTime = tokenHoldersCache[projectId].lastUpdated;
  const diffMs = now.getTime() - cacheTime.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  return diffMinutes < 15; // Cache is valid if less than 15 minutes old
  */
}

// Function to update token holders cache for a project
async function updateTokenHoldersCache(projectId: number): Promise<void> {
  try {
    console.log(`Updating token holders cache for project ${projectId}`);
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      console.error(`Project with ID ${projectId} not found`);
      return;
    }
    
    // Only update token holders for launched projects
    if (project.isNew) {
      return;
    }
    
    // Check if required API key is available
    if (!process.env.COVALENT_API_KEY) {
      console.error('COVALENT_API_KEY environment variable not set');
      console.log('Falling back to local cache data for token holders');
      return;
    }
    
    let tokenHolders = [];
    
    // Use the Covalent API to fetch token holders
    console.log(`Fetching token holders for ${project.tokenSymbol} from Covalent API`);
    tokenHolders = await fetchTokenHolders(project.contractAddress);
    
    if (tokenHolders.length > 0) {
      // Cache the token holders data
      tokenHoldersCache[projectId] = {
        lastUpdated: new Date(),
        data: tokenHolders
      };
      console.log(`Updated token holders cache for project ${projectId} with ${tokenHolders.length} holders`);
    } else {
      console.warn(`No token holders found for ${project.tokenSymbol}, using previously cached data if available`);
    }
  } catch (error) {
    console.error(`Error updating token holders cache for project ${projectId}:`, error);
  }
}

// Function to update the price cache for all projects
async function updateAllProjectCaches(): Promise<void> {
  try {
    console.log('Refreshing project data cache for all projects');
    const projects = await storage.getAllProjects();
    
    // Process each project to update its cache
    for (const project of projects) {
      try {
        await updateProjectCache(project.id);
        
        // Also update token holders cache for launched projects
        if (!project.isNew) {
          await updateTokenHoldersCache(project.id);
        }
      } catch (error) {
        console.error(`Error updating cache for project ${project.id}:`, error);
      }
    }
    console.log('Project data cache refresh completed');
  } catch (error) {
    console.error('Error refreshing project data cache:', error);
  }
}

// Function to update a single project's cache
async function updateProjectCache(projectId: number): Promise<void> {
  try {
    console.log(`Updating cache for project ${projectId}`);
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      console.error(`Project with ID ${projectId} not found`);
      return;
    }
    
    // X23 - Use real-time data from GeckoTerminal or DexScreener
    if (projectId === 1) {
      try {
        // Try GeckoTerminal first
        const geckoStats = await getGeckoTerminalTokenStats(X23_POOL_ADDRESS);
        
        if (geckoStats) {
          console.log('Retrieved real-time stats for X23 from GeckoTerminal:', geckoStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            },
            true // API success
          );
          return;
        }
        
        // If GeckoTerminal fails, try DexScreener
        console.log('GeckoTerminal data unavailable, trying DexScreener for X23');
        const dexStats = await getDexScreenerTokenStats(X23_PAIR_ADDRESS, 'X23');
        
        if (dexStats) {
          console.log('Retrieved real-time stats for X23 from DexScreener:', dexStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            },
            true // API success
          );
          return;
        }
      } catch (error) {
        console.error('Error fetching real-time X23 data:', error);
      }
    }
    // CTZN - Use real-time data if available
    else if (projectId === 2) {
      try {
        // Try GeckoTerminal first
        const geckoStats = await getGeckoTerminalTokenStats(CTZN_POOL_ADDRESS);
        
        if (geckoStats) {
          console.log('Retrieved real-time stats for CTZN from GeckoTerminal:', geckoStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            },
            true // API success
          );
          return;
        }
        
        // If GeckoTerminal fails, try DexScreener
        console.log('GeckoTerminal data unavailable, trying DexScreener for CTZN');
        const dexStats = await getDexScreenerTokenStats(CTZN_PAIR_ADDRESS, 'CTZN');
        
        if (dexStats) {
          console.log('Retrieved real-time stats for CTZN from DexScreener:', dexStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            },
            true // API success
          );
          return;
        }
      } catch (error) {
        console.error('Error fetching real-time CTZN data:', error);
      }
    }
    // GRNDT - Use real-time data if available
    else if (projectId === 3) {
      try {
        // Try GeckoTerminal first
        const geckoStats = await getGeckoTerminalTokenStats(GRNDT_POOL_ADDRESS);
        
        if (geckoStats) {
          console.log('Retrieved real-time stats for GRNDT from GeckoTerminal:', geckoStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            },
            true // API success
          );
          return;
        }
        
        // If GeckoTerminal fails, try DexScreener
        console.log('GeckoTerminal data unavailable, trying DexScreener for GRNDT');
        const dexStats = await getDexScreenerTokenStats(GRNDT_PAIR_ADDRESS, 'GRNDT');
        
        if (dexStats) {
          console.log('Retrieved real-time stats for GRNDT from DexScreener:', dexStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            },
            true // API success
          );
          return;
        }
      } catch (error) {
        console.error('Error fetching real-time GRNDT data:', error);
      }
    }
    // PRSM - Use real-time data if available
    else if (projectId === 4) {
      try {
        // Try GeckoTerminal first
        const geckoStats = await getGeckoTerminalTokenStats(PRSM_POOL_ADDRESS);
        
        if (geckoStats) {
          console.log('Retrieved real-time stats for PRSM from GeckoTerminal:', geckoStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            },
            true // API success
          );
          return;
        }
        
        // If GeckoTerminal fails, try DexScreener
        console.log('GeckoTerminal data unavailable, trying DexScreener for PRSM');
        const dexStats = await getDexScreenerTokenStats(PRSM_PAIR_ADDRESS, 'PRSM');
        
        if (dexStats) {
          console.log('Retrieved real-time stats for PRSM from DexScreener:', dexStats);
          
          // Update the cache with the latest API data
          // Old cache system (deprecated but kept for compatibility)
          projectDataCache[projectId] = {
            lastUpdated: new Date(),
            data: {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            }
          };
          
          // Update the centralized cache system
          updateProjectMarketData(
            projectId,
            {
              price: dexStats.priceUsd,
              marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
              volume24h: dexStats.volume24h,
              change24h: dexStats.priceChange24h
            },
            true // API success
          );
          return;
        }
      } catch (error) {
        console.error('Error fetching real-time PRSM data:', error);
      }
    }
    
    // If we can't get API data or for other projects, check if storage data is reliable
    // Flag to determine if we were able to fetch valid data from APIs
    // This is more reliable than checking for non-zero values
    let hasValidApiFetch = false; // We'll set this to true only when API calls succeed
    
    // Check if the storage data appears valid
    const hasValidPrice = project.price > 0;
    const hasValidMarketCap = project.marketCap > 0;
    const hasValidData = hasValidPrice && hasValidMarketCap;
    
    // In production environment, NEVER trust the storage values for production projects 
    // since they might be incorrect. Only use verified API data
    const isProductionEnv = process.env.NODE_ENV === 'production';
    const isLaunchedProject = projectId <= 4; // Projects 1-4 are launched, 5+ are new
    
    // If we're in production and dealing with a launched project, but API calls failed,
    // use placeholder values to trigger the UI fallback
    if (isProductionEnv && isLaunchedProject && !hasValidApiFetch) {
      projectDataCache[projectId] = {
        lastUpdated: new Date(),
        data: {
          price: 0,
          marketCap: 0,
          volume24h: 0,
          change24h: 0
        }
      };
      console.log(`PRODUCTION: Using fallback values for project ${projectId} since API calls failed`);
    } else if (project.isNew) {
      // For new projects, use the predefined values from storage
      // They're assumed to be correct (price = 0.069, marketCap = 400000)
      projectDataCache[projectId] = {
        lastUpdated: new Date(),
        data: {
          price: project.price,
          marketCap: project.marketCap,
          volume24h: project.volume24h,
          change24h: project.change24h
        }
      };
      console.log(`Using predefined values for new project ${projectId}`);
    } else if (hasValidData) {
      // For dev environment or non-launched projects, use storage data if it's valid
      projectDataCache[projectId] = {
        lastUpdated: new Date(),
        data: {
          price: project.price,
          marketCap: project.marketCap,
          volume24h: project.volume24h,
          change24h: project.change24h
        }
      };
      console.log(`Using valid storage data for project ${projectId}`);
    } else {
      // If all else fails, store placeholder values to trigger the fallback UI display
      projectDataCache[projectId] = {
        lastUpdated: new Date(),
        data: {
          price: 0,
          marketCap: 0,
          volume24h: 0,
          change24h: 0
        }
      };
      console.log(`Stored placeholder values for project ${projectId} due to invalid data`);
    }
  } catch (error) {
    console.error(`Error updating cache for project ${projectId}:`, error);
    
    // On error, ensure we don't crash but still store safe default values
    projectDataCache[projectId] = {
      lastUpdated: new Date(),
      data: {
        price: 0,
        marketCap: 0,
        volume24h: 0,
        change24h: 0
      }
    };
  }
}

// Get cached project data or fetch from storage
async function getProjectData(projectId: number): Promise<{
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}> {
  // If we have valid cached data, return it
  if (isCacheValid(projectId)) {
    console.log(`Using cached data for project ${projectId} from ${projectDataCache[projectId].lastUpdated}`);
    return projectDataCache[projectId].data;
  }
  
  // Otherwise, get from storage
  const project = await storage.getProjectById(projectId);
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  
  // Check if the storage data appears valid before caching it
  const hasValidPrice = project.price > 0;
  const hasValidMarketCap = project.marketCap > 0;
  const hasValidData = hasValidPrice && hasValidMarketCap;
  
  // Check environment and project type
  const isProductionEnv = process.env.NODE_ENV === 'production';
  const isLaunchedProject = projectId <= 4; // Projects 1-4 are launched, 5+ are new
  
  if (project.isNew) {
    // For new projects, always use the predefined values (price = 0.069, marketCap = 400000)
    projectDataCache[projectId] = {
      lastUpdated: new Date(),
      data: {
        price: project.price,
        marketCap: project.marketCap,
        volume24h: project.volume24h,
        change24h: project.change24h
      }
    };
    console.log(`Using predefined values for new project ${projectId}`);
  } else if (isProductionEnv && isLaunchedProject) {
    // In production for launched projects, we can't trust the storage values
    // Return zeros to force the UI to show "-" placeholders
    projectDataCache[projectId] = {
      lastUpdated: new Date(),
      data: {
        price: 0,
        marketCap: 0,
        volume24h: 0,
        change24h: 0
      }
    };
    console.log(`PRODUCTION: Using fallback values for launched project ${projectId}`);
  } else if (hasValidData) {
    // For dev environment or valid data, use storage values
    projectDataCache[projectId] = {
      lastUpdated: new Date(),
      data: {
        price: project.price,
        marketCap: project.marketCap,
        volume24h: project.volume24h,
        change24h: project.change24h
      }
    };
    console.log(`Updated cache for project ${projectId} with valid data from storage`);
  } else {
    // If storage data appears invalid, use placeholder values
    projectDataCache[projectId] = {
      lastUpdated: new Date(),
      data: {
        price: 0,
        marketCap: 0,
        volume24h: 0,
        change24h: 0
      }
    };
    console.log(`Stored placeholder values for project ${projectId} due to invalid storage data`);
  }
  
  return projectDataCache[projectId].data;
}
// Dune services removed - no longer using token metrics

// No additional imports needed here

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  
  // Initialize the project data cache when server starts
  await updateAllProjectCaches();
  
  // Set up a timer to refresh the cache every 30 minutes
  setInterval(async () => {
    console.log(`Running scheduled cache refresh (every ${CACHE_DURATION_MINUTES} minutes)`);
    await updateAllProjectCaches();
  }, CACHE_DURATION_MINUTES * 60 * 1000); // 30 minutes in milliseconds
  
  // Register admin endpoints
  registerAdminRoutes(app);
  
  // Register wallet endpoints
  registerWalletRoutes(app);
  
  // put application routes here
  // prefix all routes with /api
  
  // Get all projects with optional filters
  app.get('/api/projects', async (req, res) => {
    try {
      const category = req.query.category as string || 'all';
      const sortBy = req.query.sortBy as string || 'marketCap';
      
      let projects = await storage.getAllProjects();
      
      // Apply cached price data to all projects
      const projectsWithCachedData = await Promise.all(projects.map(async (project) => {
        try {
          // Get cached price data for this project
          const priceData = await getProjectData(project.id);
          
          // Return project with updated price data
          return {
            ...project,
            price: priceData.price,
            marketCap: priceData.marketCap,
            volume24h: priceData.volume24h,
            change24h: priceData.change24h
          };
        } catch (error) {
          // If error occurs, return original project data
          console.error(`Error getting cached data for project ${project.id}:`, error);
          return project;
        }
      }));
      
      // Use the projects with cached data
      projects = projectsWithCachedData;
      
      // Filter by category if not 'all'
      if (category !== 'all') {
        projects = projects.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      
      // Sort projects
      projects = projects.sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'marketCap') {
          return b.marketCap - a.marketCap;
        } else if (sortBy === 'price') {
          return b.price - a.price;
        } else if (sortBy === 'volume24h') {
          return b.volume24h - a.volume24h;
        } else if (sortBy === 'change24h') {
          return b.change24h - a.change24h;
        } else if (sortBy === 'rank') {
          return a.rank - b.rank; // Lower rank is better (1st, 2nd, etc.)
        }
        
        return 0;
      });
      
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });
  
  // Get project by ID with its features and technical details
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const features = await storage.getProjectFeatures(id);
      const technicalDetails = await storage.getProjectTechnicalDetails(id);
      
      let updatedProject;
      
      // For X23 (id=1), fetch real-time data from external sources
      if (id === 1) {
        console.log('Fetching real-time data for X23 project detail page');
        
        try {
          // Try GeckoTerminal first
          const geckoStats = await getGeckoTerminalTokenStats(X23_POOL_ADDRESS);
          
          if (geckoStats) {
            console.log('Retrieved real-time stats for X23 from GeckoTerminal:', geckoStats);
            
            updatedProject = {
              ...project,
              price: geckoStats.priceUsd,
              marketCap: geckoStats.marketCap,
              volume24h: geckoStats.volume24h,
              change24h: geckoStats.priceChange24h
            };
            
            // Update the cache with the latest API data
            projectDataCache[id] = {
              lastUpdated: new Date(),
              data: {
                price: geckoStats.priceUsd,
                marketCap: geckoStats.marketCap,
                volume24h: geckoStats.volume24h,
                change24h: geckoStats.priceChange24h
              }
            };
          } else {
            // If GeckoTerminal fails, try DexScreener
            console.log('GeckoTerminal data unavailable, trying DexScreener for X23');
            const dexStats = await getDexScreenerTokenStats(X23_PAIR_ADDRESS, 'X23');
            
            if (dexStats) {
              console.log('Retrieved real-time stats for X23 from DexScreener:', dexStats);
              
              updatedProject = {
                ...project,
                price: dexStats.priceUsd,
                marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
                volume24h: dexStats.volume24h,
                change24h: dexStats.priceChange24h
              };
              
              // Update the cache with the latest API data
              projectDataCache[id] = {
                lastUpdated: new Date(),
                data: {
                  price: dexStats.priceUsd,
                  marketCap: dexStats.marketCap || dexStats.fdv || project.marketCap,
                  volume24h: dexStats.volume24h,
                  change24h: dexStats.priceChange24h
                }
              };
            } else {
              // If both fail, use storage data
              console.log('External APIs failed, using storage data for X23');
              updatedProject = { ...project };
            }
          }
        } catch (error) {
          console.error('Error fetching real-time X23 data:', error);
          // If error occurs, use storage data
          updatedProject = { ...project };
        }
      } else {
        // For all other projects, use cached data
        const priceData = await getProjectData(id);
        
        updatedProject = {
          ...project,
          price: priceData.price,
          marketCap: priceData.marketCap,
          volume24h: priceData.volume24h,
          change24h: priceData.change24h
        };
      }
      
      res.json({
        ...updatedProject,
        features,
        technicalDetails
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project details' });
    }
  });
  
  // USER ENDPOINTS
  
  // Get all users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  // Get user by ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const transactions = await storage.getUserTransactions(id);
      
      res.json({
        ...user,
        transactions
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  });
  
  // Create new user
  app.post('/api/users', async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.message });
      }
      
      const userData = validationResult.data;
      const user = await storage.createUser(userData);
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  // POINTS ENDPOINTS
  
  // Get top users leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await storage.getTopUsers(limit);
      res.json(users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });
  
  // Add point transaction for user
  app.post('/api/points/transactions', async (req, res) => {
    try {
      const validationResult = insertPointTransactionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.message });
      }
      
      const transactionData = validationResult.data;
      const transaction = await storage.addPointTransaction(transactionData);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating point transaction:', error);
      res.status(500).json({ error: 'Failed to create point transaction' });
    }
  });
  
  // Get a user's points
  app.get('/api/users/:id/points', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const points = await storage.getUserPoints(id);
      res.json({ userId: id, points });
    } catch (error) {
      console.error('Error fetching user points:', error);
      res.status(500).json({ error: 'Failed to fetch user points' });
    }
  });
  
  // Get a user's point transactions
  app.get('/api/users/:id/transactions', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const transactions = await storage.getUserTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({ error: 'Failed to fetch user transactions' });
    }
  });
  
  // PRICE HISTORY ENDPOINTS
  
  // Get token holders for a project
  app.get('/api/projects/:id/token-holders', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // For new projects, return an empty array to avoid API calls
      if (project.isNew) {
        console.log(`Project ${project.name} is new, returning empty token holders array`);
        return res.json([]);
      }
      
      // Check if force refresh is requested via query param
      const forceRefresh = req.query.refresh === 'true';
      
      // Always fetch fresh data for X23 token to match the screenshot values
      // or if force refresh is requested (for debugging/testing)
      if (id === 1 || forceRefresh) {
        console.log(`Forcing fetch of token holders data for ${project.tokenSymbol} (project id ${id})`);
        // Force fetch from our customized token service which now uses Covalent API
        const tokenHolders = await fetchTokenHolders(project.contractAddress);
        
        // Update cache with fresh data
        tokenHoldersCache[id] = {
          lastUpdated: new Date(),
          data: tokenHolders
        };
        
        console.log(`Updated token holders cache for project ${id} with ${tokenHolders.length} holders`);
        return res.json(tokenHolders);
      }
      
      // Check if we have valid cached token holder data
      if (isTokenHoldersCacheValid(id)) {
        console.log(`Using cached token holders for project ${id} from ${tokenHoldersCache[id].lastUpdated}`);
        return res.json(tokenHoldersCache[id].data);
      }
      
      // If cache is invalid, fetch new data from Covalent API
      console.log(`Fetching token holders for ${project.tokenSymbol} using Covalent API`);
      const tokenHolders = await fetchTokenHolders(project.contractAddress);
      
      // Cache the token holders data
      tokenHoldersCache[id] = {
        lastUpdated: new Date(),
        data: tokenHolders
      };
      
      console.log(`Updated token holders cache for project ${id} with ${tokenHolders.length} holders`);
      res.json(tokenHolders);
    } catch (error) {
      console.error('Error fetching token holders:', error);
      res.status(500).json({ error: 'Failed to fetch token holders' });
    }
  });
  
  // Get price history for a project
  app.get('/api/projects/:id/price-history', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const timeframe = req.query.timeframe as string || undefined;
      
      // For X23.ai (project ID 1), try to use real data from GeckoTerminal
      if (id === 1) {
        console.log(`Fetching price data for X23.ai (timeframe: ${timeframe || 'all'})`);
        
        try {
          // Try GeckoTerminal for historical data
          console.log('Attempting to fetch historical data from GeckoTerminal');
          const geckoTerminalHistory = await fetchGeckoTerminalPriceHistory(X23_POOL_ADDRESS, timeframe);
          
          if (geckoTerminalHistory.length > 0) {
            console.log(`Retrieved ${geckoTerminalHistory.length} price points from GeckoTerminal`);
            return res.json(geckoTerminalHistory);
          }
          
          console.log('GeckoTerminal data not available, trying DexScreener');
          
          // If GeckoTerminal fails, try DexScreener as a fallback
          const tokenStats = await getDexScreenerTokenStats(X23_PAIR_ADDRESS, 'X23');
          
          if (tokenStats) {
            // Try DexScreener for historical data
            const dexScreenerHistory = await fetchDexScreenerPriceHistory(X23_PAIR_ADDRESS, timeframe);
            
            if (dexScreenerHistory.length > 0) {
              console.log(`Retrieved ${dexScreenerHistory.length} price points from DexScreener`);
              return res.json(dexScreenerHistory);
            } else {
              console.warn('Failed to get historical price data from DexScreener, using realistic simulation data');
              
              // Use our realistic X23 price data generator as a final fallback
              const generatedData = generateRealisticX23Data(timeframe);
              
              if (generatedData.length > 0) {
                // Adjust the latest price to match the real-time price
                const currentPrice = tokenStats.priceUsd;
                
                if (currentPrice) {
                  // Calculate the ratio between real price and generated price
                  const latestGeneratedPrice = parseFloat(generatedData[generatedData.length - 1].price);
                  const priceRatio = currentPrice / latestGeneratedPrice;
                  
                  // Apply the ratio to all prices to match current price scale
                  const adjustedData = generatedData.map(entry => {
                    const entryPrice = parseFloat(entry.price);
                    const adjustedPrice = entryPrice * priceRatio;
                    
                    return {
                      ...entry,
                      price: adjustedPrice.toString(),
                      ethPrice: (parseFloat(entry.ethPrice || "0") * priceRatio).toString(),
                      marketCap: (parseFloat(entry.marketCap || "0") * priceRatio).toString()
                    };
                  });
                  
                  console.log(`Generated ${adjustedData.length} realistic price points for X23`);
                  return res.json(adjustedData);
                }
                
                console.log(`Generated ${generatedData.length} realistic price points for X23 (no price adjustment)`);
                return res.json(generatedData);
              }
            }
          }
          
          // Last attempt: Use stored data as a final fallback
          const storedHistory = await storage.getProjectPriceHistory(id, timeframe);
          
          if (storedHistory.length > 0) {
            console.log(`Using ${storedHistory.length} stored price points as final fallback`);
            return res.json(storedHistory);
          }
          
          console.warn('Failed to get any real price data, falling back to stored data');
        } catch (error) {
          console.error('Error fetching real price data for X23:', error);
          console.warn('Error occurred while fetching real price data, falling back to stored data');
        }
      }
      
      // For Citizen Wallet (CTZN) project (ID 2), try to fetch real data
      else if (id === 2) {
        console.log(`Fetching price data for Citizen Wallet (CTZN) (timeframe: ${timeframe || 'all'})`);
        
        try {
          // Try GeckoTerminal for historical data
          console.log('Attempting to fetch historical data from GeckoTerminal for CTZN');
          const geckoTerminalHistory = await fetchGeckoTerminalPriceHistory(CTZN_POOL_ADDRESS, timeframe);
          
          if (geckoTerminalHistory.length > 0) {
            // Need to update the projectId from the default value (1) to CTZN's project ID
            const updatedHistory = geckoTerminalHistory.map(entry => ({
              ...entry,
              projectId: 2 // CTZN project ID
            }));
            
            console.log(`Retrieved ${updatedHistory.length} price points from GeckoTerminal for CTZN`);
            return res.json(updatedHistory);
          }
          
          // GeckoTerminal failed, try DexScreener as a fallback
          console.log('GeckoTerminal data not available for CTZN, trying DexScreener');
          const dexScreenerStats = await getDexScreenerTokenStats(CTZN_PAIR_ADDRESS, 'CTZN');
          
          if (dexScreenerStats) {
            // Try DexScreener for historical data
            const dexScreenerHistory = await fetchDexScreenerPriceHistory(CTZN_PAIR_ADDRESS, timeframe);
            
            if (dexScreenerHistory.length > 0) {
              // Update the projectId from the default value (1) to CTZN's project ID
              const updatedHistory = dexScreenerHistory.map(entry => ({
                ...entry,
                projectId: 2 // CTZN project ID
              }));
              
              console.log(`Retrieved ${updatedHistory.length} price points from DexScreener for CTZN`);
              return res.json(updatedHistory);
            }
          }
          
          // If both GeckoTerminal and DexScreener fail, fall back to stored data
          console.log('GeckoTerminal and DexScreener data not available for CTZN, falling back to stored data');
        } catch (error) {
          console.error('Error fetching real price data for CTZN:', error);
          console.warn('Error occurred while fetching real price data for CTZN, falling back to stored data');
        }
      }
      
      // For Prismo Technology (PRSM) project (ID 4), try to fetch real data
      else if (id === 4) {
        console.log(`Fetching price data for Prismo Technology (PRSM) (timeframe: ${timeframe || 'all'})`);
        
        try {
          // Try GeckoTerminal for historical data
          console.log('Attempting to fetch historical data from GeckoTerminal for PRSM');
          const geckoTerminalHistory = await fetchGeckoTerminalPriceHistory(PRSM_POOL_ADDRESS, timeframe);
          
          if (geckoTerminalHistory.length > 0) {
            // Need to update the projectId from the default value (1) to PRSM's project ID
            const updatedHistory = geckoTerminalHistory.map(entry => ({
              ...entry,
              projectId: 4 // PRSM project ID
            }));
            
            console.log(`Retrieved ${updatedHistory.length} price points from GeckoTerminal for PRSM`);
            return res.json(updatedHistory);
          }
          
          // GeckoTerminal failed, try DexScreener as a fallback
          console.log('GeckoTerminal data not available for PRSM, trying DexScreener');
          const dexScreenerStats = await getDexScreenerTokenStats(PRSM_PAIR_ADDRESS, 'PRSM');
          
          if (dexScreenerStats) {
            // Try DexScreener for historical data
            const dexScreenerHistory = await fetchDexScreenerPriceHistory(PRSM_PAIR_ADDRESS, timeframe);
            
            if (dexScreenerHistory.length > 0) {
              // Update the projectId from the default value (1) to PRSM's project ID
              const updatedHistory = dexScreenerHistory.map(entry => ({
                ...entry,
                projectId: 4 // PRSM project ID
              }));
              
              console.log(`Retrieved ${updatedHistory.length} price points from DexScreener for PRSM`);
              return res.json(updatedHistory);
            }
          }
          
          // If both GeckoTerminal and DexScreener fail, fall back to stored data
          console.log('GeckoTerminal and DexScreener data not available for PRSM, falling back to stored data');
        } catch (error) {
          console.error('Error fetching real price data for PRSM:', error);
          console.warn('Error occurred while fetching real price data for PRSM, falling back to stored data');
        }
      }
      
      // For Grand Timeline (GRNDT token), try to fetch real data
      else if (id === 3) {
        const projectName = "Grand Timeline";
        console.log(`Fetching price data for ${projectName} (GRNDT) (timeframe: ${timeframe || 'all'})`);
        
        try {
          // Try GeckoTerminal for historical data
          console.log(`Attempting to fetch historical data from GeckoTerminal for ${projectName} (GRNDT)`);
          const geckoTerminalHistory = await fetchGeckoTerminalPriceHistory(GRNDT_POOL_ADDRESS, timeframe);
          
          if (geckoTerminalHistory.length > 0) {
            // Need to update the projectId from the default value (1) to the correct project ID
            const updatedHistory = geckoTerminalHistory.map(entry => ({
              ...entry,
              projectId: id // Use the requested project ID (3 or 5)
            }));
            
            console.log(`Retrieved ${updatedHistory.length} price points from GeckoTerminal for ${projectName} (GRNDT)`);
            return res.json(updatedHistory);
          }
          
          // GeckoTerminal failed, try DexScreener as a fallback
          console.log(`GeckoTerminal data not available for ${projectName} (GRNDT), trying DexScreener`);
          const dexScreenerStats = await getDexScreenerTokenStats(GRNDT_PAIR_ADDRESS, 'GRNDT');
          
          if (dexScreenerStats) {
            // Try DexScreener for historical data
            const dexScreenerHistory = await fetchDexScreenerPriceHistory(GRNDT_PAIR_ADDRESS, timeframe);
            
            if (dexScreenerHistory.length > 0) {
              // Update the projectId from the default value (1) to the correct project ID
              const updatedHistory = dexScreenerHistory.map(entry => ({
                ...entry,
                projectId: id // Use the requested project ID (3 or 5)
              }));
              
              console.log(`Retrieved ${updatedHistory.length} price points from DexScreener for ${projectName} (GRNDT)`);
              return res.json(updatedHistory);
            }
          }
          
          // If both GeckoTerminal and DexScreener fail, fall back to stored data
          console.log(`GeckoTerminal and DexScreener data not available for ${projectName} (GRNDT), falling back to stored data`);
        } catch (error) {
          console.error(`Error fetching real price data for ${projectName} (GRNDT):`, error);
          console.warn(`Error occurred while fetching real price data for ${projectName} (GRNDT), falling back to stored data`);
        }
      }
      
      // For other projects or if DexScreener failed, use stored data
      const priceHistory = await storage.getProjectPriceHistory(id, timeframe);
      res.json(priceHistory);
    } catch (error) {
      console.error('Error fetching price history:', error);
      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  });

  // Return 404 for removed endpoints
  app.get('/api/projects/:id/token-distribution', (req, res) => {
    res.status(404).json({ error: 'Endpoint has been removed' });
  });

  app.get('/api/projects/:id/token-unlocks', (req, res) => {
    res.status(404).json({ error: 'Endpoint has been removed' });
  });

  app.get('/api/projects/:id/trading-activity', (req, res) => {
    res.status(404).json({ error: 'Endpoint has been removed' });
  });
  
  // API endpoint to clear the caches
  app.post('/api/cache/clear', async (req, res) => {
    console.log('Clearing all caches');
    // Clear all properties of the caches while maintaining the reference
    Object.keys(projectDataCache).forEach(key => delete projectDataCache[Number(key)]);
    Object.keys(tokenHoldersCache).forEach(key => delete tokenHoldersCache[Number(key)]);
    
    // Immediately rebuild the cache with fresh data
    await updateAllProjectCaches();
    
    console.log('All caches cleared successfully');
    res.json({ success: true, message: 'All caches cleared successfully' });
  });
  
  // Update a project (admin route)
  app.patch('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      // Get the fields to update from the request body
      const updates = req.body;
      
      // Update the project in storage
      const updatedProject = await storage.updateProject(id, updates);
      
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Project updated successfully
      return res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
