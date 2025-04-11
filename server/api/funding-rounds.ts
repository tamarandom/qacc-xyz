import { Router } from "express";
import { db } from "../db";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { fundingRounds, projects, roundProjects } from "@shared/schema";

const router = Router();

// Get the active funding round
router.get('/active', async (req, res) => {
  try {
    // Get the active funding round
    const rounds = await db.select({
      id: fundingRounds.id,
      name: fundingRounds.name,
      status: fundingRounds.status,
      startDate: fundingRounds.startDate,
      endDate: fundingRounds.endDate,
    })
    .from(fundingRounds)
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
    
    // Get the projects in this round
    const roundProjectsData = await db.select({
      id: roundProjects.id,
      roundId: roundProjects.roundId,
      projectId: roundProjects.projectId,
      projectName: projects.name,
      tokenPrice: roundProjects.tokenPrice,
      tokensAvailable: roundProjects.tokensAvailable,
    })
    .from(roundProjects)
    .innerJoin(projects, eq(roundProjects.projectId, projects.id))
    .where(eq(roundProjects.roundId, round.id));
    
    res.json({ 
      success: true,
      round,
      projects: roundProjectsData
    });
    
  } catch (error) {
    console.error('Error fetching active funding round:', error);
    res.status(500).json({ error: 'Failed to fetch active funding round' });
  }
});

// Get all projects in a specific round
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    const roundId = parseInt(id);
    
    if (isNaN(roundId)) {
      return res.status(400).json({ error: 'Invalid round ID' });
    }
    
    // Get the round first
    const [round] = await db.select()
      .from(fundingRounds)
      .where(eq(fundingRounds.id, roundId));
    
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    
    // Get the projects in this round
    const roundProjectsData = await db.select({
      id: roundProjects.id,
      roundId: roundProjects.roundId,
      projectId: roundProjects.projectId,
      projectName: projects.name,
      tokenSymbol: projects.tokenSymbol,
      tokenPrice: roundProjects.tokenPrice,
      tokensAvailable: roundProjects.tokensAvailable,
    })
    .from(roundProjects)
    .innerJoin(projects, eq(roundProjects.projectId, projects.id))
    .where(eq(roundProjects.roundId, roundId));
    
    res.json({ 
      success: true,
      round,
      projects: roundProjectsData
    });
    
  } catch (error) {
    console.error('Error fetching round projects:', error);
    res.status(500).json({ error: 'Failed to fetch round projects' });
  }
});

export default router;