import { db } from "./server/db";
import { eq } from "drizzle-orm";
import { users } from "./shared/schema";

async function main() {
  console.log("Updating wallet balance for sailormoon user...");
  
  // Find sailormoon user
  const [sailormoon] = await db.select().from(users).where(eq(users.username, "sailormoon"));
  
  if (!sailormoon) {
    console.error("User 'sailormoon' not found!");
    return;
  }
  
  console.log(`Found user: ${sailormoon.username} (ID: ${sailormoon.id})`);
  
  // Subtract 36000 from 20000 to get the new balance
  const newBalance = 20000 - 36000;
  console.log(`Setting new wallet balance: $${newBalance.toFixed(2)}`);
  
  // Update wallet balance directly in the database
  await db.update(users)
    .set({ 
      walletBalance: newBalance.toString(),
      points: 3600 // 10% of investment amount as points
    })
    .where(eq(users.id, sailormoon.id));
  
  console.log("Wallet balance and points updated successfully!");
}

main().catch(err => {
  console.error("Error during update:", err);
});