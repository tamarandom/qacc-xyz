import { Router, Express } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { users, projects, fundingRounds, UserRole } from '@shared/schema';
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
    
    const hashedPassword = await hashPassword('pass');
    
    // Update all user passwords
    await db.update(users).set({ 
      password: hashedPassword 
    });
    
    res.json({ success: true, message: 'All user passwords reset to "pass"' });
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
      const hashedPassword = await hashPassword('pass');
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
      id: projects.id,
      name: projects.name
    }).from(projects);
    
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
        const hashedPassword = await hashPassword('pass');
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
        const hashedPassword = await hashPassword('pass');
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
    
    // Get all funding rounds with project info
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
      createdAt: fundingRounds.createdAt,
      updatedAt: fundingRounds.updatedAt
    })
    .from(fundingRounds)
    .innerJoin(projects, eq(fundingRounds.projectId, projects.id))
    .orderBy(desc(fundingRounds.id));
    
    // Get pre-launch and pre-abc projects for potential new rounds
    const eligibleProjects = await db.select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      tokenSymbol: projects.tokenSymbol
    })
    .from(projects)
    .where(
      sql`${projects.status} = 'pre-launch' OR ${projects.status} = 'pre-abc'`
    );
    
    res.json({ 
      success: true,
      rounds,
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
      projectId, 
      name, 
      startDate,
      endDate,
      tokenPrice = 0.069,
      tokensAvailable = 100000,
      minimumInvestment = 50,
      maximumInvestment = 5000
    } = req.body;
    
    if (!projectId || !name || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Required fields missing: projectId, name, startDate, endDate' 
      });
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
    
    // Verify the project exists
    const projectExists = await db.select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId));
    
    if (projectExists.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Create the new funding round
    const [newRound] = await db.insert(fundingRounds)
      .values({
        projectId,
        name,
        status: 'inactive', // Default to inactive
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        tokenPrice,
        tokensAvailable,
        minimumInvestment,
        maximumInvestment
      })
      .returning();
    
    res.status(201).json({ 
      success: true,
      message: 'Funding round created successfully',
      round: newRound
    });
    
  } catch (error) {
    console.error('Error creating funding round:', error);
    res.status(500).json({ error: 'Failed to create funding round' });
  }
});

export default router;