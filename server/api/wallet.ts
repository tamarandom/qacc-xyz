import { Express } from 'express';
import { storage } from '../storage';
import { TokenHolding } from '@shared/schema';

export function registerWalletRoutes(app: Express) {
  // Get user wallet balance
  app.get('/api/wallet/balance', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const balance = await storage.getUserWalletBalance(req.user.id);
      res.json({ balance });
    } catch (error) {
      console.error(`Error fetching wallet balance:`, error);
      res.status(500).json({ error: "Failed to fetch wallet balance" });
    }
  });

  // Get wallet transactions
  app.get('/api/wallet/transactions', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const transactions = await storage.getUserWalletTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error(`Error fetching wallet transactions:`, error);
      res.status(500).json({ error: "Failed to fetch wallet transactions" });
    }
  });

  // Get token holdings
  app.get('/api/token-holdings', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const holdings = await storage.getUserTokenHoldings(req.user.id);
      res.json(holdings);
    } catch (error) {
      console.error(`Error fetching token holdings:`, error);
      res.status(500).json({ error: "Failed to fetch token holdings" });
    }
  });

  // Get project token holdings
  app.get('/api/projects/:id/token-holdings', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const holdings = await storage.getUserTokenHoldings(userId);
      const projectHoldings = holdings.filter(h => h.projectId === projectId);
      
      res.json(projectHoldings);
    } catch (error) {
      console.error(`Error fetching token holdings for project ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch token holdings" });
    }
  });

  // Purchase tokens during a funding round
  app.post('/api/projects/:id/purchase', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.id);
      const userId = req.user.id;
      const { amount, roundId } = req.body;
      
      if (!amount || !roundId) {
        return res.status(400).json({ error: "Amount and roundId are required" });
      }
      
      const investmentAmount = amount.toString();
      const roundIdInt = parseInt(roundId);
      
      // Get the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get the funding round
      const fundingRound = await storage.getFundingRoundById(roundIdInt);
      if (!fundingRound) {
        return res.status(404).json({ error: "Funding round not found" });
      }
      
      // Check if funding round is active
      const now = new Date();
      if (
        fundingRound.status !== 'active' || 
        new Date(fundingRound.startDate) > now || 
        new Date(fundingRound.endDate) < now
      ) {
        return res.status(400).json({ error: "Funding round is not active" });
      }
      
      // Check minimum investment amount
      if (
        fundingRound.minimumInvestment && 
        parseFloat(investmentAmount) < parseFloat(fundingRound.minimumInvestment)
      ) {
        return res.status(400).json({ 
          error: `Minimum investment amount is ${fundingRound.minimumInvestment} USDT` 
        });
      }
      
      // Check maximum investment amount
      if (
        fundingRound.maximumInvestment && 
        parseFloat(investmentAmount) > parseFloat(fundingRound.maximumInvestment)
      ) {
        return res.status(400).json({ 
          error: `Maximum investment amount is ${fundingRound.maximumInvestment} USDT` 
        });
      }
      
      // Check user's wallet balance
      const walletBalance = await storage.getUserWalletBalance(userId);
      if (parseFloat(walletBalance) < parseFloat(investmentAmount)) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }
      
      // Calculate token amount
      const tokenPrice = parseFloat(fundingRound.tokenPrice);
      const tokenAmount = (parseFloat(investmentAmount) / tokenPrice).toFixed(6).toString();
      
      // Begin transaction
      // 1. Update user's wallet balance
      const newBalance = (parseFloat(walletBalance) - parseFloat(investmentAmount)).toFixed(2).toString();
      await storage.updateUserWalletBalance(userId, newBalance);
      
      // 2. Record the wallet transaction
      await storage.addWalletTransaction({
        userId,
        projectId,
        description: `Purchased ${tokenAmount} ${project.tokenSymbol} tokens`,
        amount: investmentAmount,
        type: "purchase",
      });
      
      // 3. Add token holding
      const now30Days = new Date();
      now30Days.setDate(now30Days.getDate() + 30); // Tokens unlock after 30 days
      
      const tokenHolding = await storage.addTokenHolding({
        userId,
        projectId,
        roundId: roundIdInt,
        tokenAmount,
        purchasePrice: fundingRound.tokenPrice,
        investmentAmount,
        purchaseDate: new Date(),
        isLocked: true,
        unlockDate: now30Days,
      });
      
      // 4. Add points transaction (user earns points for purchasing tokens)
      const pointsToAdd = Math.round(parseFloat(investmentAmount) * 0.1); // 10% of investment amount
      await storage.addPointTransaction({
        userId,
        projectId,
        amount: pointsToAdd,
        description: `Points earned for purchasing ${project.tokenSymbol} tokens`,
        tokenAmount: parseFloat(tokenAmount),
      });
      
      // Return success response
      res.status(201).json({
        success: true,
        tokenHolding,
        message: `Successfully purchased ${tokenAmount} ${project.tokenSymbol} tokens`,
      });
      
    } catch (error) {
      console.error(`Error purchasing tokens for project ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to purchase tokens" });
    }
  });

  // Get funding rounds for a project
  app.get('/api/projects/:id/funding-rounds', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const fundingRounds = await storage.getProjectFundingRounds(id);
      res.json(fundingRounds);
    } catch (error) {
      console.error(`Error fetching funding rounds for project ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch funding rounds" });
    }
  });

  // Get all active funding rounds
  app.get('/api/active-funding-rounds', async (req, res) => {
    try {
      const activeFundingRounds = await storage.getActiveFundingRounds();
      res.json(activeFundingRounds);
    } catch (error) {
      console.error("Error fetching active funding rounds:", error);
      res.status(500).json({ error: "Failed to fetch active funding rounds" });
    }
  });

  // API endpoint to claim a specific token
  app.post('/api/wallet/claim-token/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const tokenHoldingId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get all user token holdings
      const holdings = await storage.getUserTokenHoldings(userId);
      
      // Find the specific holding
      const holding = holdings.find(h => h.id === tokenHoldingId);
      
      if (!holding) {
        return res.status(404).json({ error: "Token holding not found" });
      }
      
      // Check if the token is already claimed
      if (!holding.isLocked) {
        return res.status(400).json({ error: "Token is already claimed" });
      }
      
      // Check if the token is claimable (unlock date has passed)
      const now = new Date();
      if (holding.unlockDate && new Date(holding.unlockDate) > now) {
        return res.status(400).json({ 
          error: "Token is not yet claimable", 
          unlockDate: holding.unlockDate 
        });
      }
      
      // Update the token holding to mark it as claimed
      const updatedHolding = await storage.updateTokenHolding(tokenHoldingId, {
        isLocked: false,
      });
      
      // Get the project for the response
      const project = await storage.getProjectById(holding.projectId);
      
      res.json({
        success: true,
        tokenHolding: updatedHolding,
        message: `Successfully claimed ${holding.tokenAmount} ${project?.tokenSymbol || 'tokens'}`
      });
      
    } catch (error) {
      console.error(`Error claiming token:`, error);
      res.status(500).json({ error: "Failed to claim token" });
    }
  });
  
  // API endpoint to claim all available tokens
  app.post('/api/wallet/claim-all-tokens', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      // Get all user token holdings
      const holdings = await storage.getUserTokenHoldings(userId);
      
      // Get current date for comparison
      const now = new Date();
      
      // Filter for locked tokens that are past their unlock date
      const claimableHoldings = holdings.filter(h => 
        h.isLocked && h.unlockDate && new Date(h.unlockDate) <= now
      );
      
      if (claimableHoldings.length === 0) {
        return res.status(400).json({ error: "No claimable tokens available" });
      }
      
      // Update each token holding to mark it as claimed
      const claimedHoldings: TokenHolding[] = [];
      
      for (const holding of claimableHoldings) {
        const updated = await storage.updateTokenHolding(holding.id, {
          isLocked: false,
        });
        
        if (updated) {
          claimedHoldings.push(updated);
        }
      }
      
      res.json({
        success: true,
        tokenHoldings: claimedHoldings,
        count: claimedHoldings.length,
        message: `Successfully claimed tokens from ${claimedHoldings.length} holdings`
      });
      
    } catch (error) {
      console.error(`Error claiming all tokens:`, error);
      res.status(500).json({ error: "Failed to claim tokens" });
    }
  });

  // API endpoint to get user's wallet holdings
  app.get('/api/wallet/holdings', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      // Get all user token holdings
      const holdings = await storage.getUserTokenHoldings(userId);
      
      res.json(holdings);
    } catch (error) {
      console.error(`Error fetching wallet holdings:`, error);
      res.status(500).json({ error: "Failed to fetch wallet holdings" });
    }
  });
}