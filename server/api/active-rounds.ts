/**
 * API endpoints for active funding rounds
 */
import express, { Request, Response } from 'express';
import { db } from "../db";
import { eq, and, gte, lte } from 'drizzle-orm';
import { fundingRounds, projects, fundingPot, users, walletTransactions, roundProjects } from "@shared/schema";
import { VerificationLevel } from "@shared/schema";
import { isAuthenticated } from '../auth';

const router = express.Router();

// Get all active rounds 
router.get('/', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Fetch active rounds that are currently running
    const activeRounds = await db
      .select({
        id: fundingRounds.id,
        name: fundingRounds.name,
        status: fundingRounds.status,
        startDate: fundingRounds.startDate,
        endDate: fundingRounds.endDate,
      })
      .from(fundingRounds)
      .where(
        and(
          eq(fundingRounds.status, 'active'),
          lte(fundingRounds.startDate, now),
          gte(fundingRounds.endDate, now)
        )
      );

    // For each active round, fetch the associated projects
    const roundsWithProjects = [];
    
    for (const round of activeRounds) {
      // Get all projects in this round
      const projectsInRound = await db
        .select({
          id: roundProjects.id,
          roundId: roundProjects.roundId,
          projectId: roundProjects.projectId,
          tokenPrice: roundProjects.tokenPrice,
          tokensAvailable: roundProjects.tokensAvailable,
          minimumInvestment: roundProjects.minimumInvestment,
          maximumInvestment: roundProjects.maximumInvestment,
          projectName: projects.name,
          tokenSymbol: projects.tokenSymbol,
          status: projects.status,
          avatarBg: projects.avatarBg,
          avatarColor: projects.avatarColor
        })
        .from(roundProjects)
        .innerJoin(projects, eq(roundProjects.projectId, projects.id))
        .where(eq(roundProjects.roundId, round.id));
      
      roundsWithProjects.push({
        ...round,
        projects: projectsInRound
      });
    }

    res.json(roundsWithProjects);
  } catch (error) {
    console.error('Error fetching active rounds:', error);
    res.status(500).json({ error: 'Failed to fetch active rounds' });
  }
});

// Get details of a specific active round
router.get('/:roundId', async (req: Request, res: Response) => {
  try {
    const roundId = parseInt(req.params.roundId);
    if (isNaN(roundId)) {
      return res.status(400).json({ error: 'Invalid round ID' });
    }

    // Get the round details
    const [round] = await db
      .select()
      .from(fundingRounds)
      .where(eq(fundingRounds.id, roundId));

    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }

    // Get projects in this round
    const projectsInRound = await db
      .select({
        id: roundProjects.id,
        roundId: roundProjects.roundId,
        projectId: roundProjects.projectId,
        tokenPrice: roundProjects.tokenPrice,
        tokensAvailable: roundProjects.tokensAvailable,
        minimumInvestment: roundProjects.minimumInvestment,
        maximumInvestment: roundProjects.maximumInvestment,
        projectName: projects.name,
        tokenSymbol: projects.tokenSymbol,
        projectDescription: projects.description,
        status: projects.status,
        avatarBg: projects.avatarBg,
        avatarColor: projects.avatarColor
      })
      .from(roundProjects)
      .innerJoin(projects, eq(roundProjects.projectId, projects.id))
      .where(eq(roundProjects.roundId, roundId));

    // Get total amount currently in the funding pot
    const fundingPotEntries = await db
      .select()
      .from(fundingPot)
      .where(
        and(
          eq(fundingPot.roundId, roundId),
          eq(fundingPot.status, 'pending')
        )
      );

    const totalFunding = fundingPotEntries.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );

    // Calculate time remaining
    const now = new Date();
    const endDate = new Date(round.endDate);
    const timeRemainingMs = Math.max(0, endDate.getTime() - now.getTime());
    const timeRemainingDays = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
    const timeRemainingHours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    res.json({
      round,
      projects: projectsInRound,
      fundingDetails: {
        totalFunding,
        participants: fundingPotEntries.length,
        timeRemaining: {
          days: timeRemainingDays,
          hours: timeRemainingHours,
          ms: timeRemainingMs
        }
      }
    });
  } catch (error) {
    console.error('Error fetching round details:', error);
    res.status(500).json({ error: 'Failed to fetch round details' });
  }
});

// Contribute to a funding round
router.post('/:roundId/contribute', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const roundId = parseInt(req.params.roundId);
    const { amount, projectId } = req.body;

    // Validate input
    if (isNaN(roundId) || !amount || amount <= 0 || !projectId) {
      return res.status(400).json({ error: 'Invalid input parameters. Requires roundId, projectId, and amount.' });
    }

    // Get user details including verification level
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get funding round details
    const [round] = await db
      .select()
      .from(fundingRounds)
      .where(eq(fundingRounds.id, roundId));

    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }

    // Verify that the round is active
    const now = new Date();
    if (round.status !== 'active' || now < round.startDate || now > round.endDate) {
      return res.status(400).json({ error: 'Funding round is not active' });
    }
    
    // Get the project-specific round settings
    const [roundProject] = await db
      .select()
      .from(roundProjects)
      .where(
        and(
          eq(roundProjects.roundId, roundId),
          eq(roundProjects.projectId, projectId)
        )
      );
      
    if (!roundProject) {
      return res.status(404).json({ error: 'Project not found in this funding round' });
    }

    // Check if contribution amount is within allowed range
    if (roundProject.minimumInvestment && amount < Number(roundProject.minimumInvestment)) {
      return res.status(400).json({ 
        error: `Minimum contribution is ${roundProject.minimumInvestment} USDT` 
      });
    }

    if (roundProject.maximumInvestment && amount > Number(roundProject.maximumInvestment)) {
      return res.status(400).json({ 
        error: `Maximum contribution is ${roundProject.maximumInvestment} USDT` 
      });
    }

    // Check verification level spending caps
    let spendingCap = 0;
    // Normally we would use user.verificationLevel, but since we added it manually,
    // we need to query for it directly from the database
    const userVerificationResult = await db.execute(
      `SELECT verification_level FROM users WHERE id = ${userId}`
    );
    
    // Extract the verification level from the result
    const verificationLevel = userVerificationResult.rows[0]?.verification_level || VerificationLevel.NONE;
    
    switch (verificationLevel) {
      case VerificationLevel.HUMAN_PASSPORT:
        spendingCap = 1000; // $1,000 cap
        break;
      case VerificationLevel.ZK_ID:
        spendingCap = 25000; // $25,000 cap
        break;
      default:
        // No verification, use round's project max investment as cap
        spendingCap = roundProject.maximumInvestment ? Number(roundProject.maximumInvestment) : 500;
    }

    // Get user's existing contributions to this round
    const existingContributions = await db
      .select()
      .from(fundingPot)
      .where(
        and(
          eq(fundingPot.userId, userId),
          eq(fundingPot.roundId, roundId),
          eq(fundingPot.status, 'pending')
        )
      );

    // Calculate total amount already contributed
    const totalContributed = existingContributions.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );

    // Check if new contribution would exceed spending cap
    if (totalContributed + amount > spendingCap) {
      return res.status(400).json({
        error: `This contribution would exceed your spending cap of ${spendingCap} USDT based on your verification level (${verificationLevel})`
      });
    }

    // Check if user has enough wallet balance
    if (Number(user.walletBalance) < amount) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
        currentBalance: user.walletBalance
      });
    }

    // Begin a transaction
    // In a real production app, this should use a transaction from the database
    // But for our demo, we'll use separate operations

    // 1. Deduct from user's wallet balance
    await db
      .update(users)
      .set({
        walletBalance: (Number(user.walletBalance) - amount).toString()
      })
      .where(eq(users.id, userId));

    // Get project name for the description
    const [project] = await db
      .select({
        name: projects.name
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    // 2. Create wallet transaction record
    await db.insert(walletTransactions).values({
      userId: userId,
      projectId: projectId,
      type: 'purchase',
      amount: amount.toString(),
      description: `Contributed ${amount} USDT to ${round.name} for project ${project.name}`
    });

    // 3. Add to funding pot
    await db.insert(fundingPot).values({
      userId: userId,
      projectId: projectId,
      roundId: roundId,
      amount: amount.toString(),
      status: 'pending'
    });

    // Return updated user balance and contribution info
    const [updatedUser] = await db
      .select({
        walletBalance: users.walletBalance
      })
      .from(users)
      .where(eq(users.id, userId));

    res.status(200).json({
      message: `Successfully contributed ${amount} USDT to project ${project.name} in ${round.name}`,
      newBalance: updatedUser.walletBalance,
      contribution: {
        roundId,
        projectId,
        amount
      }
    });
  } catch (error) {
    console.error('Error contributing to funding round:', error);
    res.status(500).json({ error: 'Failed to process contribution' });
  }
});

// Add funds to wallet (for demonstration purposes)
router.post('/add-funds', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get current user balance
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add amount to wallet balance
    const newBalance = Number(user.walletBalance) + amount;
    
    // Update user wallet balance
    await db
      .update(users)
      .set({
        walletBalance: newBalance.toString()
      })
      .where(eq(users.id, userId));

    // Create transaction record
    await db.insert(walletTransactions).values({
      userId: userId,
      type: 'deposit',
      amount: amount.toString(),
      description: `Added ${amount} USDT to wallet`
    });

    res.status(200).json({
      message: `Successfully added ${amount} USDT to your wallet`,
      previousBalance: user.walletBalance,
      newBalance: newBalance.toString()
    });
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    res.status(500).json({ error: 'Failed to add funds to wallet' });
  }
});

// Update user verification level (for demonstration purposes)
router.post('/verification', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { verificationType } = req.body;

    // Validate input
    if (!verificationType || !Object.values(VerificationLevel).includes(verificationType)) {
      return res.status(400).json({ 
        error: 'Invalid verification type',
        validTypes: Object.values(VerificationLevel)
      });
    }

    // Update user verification level using raw SQL
    // Since our schema doesn't include verificationLevel in the standard Drizzle model
    await db.execute(
      `UPDATE users SET verification_level = '${verificationType}' WHERE id = ${userId}`
    );

    // Get spending cap based on verification level
    let spendingCap = 0;
    switch (verificationType) {
      case VerificationLevel.HUMAN_PASSPORT:
        spendingCap = 1000; // $1,000 cap
        break;
      case VerificationLevel.ZK_ID:
        spendingCap = 25000; // $25,000 cap
        break;
      default:
        spendingCap = 0; // No spending cap for unverified users
    }

    res.status(200).json({
      message: `Successfully updated verification level to ${verificationType}`,
      verificationLevel: verificationType,
      spendingCap
    });
  } catch (error) {
    console.error('Error updating verification level:', error);
    res.status(500).json({ error: 'Failed to update verification level' });
  }
});

export default router;