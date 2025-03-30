import { pgTable, text, serial, integer, boolean, numeric, doublePrecision, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Extended types for frontend consumption
export type ProjectWithDetails = Project & {
  features: ProjectFeature[];
  technicalDetails: ProjectTechnicalDetail[];
};
