// Script to update users with roles and set all passwords to "pass"
const { db } = require('../server/db');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { eq } = require('drizzle-orm');

const scryptAsync = promisify(scrypt);

// Helper function to hash password using same method as in auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function updateUserRoles() {
  try {
    console.log('Starting user role updates...');
    
    // Hash the common password "pass"
    const hashedPassword = await hashPassword('pass');
    console.log('Generated hashed password for all users');

    // Check if the role column exists, if not add it
    const result = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (result.rowCount === 0) {
      console.log('Role column does not exist, adding it...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN role TEXT NOT NULL DEFAULT 'regular'
      `);
      console.log('Added role column to users table');
    } else {
      console.log('Role column already exists');
    }
    
    // 1. Update all existing users with regular role and the same password
    await db.execute(`
      UPDATE users 
      SET password = $1, role = 'regular'
    `, [hashedPassword]);
    console.log('Updated all users with password "pass" and regular role');
    
    // 2. Get all projects to create project owner users
    const projects = await db.query(`SELECT id, name FROM projects`);
    console.log(`Found ${projects.length} projects`);
    
    // 3. Create or update admin user
    const adminUser = await db.query(`SELECT id FROM users WHERE username = 'admin'`);
    
    if (adminUser.length > 0) {
      await db.execute(`
        UPDATE users
        SET role = 'admin', password = $1
        WHERE username = 'admin'
      `, [hashedPassword]);
      console.log('Updated existing admin user with admin role');
    } else {
      await db.execute(`
        INSERT INTO users (username, email, password, role, wallet_balance)
        VALUES ('admin', 'admin@qacc.io', $1, 'admin', '50000')
      `, [hashedPassword]);
      console.log('Created new admin user');
    }
    
    // 4. For each project, create a project owner user
    for (const project of projects) {
      const ownerUsername = project.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_owner';
      const ownerEmail = `${ownerUsername}@qacc.io`;
      
      const existingUser = await db.query(`
        SELECT id FROM users WHERE username = $1
      `, [ownerUsername]);
      
      if (existingUser.length > 0) {
        await db.execute(`
          UPDATE users
          SET role = 'project_owner', password = $1
          WHERE username = $2
        `, [hashedPassword, ownerUsername]);
        console.log(`Updated existing user as project owner: ${ownerUsername}`);
      } else {
        await db.execute(`
          INSERT INTO users (username, email, password, role, wallet_balance)
          VALUES ($1, $2, $3, 'project_owner', '50000')
        `, [ownerUsername, ownerEmail, hashedPassword]);
        console.log(`Created new project owner user: ${ownerUsername}`);
      }
    }
    
    // 5. Create 3 regular users if they don't exist
    const regularUsers = ['user1', 'user2', 'user3'];
    
    for (const username of regularUsers) {
      const email = `${username}@qacc.io`;
      
      const existingUser = await db.query(`
        SELECT id FROM users WHERE username = $1
      `, [username]);
      
      if (existingUser.length > 0) {
        await db.execute(`
          UPDATE users
          SET role = 'regular', password = $1
          WHERE username = $2
        `, [hashedPassword, username]);
        console.log(`Updated existing user: ${username}`);
      } else {
        await db.execute(`
          INSERT INTO users (username, email, password, role, wallet_balance)
          VALUES ($1, $2, $3, 'regular', '50000')
        `, [username, email, hashedPassword]);
        console.log(`Created new regular user: ${username}`);
      }
    }
    
    // 6. List all users and their roles
    const allUsers = await db.query(`
      SELECT id, username, email, role FROM users
      ORDER BY role, username
    `);
    
    console.log('\nUsers in the system:');
    console.log('--------------------');
    for (const user of allUsers) {
      console.log(`${user.username} (${user.email}) - Role: ${user.role}`);
    }
    
    console.log('\nPassword for all users is now: pass');
    
  } catch (error) {
    console.error('Error updating user roles:', error);
  }
}

updateUserRoles()
  .then(() => {
    console.log('User role update completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to update user roles:', err);
    process.exit(1);
  });