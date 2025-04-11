import { Router, Express } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { users, projects, UserRole } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

export default router;