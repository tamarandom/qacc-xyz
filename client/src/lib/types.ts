// Enum for verification levels
export enum VerificationLevel {
  NONE = "none",
  HUMAN_PASSPORT = "human_passport", // Spending cap: $1,000
  ZK_ID = "zk_id" // Spending cap: $25,000
}

// Active funding round statuses
export type FundingRoundStatus = 'active' | 'upcoming' | 'completed';

// Project categories
export interface Category {
  id: string;
  name: string;
}

export const PROJECT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'ai', name: 'AI' },
  { id: 'defi', name: 'DeFi' },
  { id: 'nft', name: 'NFT' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'privacy', name: 'Privacy' },
  { id: 'dao', name: 'DAO' }
];