import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPointTransactionSchema,
  type Project
} from "@shared/schema";

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
      
      res.json({
        ...project,
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
