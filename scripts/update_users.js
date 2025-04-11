// Script to update users with roles and create project owner accounts
const { db } = require('../server/db');
const { users, projects, UserRole } = require('../shared/schema');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { eq } = require('drizzle-orm');

const scryptAsync = promisify(scrypt);

// Function to hash password
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString('hex')}.${salt}`;
}

async function updateUsers() {
  try {
    console.log('Starting user updates...');
    
    // 1. Get all existing projects
    const allProjects = await db.select().from(projects);
    console.log(`Found ${allProjects.length} projects`);
    
    // 2. Create unified password for all users
    const hashedPassword = await hashPassword('pass');
    
    // 3. Update all existing users with the same password and default role
    await db.update(users).set({ 
      password: hashedPassword,
      role: UserRole.REGULAR
    });
    console.log('Updated all existing users with new password and regular role');
    
    // 4. If "admin" user exists, set role to ADMIN; otherwise create admin user
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (adminUser.length > 0) {
      await db.update(users).set({ 
        role: UserRole.ADMIN,
        password: hashedPassword
      }).where(eq(users.id, adminUser[0].id));
      console.log('Updated existing admin user with ADMIN role');
    } else {
      // Create admin user
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@qacc.io',
        password: hashedPassword,
        role: UserRole.ADMIN
      });
      console.log('Created new admin user');
    }
    
    // 5. Create project owner accounts for each project
    for (const project of allProjects) {
      // Generate a username based on the project name
      const baseUsername = project.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const ownerUsername = `${baseUsername}_owner`;
      
      // Check if this username already exists
      const existingUser = await db.select().from(users).where(eq(users.username, ownerUsername)).limit(1);
      
      if (existingUser.length === 0) {
        // Create new project owner user
        await db.insert(users).values({
          username: ownerUsername,
          email: `${ownerUsername}@qacc.io`,
          password: hashedPassword,
          role: UserRole.PROJECT_OWNER
        });
        console.log(`Created project owner user for ${project.name}: ${ownerUsername}`);
      } else {
        // Update existing user to be a project owner
        await db.update(users).set({
          role: UserRole.PROJECT_OWNER,
          password: hashedPassword
        }).where(eq(users.id, existingUser[0].id));
        console.log(`Updated existing user to be project owner for ${project.name}: ${ownerUsername}`);
      }
    }
    
    // 6. Create 3 additional regular users if they don't exist
    const regularUsernames = ['user1', 'user2', 'user3'];
    
    for (const username of regularUsernames) {
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (existingUser.length === 0) {
        await db.insert(users).values({
          username,
          email: `${username}@qacc.io`,
          password: hashedPassword,
          role: UserRole.REGULAR
        });
        console.log(`Created regular user: ${username}`);
      } else {
        await db.update(users).set({
          role: UserRole.REGULAR,
          password: hashedPassword
        }).where(eq(users.id, existingUser[0].id));
        console.log(`Updated existing user: ${username}`);
      }
    }
    
    console.log('User updates completed successfully!');
    console.log('\nAvailable users for testing:');
    console.log('- Admin: admin/pass');
    
    const projectOwners = await db.select().from(users).where(eq(users.role, UserRole.PROJECT_OWNER));
    console.log(`- Project Owners (${projectOwners.length}):`);
    projectOwners.forEach(owner => {
      console.log(`  * ${owner.username}/pass`);
    });
    
    console.log('- Regular Users:');
    regularUsernames.forEach(username => {
      console.log(`  * ${username}/pass`);
    });
    
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    process.exit();
  }
}

updateUsers();