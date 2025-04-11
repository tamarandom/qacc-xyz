import { Router } from "express";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { fundingRounds, projects } from "@shared/schema";

const router = Router();

// Get the active funding round
router.get('/active', async (req, res) => {
  try {
    // Get the active funding round with project info
    const rounds = await db.select({
      id: fundingRounds.id,
      projectId: fundingRounds.projectId,
      projectName: projects.name,
      name: fundingRounds.name,
      status: fundingRounds.status,
      startDate: fundingRounds.startDate,
      endDate: fundingRounds.endDate,
      tokenPrice: fundingRounds.tokenPrice,
      tokensAvailable: fundingRounds.tokensAvailable,
      minimumInvestment: fundingRounds.minimumInvestment,
      maximumInvestment: fundingRounds.maximumInvestment,
    })
    .from(fundingRounds)
    .innerJoin(projects, eq(fundingRounds.projectId, projects.id))
    .where(eq(fundingRounds.status, 'active'))
    .orderBy(desc(fundingRounds.startDate))
    .limit(1);
    
    if (rounds.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No active funding round found' 
      });
    }
    
    // Check if the round is still valid (within start and end dates)
    const round = rounds[0];
    const now = new Date();
    const startDate = new Date(round.startDate);
    const endDate = new Date(round.endDate);
    
    if (now < startDate) {
      return res.status(404).json({ 
        success: false,
        message: 'The funding round has not started yet' 
      });
    }
    
    if (now > endDate) {
      // If the round has ended, mark it as inactive
      await db.update(fundingRounds)
        .set({ status: 'inactive' })
        .where(eq(fundingRounds.id, round.id));
        
      return res.status(404).json({ 
        success: false,
        message: 'The funding round has ended' 
      });
    }
    
    res.json({ 
      success: true,
      round
    });
    
  } catch (error) {
    console.error('Error fetching active funding round:', error);
    res.status(500).json({ error: 'Failed to fetch active funding round' });
  }
});

export default router;