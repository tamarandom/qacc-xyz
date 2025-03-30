// Additional types beyond schema.ts that may be needed for the frontend
export interface ProjectCategory {
  id: string;
  name: string;
}

export interface SortOption {
  id: string;
  name: string;
  field: string;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'all', name: 'All' },
  { id: 'defi', name: 'DeFi' },
  { id: 'ai', name: 'AI' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'infra', name: 'Infra/Tooling' },
  { id: 'dao', name: 'DAO' },
  { id: 'lending', name: 'Lending' },
  { id: 'yield', name: 'Yield' }
];

export const SORT_OPTIONS: SortOption[] = [
  { id: 'marketCap', name: 'Market Cap', field: 'marketCap' },
  { id: 'price', name: 'Price', field: 'price' },
  { id: 'volume24h', name: 'Volume (24h)', field: 'volume24h' },
  { id: 'name', name: 'Name', field: 'name' }
];

// Define blockchain options
export const BLOCKCHAINS = [
  'Ethereum',
  'BNB Chain',
  'Solana',
  'Polygon',
  'Avalanche',
  'Cosmos',
  'Polkadot'
];

// Define token standards
export const TOKEN_STANDARDS = [
  'ERC-20',
  'BEP-20',
  'SPL',
  'ERC-721',
  'ERC-1155'
];
