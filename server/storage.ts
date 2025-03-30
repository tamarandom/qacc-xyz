import { 
  projects,
  projectFeatures,
  projectTechnicalDetails,
  type Project,
  type InsertProject, 
  type ProjectFeature,
  type InsertProjectFeature,
  type ProjectTechnicalDetail,
  type InsertProjectTechnicalDetail,
  type ProjectWithDetails,
  type User,
  type InsertUser,
  type PointTransaction,
  type InsertPointTransaction,
  type UserWithTransactions
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectFeatures(projectId: number): Promise<ProjectFeature[]>;
  getProjectTechnicalDetails(projectId: number): Promise<ProjectTechnicalDetail[]>;
  createProject(project: InsertProject): Promise<Project>;
  addProjectFeature(feature: InsertProjectFeature): Promise<ProjectFeature>;
  addProjectTechnicalDetail(detail: InsertProjectTechnicalDetail): Promise<ProjectTechnicalDetail>;
  
  // User methods
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  
  // Points methods
  getUserPoints(userId: number): Promise<number>;
  getTopUsers(limit?: number): Promise<User[]>;
  addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getUserTransactions(userId: number): Promise<PointTransaction[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private projectFeatures: Map<number, ProjectFeature[]>;
  private projectTechnicalDetails: Map<number, ProjectTechnicalDetail[]>;
  private users: Map<number, User>;
  private pointTransactions: Map<number, PointTransaction[]>;
  private nextProjectId: number;
  private nextFeatureId: number;
  private nextDetailId: number;
  private nextUserId: number;
  private nextTransactionId: number;

  constructor() {
    this.projects = new Map();
    this.projectFeatures = new Map();
    this.projectTechnicalDetails = new Map();
    this.users = new Map();
    this.pointTransactions = new Map();
    this.nextProjectId = 1;
    this.nextFeatureId = 1;
    this.nextDetailId = 1;
    this.nextUserId = 1;
    this.nextTransactionId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectFeatures(projectId: number): Promise<ProjectFeature[]> {
    return this.projectFeatures.get(projectId) || [];
  }

  async getProjectTechnicalDetails(projectId: number): Promise<ProjectTechnicalDetail[]> {
    return this.projectTechnicalDetails.get(projectId) || [];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.nextProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      avatarText: insertProject.avatarText || "",
      isFeatured: insertProject.isFeatured !== undefined ? insertProject.isFeatured : false,
      isNew: insertProject.isNew !== undefined ? insertProject.isNew : false,
      imageUrl: insertProject.imageUrl || null
    };
    this.projects.set(id, project);
    return project;
  }

  async addProjectFeature(insertFeature: InsertProjectFeature): Promise<ProjectFeature> {
    const id = this.nextFeatureId++;
    const feature: ProjectFeature = { ...insertFeature, id };
    
    const projectFeatures = this.projectFeatures.get(feature.projectId) || [];
    projectFeatures.push(feature);
    this.projectFeatures.set(feature.projectId, projectFeatures);
    
    return feature;
  }

  async addProjectTechnicalDetail(insertDetail: InsertProjectTechnicalDetail): Promise<ProjectTechnicalDetail> {
    const id = this.nextDetailId++;
    const detail: ProjectTechnicalDetail = { ...insertDetail, id };
    
    const projectDetails = this.projectTechnicalDetails.get(detail.projectId) || [];
    projectDetails.push(detail);
    this.projectTechnicalDetails.set(detail.projectId, projectDetails);
    
    return detail;
  }
  
  // User methods implementation
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      points: insertUser.points || 0,
      rank: null,
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      points: points,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    
    // Update user ranks after point change
    await this.updateUserRanks();
    
    return updatedUser;
  }
  
  // Points methods implementation
  async getUserPoints(userId: number): Promise<number> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user.points;
  }
  
  async getTopUsers(limit: number = 10): Promise<User[]> {
    // Update all user ranks first
    await this.updateUserRanks();
    
    // Get all users, sort by points in descending order, and take the top 'limit'
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }
  
  async addPointTransaction(insertTransaction: InsertPointTransaction): Promise<PointTransaction> {
    const id = this.nextTransactionId++;
    const transaction: PointTransaction = {
      ...insertTransaction,
      id,
      transactionHash: insertTransaction.transactionHash || null,
      createdAt: new Date()
    };
    
    // Add transaction to the user's transaction list
    const userTransactions = this.pointTransactions.get(transaction.userId) || [];
    userTransactions.push(transaction);
    this.pointTransactions.set(transaction.userId, userTransactions);
    
    // Update user's points
    const user = await this.getUserById(transaction.userId);
    if (user) {
      await this.updateUserPoints(user.id, user.points + transaction.amount);
    }
    
    return transaction;
  }
  
  async getUserTransactions(userId: number): Promise<PointTransaction[]> {
    return this.pointTransactions.get(userId) || [];
  }
  
  // Helper method to update all user ranks based on points
  private async updateUserRanks(): Promise<void> {
    const users = Array.from(this.users.values()).sort((a, b) => b.points - a.points);
    
    // Assign ranks (1-based)
    users.forEach((user, index) => {
      const updatedUser: User = {
        ...user,
        rank: index + 1
      };
      this.users.set(user.id, updatedUser);
    });
  }

  private initializeSampleData() {
    // Project 1: SafeStake
    const safeStake = this.createProject({
      name: "SafeStake",
      description: "SafeStake is a decentralized staking protocol that enables secure, non-custodial staking for proof-of-stake blockchains. Our innovative approach solves key challenges in the staking ecosystem by distributing validator responsibilities across multiple nodes, reducing the risk of slashing while maintaining high yields.",
      tokenSymbol: "SAFE",
      tokenName: "SafeStake Token",
      price: 12.45,
      marketCap: 128500000,
      volume24h: 24700000,
      change24h: 5.67,
      totalSupply: 20000000,
      circulatingSupply: 10300000,
      category: "DeFi Staking",
      shortDescription: "Decentralized Staking Protocol",
      blockchain: "Ethereum, BSC",
      tokenStandard: "ERC-20",
      contractAddress: "0x7a32...8c71",
      rank: 1,
      websiteUrl: "https://safestake.io",
      whitePaperUrl: "https://safestake.io/whitepaper.pdf",
      githubUrl: "https://github.com/safestake",
      twitterUrl: "https://twitter.com/SafeStake",
      discordUrl: "https://discord.gg/safestake",
      avatarBg: "bg-primary-100",
      avatarText: "SS",
      avatarColor: "text-primary-700",
      isFeatured: true,
      imageUrl: "/project-logos/safestake.svg"
    });

    // Project 2: LiquidSwap
    const liquidSwap = this.createProject({
      name: "LiquidSwap",
      description: "LiquidSwap is an innovative cross-chain liquidity protocol that enables seamless asset swaps across multiple blockchains. Our protocol leverages advanced bridges and liquidity pools to provide users with the best rates and minimal slippage.",
      tokenSymbol: "LSWP",
      tokenName: "LiquidSwap Token",
      price: 3.78,
      marketCap: 75200000,
      volume24h: 18900000,
      change24h: -2.34,
      totalSupply: 100000000,
      circulatingSupply: 35000000,
      category: "DeFi Exchange",
      shortDescription: "Cross-chain Liquidity Protocol",
      blockchain: "Ethereum, Solana, Polygon",
      tokenStandard: "ERC-20",
      contractAddress: "0x81f3...92e4",
      rank: 2,
      websiteUrl: "https://liquidswap.io",
      whitePaperUrl: "https://liquidswap.io/whitepaper.pdf",
      githubUrl: "https://github.com/liquidswap",
      twitterUrl: "https://twitter.com/LiquidSwap",
      discordUrl: "https://discord.gg/liquidswap",
      avatarBg: "bg-secondary-100",
      avatarText: "LS",
      avatarColor: "text-secondary-700",
      isFeatured: true,
      imageUrl: "/project-logos/liquidswap.svg"
    });

    // Project 3: NexusFi
    const nexusFi = this.createProject({
      name: "NexusFi",
      description: "NexusFi is a comprehensive DeFi hub that unifies lending, borrowing, yield farming, and asset management in one platform. Our protocol uses a unique risk assessment model to optimize returns while protecting user funds.",
      tokenSymbol: "NEXUS",
      tokenName: "Nexus Finance Token",
      price: 8.21,
      marketCap: 92700000,
      volume24h: 15300000,
      change24h: 1.23,
      totalSupply: 50000000,
      circulatingSupply: 22500000,
      category: "DeFi Hub",
      shortDescription: "Decentralized Finance Hub",
      blockchain: "Ethereum, Avalanche",
      tokenStandard: "ERC-20",
      contractAddress: "0x4a92...73f1",
      rank: 3,
      websiteUrl: "https://nexusfi.io",
      whitePaperUrl: "https://nexusfi.io/whitepaper.pdf",
      githubUrl: "https://github.com/nexusfi",
      twitterUrl: "https://twitter.com/NexusFi",
      discordUrl: "https://discord.gg/nexusfi",
      avatarBg: "bg-indigo-100",
      avatarText: "NF",
      avatarColor: "text-indigo-700",
      isFeatured: false,
      imageUrl: "/project-logos/nexusfi.svg"
    });

    // Project 4: DecentLend
    const decentLend = this.createProject({
      name: "DecentLend",
      description: "DecentLend is a peer-to-peer lending platform that connects borrowers and lenders directly without intermediaries. The platform uses smart contracts to secure loans and enable transparent terms and conditions.",
      tokenSymbol: "DLEND",
      tokenName: "DecentLend Token",
      price: 2.15,
      marketCap: 54300000,
      volume24h: 11700000,
      change24h: 7.82,
      totalSupply: 200000000,
      circulatingSupply: 45000000,
      category: "DeFi Lending",
      shortDescription: "P2P Lending Platform",
      blockchain: "Ethereum, Polygon",
      tokenStandard: "ERC-20",
      contractAddress: "0x5b21...9e32",
      rank: 4,
      websiteUrl: "https://decentlend.io",
      whitePaperUrl: "https://decentlend.io/whitepaper.pdf",
      githubUrl: "https://github.com/decentlend",
      twitterUrl: "https://twitter.com/DecentLend",
      discordUrl: "https://discord.gg/decentlend",
      avatarBg: "bg-amber-100",
      avatarText: "DL",
      avatarColor: "text-amber-700",
      isFeatured: false,
      imageUrl: "/project-logos/decentlend.svg"
    });

    // Project 5: QuantumYield
    const quantumYield = this.createProject({
      name: "QuantumYield",
      description: "QuantumYield is an advanced yield optimization protocol that automatically allocates assets to the highest-yielding opportunities across multiple DeFi platforms. Our proprietary algorithm analyzes risk-reward ratios to maximize returns.",
      tokenSymbol: "QYLD",
      tokenName: "QuantumYield Token",
      price: 5.67,
      marketCap: 68100000,
      volume24h: 9400000,
      change24h: -0.89,
      totalSupply: 75000000,
      circulatingSupply: 18000000,
      category: "Yield Farming",
      shortDescription: "Yield Optimization Protocol",
      blockchain: "Ethereum, BSC, Solana",
      tokenStandard: "ERC-20",
      contractAddress: "0x3c78...0f11",
      rank: 5,
      websiteUrl: "https://quantumyield.finance",
      whitePaperUrl: "https://quantumyield.finance/whitepaper.pdf",
      githubUrl: "https://github.com/quantumyield",
      twitterUrl: "https://twitter.com/QuantumYield",
      discordUrl: "https://discord.gg/quantumyield",
      avatarBg: "bg-purple-100",
      avatarText: "QY",
      avatarColor: "text-purple-700",
      isFeatured: false,
      imageUrl: "/project-logos/quantum-yield.svg"
    });
    
    // Project 6: ChainGuard
    const chainGuard = this.createProject({
      name: "ChainGuard",
      description: "ChainGuard is a next-generation security protocol that provides real-time monitoring and protection for blockchain assets and smart contracts. Our platform uses AI-powered anomaly detection to identify and prevent security breaches before they can impact your assets.",
      tokenSymbol: "GUARD",
      tokenName: "ChainGuard Token",
      price: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      totalSupply: 100000000,
      circulatingSupply: 0,
      category: "Security",
      shortDescription: "AI-Powered Blockchain Security Protocol",
      blockchain: "Ethereum, Polygon",
      tokenStandard: "ERC-20",
      contractAddress: "0x0000...0000",
      rank: 6,
      websiteUrl: "https://chainguard.io",
      whitePaperUrl: "https://chainguard.io/whitepaper.pdf",
      githubUrl: "https://github.com/chainguard",
      twitterUrl: "https://twitter.com/ChainGuard",
      discordUrl: "https://discord.gg/chainguard",
      avatarBg: "bg-red-100",
      avatarText: "CG",
      avatarColor: "text-red-700",
      isFeatured: false,
      isNew: true,
      imageUrl: "/project-logos/chain-guard.svg"
    });
    
    // Project 7: MetaverseDAO
    const metaverseDAO = this.createProject({
      name: "MetaverseDAO",
      description: "MetaverseDAO is a community-driven platform for building, governing, and monetizing virtual worlds. Our protocol enables creators to develop interoperable assets and experiences across different metaverse platforms while offering governance rights to token holders.",
      tokenSymbol: "MVDAO",
      tokenName: "Metaverse DAO Token",
      price: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      totalSupply: 500000000,
      circulatingSupply: 0,
      category: "Metaverse",
      shortDescription: "Community-Driven Metaverse Building Platform",
      blockchain: "Ethereum, Solana",
      tokenStandard: "ERC-20",
      contractAddress: "0x0000...0000",
      rank: 7,
      websiteUrl: "https://metaversedao.io",
      whitePaperUrl: "https://metaversedao.io/whitepaper.pdf",
      githubUrl: "https://github.com/metaversedao",
      twitterUrl: "https://twitter.com/MetaverseDAO",
      discordUrl: "https://discord.gg/metaversedao",
      avatarBg: "bg-blue-100",
      avatarText: "MD",
      avatarColor: "text-blue-700",
      isFeatured: false,
      isNew: true,
      imageUrl: "/project-logos/metaverse-dao.svg"
    });

    // Add features for SafeStake
    this.addProjectFeature({ projectId: 1, feature: "Distributed validator technology for enhanced security" });
    this.addProjectFeature({ projectId: 1, feature: "Non-custodial staking with competitive APY rates" });
    this.addProjectFeature({ projectId: 1, feature: "Slashing protection insurance mechanism" });
    this.addProjectFeature({ projectId: 1, feature: "Multi-chain support (Ethereum, Solana, Polkadot)" });
    this.addProjectFeature({ projectId: 1, feature: "Liquid staking derivatives for capital efficiency" });

    // Add technical details for SafeStake
    this.addProjectTechnicalDetail({ projectId: 1, label: "Total Value Locked", value: "$87.2M" });
    this.addProjectTechnicalDetail({ projectId: 1, label: "Current APY", value: "9.2% - 15.8%" });
    this.addProjectTechnicalDetail({ projectId: 1, label: "Active Validators", value: "254" });
    this.addProjectTechnicalDetail({ projectId: 1, label: "Staking Pools", value: "17" });

    // Add features for LiquidSwap
    this.addProjectFeature({ projectId: 2, feature: "Cross-chain swaps with minimal slippage" });
    this.addProjectFeature({ projectId: 2, feature: "Unified liquidity pools across multiple blockchains" });
    this.addProjectFeature({ projectId: 2, feature: "Automated bridging technology" });
    this.addProjectFeature({ projectId: 2, feature: "Fee-sharing mechanism for liquidity providers" });
    this.addProjectFeature({ projectId: 2, feature: "Flash loan functionality for advanced traders" });

    // Add technical details for LiquidSwap
    this.addProjectTechnicalDetail({ projectId: 2, label: "Total Value Locked", value: "$64.5M" });
    this.addProjectTechnicalDetail({ projectId: 2, label: "Trading Volume (30d)", value: "$152.3M" });
    this.addProjectTechnicalDetail({ projectId: 2, label: "Active Liquidity Pools", value: "48" });
    this.addProjectTechnicalDetail({ projectId: 2, label: "Supported Blockchains", value: "5" });

    // Add features for other projects with similar pattern
    this.addProjectFeature({ projectId: 3, feature: "Integrated lending and borrowing markets" });
    this.addProjectFeature({ projectId: 3, feature: "Automated yield farming strategies" });
    this.addProjectFeature({ projectId: 3, feature: "Cross-chain asset management" });
    this.addProjectFeature({ projectId: 3, feature: "Risk assessment scoring for all protocols" });

    // Add technical details for other projects
    this.addProjectTechnicalDetail({ projectId: 3, label: "Total Value Locked", value: "$73.9M" });
    this.addProjectTechnicalDetail({ projectId: 3, label: "Average Yield", value: "7.4%" });
    this.addProjectTechnicalDetail({ projectId: 3, label: "Integrated Protocols", value: "12" });
    
    // Add features for ChainGuard
    this.addProjectFeature({ projectId: 6, feature: "Real-time monitoring of smart contract vulnerabilities" });
    this.addProjectFeature({ projectId: 6, feature: "AI-powered threat detection and prevention" });
    this.addProjectFeature({ projectId: 6, feature: "Automated audit reports for developers" });
    this.addProjectFeature({ projectId: 6, feature: "Insurance coverage for protected assets" });
    this.addProjectFeature({ projectId: 6, feature: "Cross-chain security solutions" });
    
    // Add technical details for ChainGuard
    this.addProjectTechnicalDetail({ projectId: 6, label: "Protected Assets", value: "$0" });
    this.addProjectTechnicalDetail({ projectId: 6, label: "Vulnerability Detection Rate", value: "97.8%" });
    this.addProjectTechnicalDetail({ projectId: 6, label: "AI Model Accuracy", value: "99.2%" });
    this.addProjectTechnicalDetail({ projectId: 6, label: "Response Time", value: "<500ms" });
    
    // Add features for MetaverseDAO
    this.addProjectFeature({ projectId: 7, feature: "Community governance of virtual world assets" });
    this.addProjectFeature({ projectId: 7, feature: "Cross-platform asset interoperability" });
    this.addProjectFeature({ projectId: 7, feature: "Decentralized marketplace for creators" });
    this.addProjectFeature({ projectId: 7, feature: "Virtual land acquisition and development" });
    this.addProjectFeature({ projectId: 7, feature: "Metaverse event hosting capabilities" });
    
    // Add technical details for MetaverseDAO
    this.addProjectTechnicalDetail({ projectId: 7, label: "Virtual Land Parcels", value: "10,000" });
    this.addProjectTechnicalDetail({ projectId: 7, label: "Connected Platforms", value: "3" });
    this.addProjectTechnicalDetail({ projectId: 7, label: "Active Creators", value: "120+" });
    this.addProjectTechnicalDetail({ projectId: 7, label: "Governance Proposals", value: "18" });
    
    // Create sample users
    this.createUser({
      username: "cryptowhale",
      email: "whale@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=cryptowhale",
      points: 12450,
    });
    
    this.createUser({
      username: "hodler123",
      email: "hodl@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=hodler123",
      points: 8920,
    });
    
    this.createUser({
      username: "satoshifan",
      email: "satoshi@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=satoshifan",
      points: 7340,
    });
    
    this.createUser({
      username: "tokenmasterx",
      email: "tokenmaster@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=tokenmasterx",
      points: 5100,
    });
    
    this.createUser({
      username: "defi_guru",
      email: "defiguru@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=defi_guru",
      points: 4320,
    });
    
    this.createUser({
      username: "blockchain_dev",
      email: "blockdev@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=blockchain_dev",
      points: 3840,
    });
    
    this.createUser({
      username: "ethinvestor",
      email: "eth@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=ethinvestor",
      points: 2950,
    });
    
    this.createUser({
      username: "nftcollector",
      email: "nft@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=nftcollector",
      points: 1750,
    });
    
    this.createUser({
      username: "web3builder",
      email: "web3@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=web3builder",
      points: 1320,
    });
    
    this.createUser({
      username: "metaversefan",
      email: "meta@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=metaversefan",
      points: 980,
    });
    
    // Update all user ranks
    this.updateUserRanks();
    
    // Add some point transactions as examples
    this.addPointTransaction({
      userId: 1,
      projectId: 1,
      amount: 500,
      tokenAmount: 40,
      transactionHash: "0x1234...5678",
      description: "Purchased SAFE tokens"
    });
    
    this.addPointTransaction({
      userId: 1,
      projectId: 2,
      amount: 300,
      tokenAmount: 80,
      transactionHash: "0x8765...4321",
      description: "Purchased LSWP tokens"
    });
    
    this.addPointTransaction({
      userId: 2,
      projectId: 3,
      amount: 450,
      tokenAmount: 55,
      transactionHash: "0xabcd...ef01",
      description: "Purchased NEXUS tokens"
    });
  }
}

export const storage = new MemStorage();
