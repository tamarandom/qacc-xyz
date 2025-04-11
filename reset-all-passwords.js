import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import pkg from 'pg';
const { Client } = pkg;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function resetAllPasswords() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    // Hash the new password
    const hashedPassword = await hashPassword('thankyou');
    console.log('New hashed password:', hashedPassword);
    
    // Update ALL user passwords in the database
    const result = await client.query(
      'UPDATE users SET password = $1',
      [hashedPassword]
    );
    
    console.log(`All user passwords have been updated to "thankyou". Rows affected: ${result.rowCount}`);
    
    // List all users for verification
    const { rows } = await client.query('SELECT id, username, email, role FROM users ORDER BY id');
    console.log('\nUser accounts:');
    console.table(rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

resetAllPasswords();