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

async function resetPassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    // Hash the password
    const hashedPassword = await hashPassword('pass');
    console.log('New hashed password:', hashedPassword);
    
    // Update the database
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, 'Tam']
    );
    
    console.log(`Password updated for Tam. Rows affected: ${result.rowCount}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

resetPassword();