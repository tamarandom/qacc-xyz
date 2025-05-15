import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function updateUserPoints() {
  try {
    console.log("Fetching all users...");
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);

    for (const user of allUsers) {
      // Set 3600 points for user with ID 4 (sailormoon)
      let points = 0;
      
      if (user.id === "4") {
        points = 3600;
        console.log(`Setting fixed points (${points}) for user: ${user.username} (ID: ${user.id})`);
      } else if (user.username === "sailormoon") {
        // Also check by username in case ID is different
        points = 3600;
        console.log(`Setting fixed points (${points}) for user: ${user.username} (ID: ${user.id})`);
      } else {
        // For other users, assign random points between 0 and 5000
        // Some users will get 0 points
        points = Math.floor(Math.random() * 5001);
        console.log(`Setting random points (${points}) for user: ${user.username} (ID: ${user.id})`);
      }

      // Update the user's points
      await db.update(users)
        .set({ points, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    console.log("User points updated successfully");
  } catch (error) {
    console.error("Error updating user points:", error);
  } finally {
    process.exit(0);
  }
}

// Self-invoking function for top-level await
(async () => {
  await updateUserPoints();
})();