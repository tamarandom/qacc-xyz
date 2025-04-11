import { Router, Express } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { users, projects as projects_table, fundingRounds, roundProjects, UserRole } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// Function to register admin routes with the Express app
export function registerAdminRoutes(app: Express) {
  app.use('/api/admin', router);
}
const scryptAsync = promisify(scrypt);

// Helper function to hash password using same method as in auth.ts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Set all user passwords to "pass"
router.post('/reset-passwords', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const hashedPassword = await hashPassword('thankyou');
    
    // Update all user passwords
    await db.update(users).set({ 
      password: hashedPassword 
    });
    
    res.json({ success: true, message: 'All user passwords reset to "thankyou"' });
  } catch (error) {
    console.error('Error resetting passwords:', error);
    res.status(500).json({ error: 'Failed to reset passwords' });
  }
});

// Update user roles
router.post('/update-roles', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Update all users to regular role as default
    await db.update(users).set({ role: UserRole.REGULAR });
    
    // Find or create admin user
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (adminUser.length > 0) {
      // Update existing admin user
      await db.update(users)
        .set({ role: UserRole.ADMIN })
        .where(eq(users.username, 'admin'));
    } else {
      // Create admin user
      const hashedPassword = await hashPassword('thankyou');
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@qacc.io',
        password: hashedPassword,
        role: UserRole.ADMIN,
        walletBalance: '50000'
      });
    }
    
    // Get all projects
    const allProjects = await db.select({
      id: projects_table.id,
      name: projects_table.name
    }).from(projects_table);
    
    // For each project, create or update a project owner user
    const projectOwnerUsernames = [];
    for (const project of allProjects) {
      const baseUsername = project.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const ownerUsername = `${baseUsername}_owner`;
      projectOwnerUsernames.push(ownerUsername);
      
      // Check if this user exists
      const existingUser = await db.select().from(users).where(eq(users.username, ownerUsername));
      
      if (existingUser.length > 0) {
        // Update to project owner role
        await db.update(users)
          .set({ role: UserRole.PROJECT_OWNER })
          .where(eq(users.username, ownerUsername));
      } else {
        // Create new project owner user
        const hashedPassword = await hashPassword('thankyou');
        await db.insert(users).values({
          username: ownerUsername,
          email: `${ownerUsername}@qacc.io`,
          password: hashedPassword,
          role: UserRole.PROJECT_OWNER,
          walletBalance: '50000'
        });
      }
    }
    
    // Create 3 regular users if they don't exist
    const regularUsernames = ['user1', 'user2', 'user3'];
    for (const username of regularUsernames) {
      const existingUser = await db.select().from(users).where(eq(users.username, username));
      
      if (existingUser.length === 0) {
        // Create new regular user
        const hashedPassword = await hashPassword('thankyou');
        await db.insert(users).values({
          username,
          email: `${username}@qacc.io`,
          password: hashedPassword,
          role: UserRole.REGULAR,
          walletBalance: '50000'
        });
      }
    }
    
    // Retrieve all users to return in response
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role
    }).from(users);
    
    res.json({ 
      success: true, 
      message: 'User roles updated successfully',
      admin: 'admin',
      projectOwners: projectOwnerUsernames,
      regularUsers: regularUsernames,
      users: allUsers
    });
    
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
});

// Get all funding rounds
router.get('/funding-rounds', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all funding rounds
    const rounds = await db.select({
      id: fundingRounds.id,
      name: fundingRounds.name,
      status: fundingRounds.status,
      startDate: fundingRounds.startDate,
      endDate: fundingRounds.endDate,
      createdAt: fundingRounds.createdAt,
      updatedAt: fundingRounds.updatedAt
    })
    .from(fundingRounds)
    .orderBy(desc(fundingRounds.id));
    
    // For each round, get the associated projects
    const roundsWithProjects = [];
    
    for (const round of rounds) {
      // Get the projects in this round
      const roundProjects1 = await db.select({
        id: roundProjects.id,
        roundId: roundProjects.roundId,
        projectId: roundProjects.projectId,
        projectName: projects_table.name,
        tokenSymbol: projects_table.tokenSymbol,
        tokenPrice: roundProjects.tokenPrice,
        tokensAvailable: roundProjects.tokensAvailable,
        minimumInvestment: roundProjects.minimumInvestment,
        maximumInvestment: roundProjects.maximumInvestment
      })
      .from(roundProjects)
      .innerJoin(projects_table, eq(roundProjects.projectId, projects_table.id))
      .where(eq(roundProjects.roundId, round.id));
      
      roundsWithProjects.push({
        ...round,
        projects: roundProjects1
      });
    }
    
    // Get pre-launch and pre-abc projects for potential new rounds
    const eligibleProjects = await db.select({
      id: projects_table.id,
      name: projects_table.name,
      status: projects_table.status,
      tokenSymbol: projects_table.tokenSymbol
    })
    .from(projects_table)
    .where(
      sql`${projects_table.status} = 'pre-launch' OR ${projects_table.status} = 'pre-abc'`
    );
    
    res.json({ 
      success: true,
      rounds: roundsWithProjects,
      eligibleProjects
    });
    
  } catch (error) {
    console.error('Error fetching funding rounds:', error);
    res.status(500).json({ error: 'Failed to fetch funding rounds' });
  }
});

// Update funding round status
router.post('/funding-rounds/:id/status', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "active" or "inactive"' });
    }
    
    // If setting to active, make sure all other rounds are inactive
    if (status === 'active') {
      await db.update(fundingRounds)
        .set({ status: 'inactive' })
        .where(and(
          eq(fundingRounds.status, 'active'),
          sql`${fundingRounds.id} != ${id}`
        ));
    }
    
    // Update the specified round
    await db.update(fundingRounds)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(fundingRounds.id, parseInt(id)));
    
    res.json({ 
      success: true,
      message: `Funding round ${id} updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating funding round status:', error);
    res.status(500).json({ error: 'Failed to update funding round status' });
  }
});

// Update funding round dates
router.post('/funding-rounds/:id/dates', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }
    
    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Update the specified round
    await db.update(fundingRounds)
      .set({ 
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        updatedAt: new Date()
      })
      .where(eq(fundingRounds.id, parseInt(id)));
    
    res.json({ 
      success: true,
      message: `Funding round ${id} dates updated`,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });
    
  } catch (error) {
    console.error('Error updating funding round dates:', error);
    res.status(500).json({ error: 'Failed to update funding round dates' });
  }
});

// Create a new funding round
router.post('/funding-rounds/create', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { 
      name, 
      startDate,
      endDate,
      projects = [] // Array of objects containing project settings
    } = req.body;
    
    if (!projects || !Array.isArray(projects) || projects.length === 0 || !name || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Required fields missing or invalid: projects (array), name, startDate, endDate' 
      });
    }
    
    // Extract project IDs from the projects array
    const projectIds: number[] = projects.map((p: {projectId: number}) => p.projectId);
    
    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Verify all projects exist
    const existingProjects = await db.select({ id: projects_table.id })
      .from(projects_table)
      .where(sql`${projects_table.id} IN (${projectIds.join(',')})`);
    
    if (existingProjects.length !== projectIds.length) {
      return res.status(404).json({ error: 'One or more projects not found' });
    }
    
    // Create the new funding round
    const [newRound] = await db.insert(fundingRounds)
      .values({
        name,
        status: 'inactive', // Default to inactive
        startDate: parsedStartDate,
        endDate: parsedEndDate
      })
      .returning();
    
    // Create entries in roundProjects table for each project
    const roundProjectValues = [];
    
    for (const project of projects) {
      roundProjectValues.push({
        roundId: newRound.id,
        projectId: project.projectId,
        tokenPrice: project.tokenPrice || 0.069,
        tokensAvailable: project.tokensAvailable || 100000,
        minimumInvestment: project.minimumInvestment || 50,
        maximumInvestment: project.maximumInvestment || 5000
      });
    }
    
    // Insert all project associations
    const newRoundProjects = await db.insert(roundProjects)
      .values(roundProjectValues)
      .returning();
    
    res.status(201).json({ 
      success: true,
      message: 'Funding round created successfully',
      round: newRound,
      projects: newRoundProjects
    });
    
  } catch (error) {
    console.error('Error creating funding round:', error);
    res.status(500).json({ error: 'Failed to create funding round' });
  }
});

export default router;