// Script to perform various user account maintenance tasks
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

async function updateUsers() {
  const client = await pool.connect();
  
  try {
    console.log('Starting user maintenance tasks...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Reset all user passwords to "pass"
    const hashedPassword = await hashPassword('pass');
    await client.query(`
      UPDATE users 
      SET password = $1
    `, [hashedPassword]);
    
    console.log('Reset all user passwords to "pass"');
    
    // Make sure all users have a wallet balance of 50000
    await client.query(`
      UPDATE users 
      SET wallet_balance = '50000'
      WHERE wallet_balance != '50000'
    `);
    
    console.log('Updated all users to have 50000 wallet balance');
    
    // Generate user list with email and wallet balance
    const usersResult = await client.query(`
      SELECT id, username, email, role, wallet_balance FROM users
    `);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    // Print user summary
    console.log('\nUser update completed successfully');
    console.log('\nUser summary:');
    console.log('=============');
    
    usersResult.rows.forEach(user => {
      console.log(`${user.username} (${user.email}): role=${user.role}, balance=${user.wallet_balance}`);
    });
    
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error updating users:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the connection pool
    pool.end();
  }
}

// Run the function
updateUsers();