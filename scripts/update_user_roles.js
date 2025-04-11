// Script to update user roles in the database
import pg from 'pg';
import crypto from 'crypto';
import util from 'util';

const { Pool } = pg;

const scryptAsync = util.promisify(crypto.scrypt);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper function to hash password using same method as in auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function updateUserRoles() {
  const client = await pool.connect();
  
  try {
    console.log('Starting user roles update...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Set all users to regular role by default
    await client.query(`
      UPDATE users 
      SET role = 'regular'
    `);
    console.log('Reset all users to regular role');
    
    // Find or create admin user
    const adminResult = await client.query(`
      SELECT * FROM users WHERE username = 'admin'
    `);
    
    if (adminResult.rowCount > 0) {
      // Update existing admin user
      await client.query(`
        UPDATE users 
        SET role = 'admin' 
        WHERE username = 'admin'
      `);
      console.log('Updated existing admin user');
    } else {
      // Create admin user
      const hashedPassword = await hashPassword('pass');
      await client.query(`
        INSERT INTO users (username, email, password, role, wallet_balance)
        VALUES ('admin', 'admin@qacc.io', $1, 'admin', '50000')
      `, [hashedPassword]);
      console.log('Created new admin user');
    }
    
    // Get all projects
    const projectsResult = await client.query(`
      SELECT id, name FROM projects
    `);
    
    // Create project owner users
    const projectOwners = [];
    for (const project of projectsResult.rows) {
      const baseUsername = project.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const ownerUsername = `${baseUsername}_owner`;
      projectOwners.push(ownerUsername);
      
      // Check if user exists
      const existingUserResult = await client.query(`
        SELECT * FROM users WHERE username = $1
      `, [ownerUsername]);
      
      if (existingUserResult.rowCount > 0) {
        // Update to project owner role
        await client.query(`
          UPDATE users 
          SET role = 'project_owner' 
          WHERE username = $1
        `, [ownerUsername]);
        console.log(`Updated existing user ${ownerUsername} to project owner role`);
      } else {
        // Create new project owner user
        const hashedPassword = await hashPassword('pass');
        await client.query(`
          INSERT INTO users (username, email, password, role, wallet_balance)
          VALUES ($1, $2, $3, 'project_owner', '50000')
        `, [ownerUsername, `${ownerUsername}@qacc.io`, hashedPassword]);
        console.log(`Created new project owner user: ${ownerUsername}`);
      }
    }
    
    // Create regular users if they don't exist
    const regularUsers = ['user1', 'user2', 'user3'];
    for (const username of regularUsers) {
      const existingUserResult = await client.query(`
        SELECT * FROM users WHERE username = $1
      `, [username]);
      
      if (existingUserResult.rowCount === 0) {
        const hashedPassword = await hashPassword('pass');
        await client.query(`
          INSERT INTO users (username, email, password, role, wallet_balance)
          VALUES ($1, $2, $3, 'regular', '50000')
        `, [username, `${username}@qacc.io`, hashedPassword]);
        console.log(`Created new regular user: ${username}`);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    // Print summary of users with their roles
    const allUsersResult = await client.query(`
      SELECT id, username, email, role FROM users
    `);
    
    console.log('\nUser roles updated successfully');
    console.log('\nUser summary:');
    console.log('=============');
    console.log('Admin: admin');
    console.log(`Project owners: ${projectOwners.join(', ')}`);
    console.log(`Regular users: ${regularUsers.join(', ')}`);
    console.log('\nAll users:');
    
    allUsersResult.rows.forEach(user => {
      console.log(`${user.username} (${user.email}): ${user.role}`);
    });
    
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error updating user roles:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the connection pool
    pool.end();
  }
}

// Run the function
updateUserRoles();