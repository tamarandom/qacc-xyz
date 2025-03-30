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
  type ProjectWithDetails
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectFeatures(projectId: number): Promise<ProjectFeature[]>;
  getProjectTechnicalDetails(projectId: number): Promise<ProjectTechnicalDetail[]>;
  createProject(project: InsertProject): Promise<Project>;
  addProjectFeature(feature: InsertProjectFeature): Promise<ProjectFeature>;
  addProjectTechnicalDetail(detail: InsertProjectTechnicalDetail): Promise<ProjectTechnicalDetail>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private projectFeatures: Map<number, ProjectFeature[]>;
  private projectTechnicalDetails: Map<number, ProjectTechnicalDetail[]>;
  private nextProjectId: number;
  private nextFeatureId: number;
  private nextDetailId: number;

  constructor() {
    this.projects = new Map();
    this.projectFeatures = new Map();
    this.projectTechnicalDetails = new Map();
    this.nextProjectId = 1;
    this.nextFeatureId = 1;
    this.nextDetailId = 1;
    
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
    const project: Project = { ...insertProject, id };
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
      isFeatured: true
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
      isFeatured: true
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
      isFeatured: false
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
      isFeatured: false
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
      isFeatured: false
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
  }
}

export const storage = new MemStorage();
