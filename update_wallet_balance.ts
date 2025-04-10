import { storage } from "./server/storage";
import { db } from "./server/db";
import { eq } from "drizzle-orm";
import { users, walletTransactions, pointTransactions } from "./shared/schema";

async function main() {
  console.log("Updating wallet balance for sailormoon user...");
  
  // Find sailormoon user
  const [sailormoon] = await db.select().from(users).where(eq(users.username, "sailormoon"));
  
  if (!sailormoon) {
    console.error("User 'sailormoon' not found!");
    return;
  }
  
  console.log(`Found user: ${sailormoon.username} (ID: ${sailormoon.id})`);
  
  // Fetch all purchase transactions for the user
  const transactions = await db.select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, sailormoon.id));
  
  // Calculate total spending
  const totalSpending = transactions.reduce((sum, tx) => {
    if (tx.type === "purchase") {
      return sum + parseFloat(tx.amount);
    }
    return sum;
  }, 0);
  
  console.log(`Total spending across all transactions: $${totalSpending.toFixed(2)}`);
  
  // Update user's wallet balance (starting balance is 20,000)
  const startingBalance = 20000;
  const newBalance = (startingBalance - totalSpending).toFixed(6);
  
  await storage.updateUserWalletBalance(sailormoon.id, newBalance);
  
  console.log(`Updated wallet balance: $${startingBalance} - $${totalSpending.toFixed(2)} = $${newBalance}`);
  
  // Also update user points - we need to fetch them directly from the database
  const pointsTransactions = await db.select()
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, sailormoon.id));
  
  const totalPoints = pointsTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Update points directly in the database
  await db.update(users)
    .set({ points: totalPoints })
    .where(eq(users.id, sailormoon.id));
  
  console.log(`Updated user points: ${totalPoints} points`);
  
  console.log("Wallet balance update completed successfully!");
}

main().catch(err => {
  console.error("Error during wallet balance update:", err);
});