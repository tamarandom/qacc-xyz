import { storage } from "./server/storage";
import { db } from "./server/db";
import { eq } from "drizzle-orm";
import { users } from "./shared/schema";

async function main() {
  console.log("Setting up transactions for sailormoon user...");
  
  // Find sailormoon user
  const [sailormoon] = await db.select().from(users).where(eq(users.username, "sailormoon"));
  
  if (!sailormoon) {
    console.error("User 'sailormoon' not found!");
    return;
  }
  
  console.log(`Found user: ${sailormoon.username} (ID: ${sailormoon.id})`);
  
  // Get all projects to iterate through
  const projects = await storage.getAllProjects();
  
  // Setup buy dates
  const buyDates = [
    new Date("2024-06-15"),  // June 2024
    new Date("2024-10-20"),  // October 2024  
    new Date("2025-02-10")   // February 2025
  ];
  
  // Setup investment amounts (in USDT)
  const investmentAmounts = [
    "5000",  // 5000 USDC
    "1500",  // 1500 USDC
    "2500"   // 2500 USDC
  ];
  
  // Setup token prices
  const tokenPrices = [
    "0.04", // First purchase price
    "0.06", // Second purchase price
    "0.09"  // Third purchase price
  ];
  
  // Skip projects 5-9 as requested (only do existing projects)
  const projectsToProcess = projects.filter(p => p.id < 5);
  
  // Keep track of the total spending to update wallet balance at the end
  let totalSpending = 0;
  
  // Process each project
  for (const project of projectsToProcess) {
    console.log(`Setting up transactions for project: ${project.name} (ID: ${project.id})`);
    
    // Process each buy date with corresponding amount and price
    for (let i = 0; i < buyDates.length; i++) {
      const buyDate = buyDates[i];
      const amount = investmentAmounts[i];
      const price = tokenPrices[i];
      
      // Calculate token amount based on investment amount and token price
      const tokenAmount = (parseFloat(amount) / parseFloat(price)).toFixed(6);
      
      console.log(`  - Creating transaction: ${buyDate.toLocaleDateString()}, $${amount} at $${price} per token = ${tokenAmount} tokens`);
      
      // 1. Add wallet transaction
      const walletTx = await storage.addWalletTransaction({
        userId: sailormoon.id,
        projectId: project.id,
        type: "purchase",
        amount: amount,
        description: `Purchased ${tokenAmount} ${project.tokenSymbol} tokens`
      });
      
      console.log(`    ✓ Created wallet transaction ID: ${walletTx.id}`);
      
      // 2. Add token holding
      // Calculate unlock date (6 months after purchase for cliff)
      const unlockDate = new Date(buyDate);
      unlockDate.setMonth(unlockDate.getMonth() + 6);
      
      // Determine if tokens are locked or unlocked based on current date
      const now = new Date();
      const isLocked = unlockDate > now;
      
      const tokenHolding = await storage.addTokenHolding({
        userId: sailormoon.id,
        projectId: project.id,
        roundId: null, // No specific round
        tokenAmount: tokenAmount,
        purchasePrice: price,
        investmentAmount: amount,
        purchaseDate: buyDate,
        isLocked: isLocked,
        unlockDate: unlockDate
      });
      
      console.log(`    ✓ Created token holding ID: ${tokenHolding.id}, Unlock Date: ${unlockDate.toLocaleDateString()}, Status: ${isLocked ? 'Locked' : 'Unlocked'}`);
      
      // 3. Add points transaction (10% of investment amount as points)
      const pointsToAdd = Math.round(parseFloat(amount) * 0.1);
      
      const pointsTx = await storage.addPointTransaction({
        userId: sailormoon.id,
        projectId: project.id,
        amount: pointsToAdd,
        tokenAmount: parseFloat(tokenAmount),
        description: `Points earned for purchasing ${project.tokenSymbol} tokens`
      });
      
      console.log(`    ✓ Created points transaction ID: ${pointsTx.id}, Points: ${pointsToAdd}`);
      
      // Add to total spending
      totalSpending += parseFloat(amount);
    }
  }
  
  // 4. Update user's wallet balance
  const currentBalance = await storage.getUserWalletBalance(sailormoon.id);
  const newBalance = (parseFloat(currentBalance) - totalSpending).toFixed(2);
  
  await storage.updateUserWalletBalance(sailormoon.id, newBalance);
  
  console.log(`Updated wallet balance: $${currentBalance} - $${totalSpending.toFixed(2)} = $${newBalance}`);
  console.log("Setup completed successfully!");
}

main().catch(err => {
  console.error("Error during setup:", err);
});