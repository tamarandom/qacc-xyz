import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPointTransactionSchema,
  type Project
} from "@shared/schema";
import { fetchDexScreenerPriceHistory, getTokenStats, X23_PAIR_ADDRESS } from "./services/dexscreener";
import { fetchDuneAnalyticsData } from "./services/dune";
import { generateRealisticX23Data } from "./services/sample-data";

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
      
      // For X23.ai, get real-time data from DexScreener
      if (id === 1) {
        try {
          console.log('Fetching real-time data for X23.ai');
          const tokenStats = await getTokenStats(X23_PAIR_ADDRESS);
          
          if (tokenStats) {
            console.log('Retrieved real-time stats from DexScreener:', tokenStats);
            updatedProject = {
              ...updatedProject,
              price: tokenStats.priceUsd,
              change24h: tokenStats.priceChange24h,
              volume24h: tokenStats.volume24h,
              // Only update other values if they exist
              ...(tokenStats.fdv ? { marketCap: tokenStats.fdv } : {})
            };
          }
        } catch (err) {
          console.error('Error fetching real-time token stats:', err);
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
  
  // Get price history for a project
  app.get('/api/projects/:id/price-history', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const timeframe = req.query.timeframe as string || undefined;
      
      // For X23.ai (project ID 1), try to use real data from multiple sources
      if (id === 1) {
        console.log(`Fetching real price data for X23.ai (timeframe: ${timeframe || 'all'})`);
        
        try {
          // First try to get current statistics to ensure we have the latest price
          const tokenStats = await getTokenStats(X23_PAIR_ADDRESS);
          
          if (tokenStats) {
            // First attempt: Try to get historical data from Dune Analytics
            console.log('Attempting to fetch historical data from Dune Analytics');
            
            // Check if we have an API key for Dune
            if (process.env.DUNE_API_KEY) {
              try {
                const duneData = await fetchDuneAnalyticsData(4915916, timeframe);
                if (duneData.length > 0) {
                  console.log(`Retrieved ${duneData.length} price points from Dune Analytics`);
                  return res.json(duneData);
                } else {
                  console.warn('No historical data retrieved from Dune Analytics');
                }
              } catch (duneError) {
                console.error('Error fetching from Dune Analytics:', duneError);
              }
            } else {
              console.warn('No Dune API key provided, skipping Dune Analytics data fetch');
            }
            
            // Second attempt: Try DexScreener for historical data
            console.log('Attempting to fetch historical data from DexScreener');
            const realPriceHistory = await fetchDexScreenerPriceHistory(X23_PAIR_ADDRESS, timeframe);
            
            if (realPriceHistory.length > 0) {
              console.log(`Retrieved ${realPriceHistory.length} price points from DexScreener`);
              return res.json(realPriceHistory);
            } else {
              console.warn('Failed to get historical price data from DexScreener, using realistic simulation data');
              
              // Use our realistic X23 price data generator with the latest price
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
                
                // If no current price is available, return the generated data as is
                console.log(`Generated ${generatedData.length} realistic price points for X23 (no price adjustment)`);
                return res.json(generatedData);
              }
              
              // Fourth attempt: Use stored data (final fallback)
              const storedHistory = await storage.getProjectPriceHistory(id, timeframe);
              
              if (storedHistory.length > 0) {
                console.log(`Using ${storedHistory.length} stored price points as final fallback`);
                return res.json(storedHistory);
              }
            }
          }
          
          console.warn('Failed to get any real price data, falling back to stored data');
        } catch (error) {
          console.error('Error fetching real price data:', error);
          console.warn('Error occurred while fetching real price data, falling back to stored data');
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

  const httpServer = createServer(app);

  return httpServer;
}
