/**
 * Script to update project categories
 */
import pg from 'pg';
const { Pool } = pg;

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Project categories mapping
const categoryUpdates = [
  { id: 1, name: "X23", category: "AI Protocol" },
  { id: 2, name: "Citizen Wallet", category: "Infra / Tooling" },
  { id: 3, name: "Grand Timeline", category: "AI Protocol" },
  { id: 4, name: "Prismo Technology", category: "Infra / Tooling" },
  { id: 5, name: "GridLock", category: "Infra / Tooling" },
  { id: 6, name: "To Da Moon", category: "GameFi" },
  { id: 7, name: "How to DAO", category: "SoFi" },
  { id: 8, name: "Web3 Packs", category: "DeFi" },
  { id: 9, name: "Quantum Forge", category: "Infra / Tooling" }
];

async function updateCategories() {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    for (const project of categoryUpdates) {
      console.log(`Updating project ID ${project.id} (${project.name}) to category: ${project.category}`);
      
      const result = await client.query(
        'UPDATE projects SET category = $1 WHERE id = $2 RETURNING *',
        [project.category, project.id]
      );
      
      if (result.rows.length === 0) {
        console.log(`Warning: Project ID ${project.id} not found.`);
      } else {
        console.log(`Updated project: ${result.rows[0].name} (ID: ${result.rows[0].id}) to category: ${result.rows[0].category}`);
      }
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log('All categories updated successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating categories:', error);
  } finally {
    client.release();
    pool.end(); // Close the pool connection when done
  }
}

updateCategories();