import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPointTransactionSchema,
  type Project
} from "@shared/schema";
import { fetchDexScreenerPriceHistory, getTokenStats as getDexScreenerTokenStats, X23_PAIR_ADDRESS } from "./services/dexscreener";
import { generateRealisticX23Data } from "./services/sample-data";
import { fetchTopTokenHolders as fetchOriginalTokenHolders } from "./services/token-holders";
import { 
  getTokenStats as getGeckoTerminalTokenStats, 
  fetchPriceHistory as fetchGeckoTerminalPriceHistory, 
  fetchTopTokenHolders as fetchGeckoTokenHolders, 
  X23_POOL_ADDRESS,
  CTZN_POOL_ADDRESS,
  X23_TOKEN_ADDRESS,
  CTZN_TOKEN_ADDRESS 
} from "./services/geckoterminal";
import {
  getTokenDistribution,
  getTokenUnlockSchedule,
  getTokenTradingActivity
} from "./services/dune";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  
  // Get all projects with optional filters
  app.get('/api/projects', async (req, res) => {
    try {
      const category = req.query.category as string || 'all';
      const sortBy = req.query.sortBy as string || 'marketCap';
      
      let projects = await storage.getAllProjects();
      
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
      
      let updatedProject = { ...project };
      
      // For X23.ai, get real-time data from GeckoTerminal
      if (id === 1) {
        try {
          console.log('Fetching real-time data for X23.ai from GeckoTerminal');
          const tokenStats = await getGeckoTerminalTokenStats(X23_POOL_ADDRESS);
          
          if (tokenStats) {
            console.log('Retrieved real-time stats from GeckoTerminal:', tokenStats);
            updatedProject = {
              ...updatedProject,
              price: tokenStats.priceUsd,
              change24h: tokenStats.priceChange24h,
              volume24h: tokenStats.volume24h,
              marketCap: tokenStats.marketCap || tokenStats.fdv,
              // Update more fields if available
              ...(tokenStats.totalSupply ? { totalSupply: tokenStats.totalSupply } : {}),
              ...(tokenStats.tokenName ? { tokenName: tokenStats.tokenName } : {}),
              ...(tokenStats.tokenSymbol ? { tokenSymbol: tokenStats.tokenSymbol } : {})
            };
          } else {
            // Fallback to DexScreener if GeckoTerminal fails
            console.log('GeckoTerminal data not available, trying DexScreener');
            const dexScreenerStats = await getDexScreenerTokenStats(X23_PAIR_ADDRESS);
            
            if (dexScreenerStats) {
              console.log('Retrieved real-time stats from DexScreener:', dexScreenerStats);
              updatedProject = {
                ...updatedProject,
                price: dexScreenerStats.priceUsd,
                change24h: dexScreenerStats.priceChange24h,
                volume24h: dexScreenerStats.volume24h,
                // Only update other values if they exist
                ...(dexScreenerStats.fdv ? { marketCap: dexScreenerStats.fdv } : {})
              };
            }
          }
        } catch (err) {
          console.error('Error fetching real-time token stats for X23:', err);
          // Continue with stored data if real-time fetch fails
        }
      }
      
      // For Citizen Wallet (CTZN), get real-time data from GeckoTerminal
      else if (id === 4) {
        try {
          console.log('Fetching real-time data for Citizen Wallet (CTZN) from GeckoTerminal');
          const tokenStats = await getGeckoTerminalTokenStats(CTZN_POOL_ADDRESS);
          
          if (tokenStats) {
            console.log('Retrieved real-time stats for CTZN from GeckoTerminal:', tokenStats);
            updatedProject = {
              ...updatedProject,
              price: tokenStats.priceUsd,
              change24h: tokenStats.priceChange24h,
              volume24h: tokenStats.volume24h,
              marketCap: tokenStats.marketCap || tokenStats.fdv,
              // Update more fields if available
              ...(tokenStats.totalSupply ? { totalSupply: tokenStats.totalSupply } : {}),
              ...(tokenStats.tokenName ? { tokenName: tokenStats.tokenName } : {}),
              ...(tokenStats.tokenSymbol ? { tokenSymbol: tokenStats.tokenSymbol } : {})
            };
          }
        } catch (err) {
          console.error('Error fetching real-time token stats for CTZN:', err);
          // Continue with stored data if real-time fetch fails
        }
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
      
      // Fetch token holders - use different methods based on project ID
      let tokenHolders = [];
      
      if (id === 1) {
        // X23 token holders
        tokenHolders = await fetchGeckoTokenHolders(X23_TOKEN_ADDRESS);
      } else if (id === 4) {
        // CTZN token holders
        try {
          console.log('Fetching token holders for CTZN from GeckoTerminal');
          tokenHolders = await fetchGeckoTokenHolders(CTZN_TOKEN_ADDRESS);
          
          // If Gecko returns empty, fall back to sample data
          if (tokenHolders.length === 0) {
            tokenHolders = await fetchOriginalTokenHolders(project.contractAddress);
          }
        } catch (err) {
          console.error('Error fetching CTZN token holders:', err);
          tokenHolders = await fetchOriginalTokenHolders(project.contractAddress);
        }
      } else {
        // Other projects
        tokenHolders = await fetchOriginalTokenHolders(project.contractAddress);
      }
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
          const tokenStats = await getDexScreenerTokenStats(X23_PAIR_ADDRESS);
          
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
      
      // For Citizen Wallet (CTZN) project (ID 4), try to fetch real data
      else if (id === 4) {
        console.log(`Fetching price data for Citizen Wallet (CTZN) (timeframe: ${timeframe || 'all'})`);
        
        try {
          // Try GeckoTerminal for historical data
          console.log('Attempting to fetch historical data from GeckoTerminal for CTZN');
          const geckoTerminalHistory = await fetchGeckoTerminalPriceHistory(CTZN_POOL_ADDRESS, timeframe);
          
          if (geckoTerminalHistory.length > 0) {
            // Need to update the projectId from the default value (1) to CTZN's project ID
            const updatedHistory = geckoTerminalHistory.map(entry => ({
              ...entry,
              projectId: 4 // CTZN project ID
            }));
            
            console.log(`Retrieved ${updatedHistory.length} price points from GeckoTerminal for CTZN`);
            return res.json(updatedHistory);
          }
          
          // If GeckoTerminal fails, fall back to stored data
          console.log('GeckoTerminal data not available for CTZN, falling back to stored data');
        } catch (error) {
          console.error('Error fetching real price data for CTZN:', error);
          console.warn('Error occurred while fetching real price data for CTZN, falling back to stored data');
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

  // DUNE ANALYTICS ENDPOINTS
  
  // Get token distribution from Dune Analytics
  app.get('/api/projects/:id/token-distribution', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Get the token contract address
      let tokenAddress = project.contractAddress;
      
      // Use specific token addresses for known projects
      if (id === 1) {
        tokenAddress = X23_TOKEN_ADDRESS;
      } else if (id === 4) {
        tokenAddress = CTZN_TOKEN_ADDRESS;
      }
      
      console.log(`Fetching token distribution from Dune for ${project.name} (${tokenAddress})`);
      
      const distribution = await getTokenDistribution(tokenAddress);
      res.json(distribution);
    } catch (error) {
      console.error('Error fetching token distribution:', error);
      res.status(500).json({ error: 'Failed to fetch token distribution data' });
    }
  });
  
  // Get token unlock schedule from Dune Analytics
  app.get('/api/projects/:id/token-unlocks', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Get the token contract address
      let tokenAddress = project.contractAddress;
      
      // Use specific token addresses for known projects
      if (id === 1) {
        tokenAddress = X23_TOKEN_ADDRESS;
      } else if (id === 4) {
        tokenAddress = CTZN_TOKEN_ADDRESS;
      }
      
      console.log(`Fetching token unlock schedule from Dune for ${project.name} (${tokenAddress})`);
      
      const unlocks = await getTokenUnlockSchedule(tokenAddress);
      res.json(unlocks);
    } catch (error) {
      console.error('Error fetching token unlock schedule:', error);
      res.status(500).json({ error: 'Failed to fetch token unlock data' });
    }
  });
  
  // Get token trading activity from Dune Analytics
  app.get('/api/projects/:id/trading-activity', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Get the token contract address
      let tokenAddress = project.contractAddress;
      
      // Use specific token addresses for known projects
      if (id === 1) {
        tokenAddress = X23_TOKEN_ADDRESS;
      } else if (id === 4) {
        tokenAddress = CTZN_TOKEN_ADDRESS;
      }
      
      console.log(`Fetching trading activity from Dune for ${project.name} (${tokenAddress}) over ${days} days`);
      
      const activity = await getTokenTradingActivity(tokenAddress, 'polygon', days);
      res.json(activity);
    } catch (error) {
      console.error('Error fetching trading activity:', error);
      res.status(500).json({ error: 'Failed to fetch trading activity data' });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
