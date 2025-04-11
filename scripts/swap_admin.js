// Script to remove admin user and assign admin role to Tam
import pg from 'pg';

const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function swapAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('Starting admin user swap...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Update Tam to admin role
    const updateResult = await client.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE username = 'Tam'
    `);
    
    if (updateResult.rowCount > 0) {
      console.log('Updated Tam to admin role');
    } else {
      console.log('Could not find user Tam');
      await client.query('ROLLBACK');
      return;
    }
    
    // Update the admin user to have a different username and remove admin role
    const updateAdminResult = await client.query(`
      UPDATE users
      SET username = 'admin_disabled', 
          email = 'admin_disabled@qacc.io',
          role = 'regular'
      WHERE username = 'admin'
    `);
    
    if (updateAdminResult.rowCount > 0) {
      console.log('Updated admin user to admin_disabled and set role to regular');
    } else {
      console.log('Admin user does not exist');
    }
    
    // Verify the changes
    const usersResult = await client.query(`
      SELECT id, username, email, role FROM users
      WHERE username = 'Tam' OR username = 'admin_disabled'
    `);
    
    console.log('\nUser changes:');
    console.log('=============');
    
    if (usersResult.rows.length === 0) {
      console.log('No users found with usernames Tam or admin');
    } else {
      usersResult.rows.forEach(user => {
        console.log(`${user.username} (${user.email}): ${user.role}`);
      });
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('\nTransaction committed successfully');
    
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error swapping admin user:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the connection pool
    pool.end();
  }
}

// Run the function
swapAdmin();