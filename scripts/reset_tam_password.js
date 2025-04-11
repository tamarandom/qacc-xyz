// Script to specifically reset Tam's password
import pg from 'pg';
import crypto from 'crypto';
import util from 'util';

const { Pool } = pg;
const scryptAsync = util.promisify(crypto.scrypt);

// Helper function to hash password using same method as in auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function resetTamPassword() {
  const client = await pool.connect();
  
  try {
    console.log('Starting password reset for Tam...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Reset Tam's password to "pass"
    const hashedPassword = await hashPassword('pass');
    
    const updateResult = await client.query(`
      UPDATE users 
      SET password = $1
      WHERE username = 'Tam'
    `, [hashedPassword]);
    
    if (updateResult.rowCount > 0) {
      console.log('Updated Tam\'s password to "pass"');
    } else {
      console.log('Could not find user Tam');
      await client.query('ROLLBACK');
      return;
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('\nPassword reset completed successfully');
    
    // Get current user info
    const userResult = await client.query(`
      SELECT id, username, email, role, SUBSTRING(password, 1, 20) as password_preview 
      FROM users 
      WHERE username = 'Tam'
    `);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`\nTam's current information:`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password preview: ${user.password_preview}...`);
    }
    
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error resetting password:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the connection pool
    pool.end();
  }
}

// Run the function
resetTamPassword();