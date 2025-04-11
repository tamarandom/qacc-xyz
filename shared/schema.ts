import { pgTable, text, serial, integer, boolean, numeric, doublePrecision, foreignKey, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project Status Enum
export enum ProjectStatus {
  LAUNCHED = 'launched',    // Live projects with tokens already trading
  PRE_LAUNCH = 'pre-launch',  // Coming soon, ready for launch phase
  PRE_ABC = 'pre-abc',      // In early development/concept phase
  INACTIVE = 'inactive'     // No longer active
}

// Project table for storing DeFi projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenName: text("token_name").notNull(),
  price: doublePrecision("price").notNull(),
  marketCap: doublePrecision("market_cap").notNull(),
  volume24h: doublePrecision("volume_24h").notNull(),
  change24h: doublePrecision("change_24h").notNull(),
  totalSupply: doublePrecision("total_supply").notNull(),
  circulatingSupply: doublePrecision("circulating_supply").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description").notNull(),
  blockchain: text("blockchain").notNull(),
  tokenStandard: text("token_standard").notNull(),
  contractAddress: text("contract_address").notNull(),
  status: text("status").notNull().default(ProjectStatus.PRE_LAUNCH), // Project status
  launchDate: timestamp("launch_date"), // When the project will/did launch
  rank: integer("rank").notNull(),
  websiteUrl: text("website_url").notNull(),
  whitePaperUrl: text("white_paper_url").notNull(),
  githubUrl: text("github_url").notNull(),
  twitterUrl: text("twitter_url").notNull(),
  discordUrl: text("discord_url").notNull(),
  avatarBg: text("avatar_bg").notNull(),
  avatarText: text("avatar_text").notNull().default(""),
  avatarColor: text("avatar_color").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false), // Keeping for backward compatibility
  imageUrl: text("image_url"),
  swapUrl: text("swap_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Project features/highlights
export const projectFeatures = pgTable("project_features", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  feature: text("feature").notNull(),
});

// Project technical details (staking stats or other metrics)
export const projectTechnicalDetails = pgTable("project_technical_details", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  label: text("label").notNull(),
  value: text("value").notNull(),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ 
  id: true 
});

export const insertProjectFeatureSchema = createInsertSchema(projectFeatures).omit({ 
  id: true 
});

export const insertProjectTechnicalDetailSchema = createInsertSchema(projectTechnicalDetails).omit({ 
  id: true 
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectFeature = typeof projectFeatures.$inferSelect;
export type InsertProjectFeature = z.infer<typeof insertProjectFeatureSchema>;

export type ProjectTechnicalDetail = typeof projectTechnicalDetails.$inferSelect;
export type InsertProjectTechnicalDetail = z.infer<typeof insertProjectTechnicalDetailSchema>;

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  points: integer("points").notNull().default(0),
  rank: integer("rank"),
  walletBalance: numeric("wallet_balance", { precision: 18, scale: 6 }).notNull().default("50000"),
  verificationLevel: text("verification_level").notNull().default(VerificationLevel.NONE),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Points transactions (history of how users earned points)
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  amount: integer("amount").notNull(),
  tokenAmount: doublePrecision("token_amount").notNull(),
  transactionHash: text("transaction_hash"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas for users and point transactions
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({ 
  id: true,
  createdAt: true 
});

// User types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Point transaction types
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

// Extended types for frontend consumption
// Price history
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  price: numeric("price", { precision: 18, scale: 6 }).notNull(),
  volume: numeric("volume", { precision: 18, scale: 2 }),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ 
  id: true 
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

export type ProjectWithDetails = Project & {
  features: ProjectFeature[];
  technicalDetails: ProjectTechnicalDetail[];
  priceHistory?: PriceHistory[];
};

// Extended user type with transaction history
export type UserWithTransactions = User & {
  transactions: PointTransaction[];
  tokenHoldings?: TokenHolding[];
};

// Funding rounds table to track when projects are accepting investments
export const fundingRounds = pgTable("funding_rounds", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // e.g., "Seed Round", "Series A", etc.
  status: text("status").notNull(), // "active" or "inactive"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  tokenPrice: numeric("token_price", { precision: 18, scale: 6 }).notNull(),
  tokensAvailable: numeric("tokens_available", { precision: 18, scale: 6 }).notNull(),
  minimumInvestment: numeric("minimum_investment", { precision: 18, scale: 2 }),
  maximumInvestment: numeric("maximum_investment", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFundingRoundSchema = createInsertSchema(fundingRounds).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type FundingRound = typeof fundingRounds.$inferSelect;
export type InsertFundingRound = z.infer<typeof insertFundingRoundSchema>;

// User token holdings table to track purchased tokens
export const tokenHoldings = pgTable("token_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  roundId: integer("round_id").references(() => fundingRounds.id),
  tokenAmount: numeric("token_amount", { precision: 18, scale: 6 }).notNull(),
  purchasePrice: numeric("purchase_price", { precision: 18, scale: 6 }).notNull(), // Price per token at purchase time
  investmentAmount: numeric("investment_amount", { precision: 18, scale: 2 }).notNull(), // Total amount invested
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  isLocked: boolean("is_locked").notNull().default(true), // Whether tokens are still in vesting period
  unlockDate: timestamp("unlock_date"), // When tokens become available
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTokenHoldingSchema = createInsertSchema(tokenHoldings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type TokenHolding = typeof tokenHoldings.$inferSelect;
export type InsertTokenHolding = z.infer<typeof insertTokenHoldingSchema>;

// Transaction history for user wallet activities
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  type: text("type").notNull(), // "purchase", "deposit", "withdrawal"
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

// Funding pot for active rounds
export const fundingPot = pgTable("funding_pot", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").references(() => fundingRounds.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFundingPotSchema = createInsertSchema(fundingPot).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type FundingPot = typeof fundingPot.$inferSelect;
export type InsertFundingPot = z.infer<typeof insertFundingPotSchema>;

// User verification status
export enum VerificationLevel {
  NONE = "none",
  HUMAN_PASSPORT = "human_passport", // Spending cap: $1,000
  ZK_ID = "zk_id" // Spending cap: $25,000
}
