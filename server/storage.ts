import { 
  projects,
  projectFeatures,
  projectTechnicalDetails,
  priceHistory,
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
  type UserWithTransactions,
  type PriceHistory,
  type InsertPriceHistory
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
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
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
  
  // Price history methods
  getProjectPriceHistory(projectId: number, timeframe?: string): Promise<PriceHistory[]>;
  addPriceHistoryEntry(entry: InsertPriceHistory): Promise<PriceHistory>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private projectFeatures: Map<number, ProjectFeature[]>;
  private projectTechnicalDetails: Map<number, ProjectTechnicalDetail[]>;
  private priceHistory: Map<number, PriceHistory[]>;
  private users: Map<number, User>;
  private pointTransactions: Map<number, PointTransaction[]>;
  private nextProjectId: number;
  private nextFeatureId: number;
  private nextDetailId: number;
  private nextUserId: number;
  private nextTransactionId: number;
  private nextPriceHistoryId: number;

  constructor() {
    this.projects = new Map();
    this.projectFeatures = new Map();
    this.projectTechnicalDetails = new Map();
    this.priceHistory = new Map();
    this.users = new Map();
    this.pointTransactions = new Map();
    this.nextProjectId = 1;
    this.nextFeatureId = 1;
    this.nextDetailId = 1;
    this.nextUserId = 1;
    this.nextTransactionId = 1;
    this.nextPriceHistoryId = 1;
    
    // Initialize with sample data - need to handle async initialization
    // Since constructors can't be async, we need to call it and catch errors
    this._initializeData();
  }
  
  private _initializeData() {
    // Initialize sample data and handle any errors
    this.initializeSampleData().catch(err => {
      console.error("Error initializing sample data:", err);
    });
  }
  
  // Price history methods implementation
  async getProjectPriceHistory(projectId: number, timeframe?: string): Promise<PriceHistory[]> {
    const history = this.priceHistory.get(projectId) || [];
    
    if (!timeframe) {
      return history;
    }
    
    // Filter based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        // If timeframe is invalid, return all data
        return history;
    }
    
    return history.filter(entry => new Date(entry.timestamp) >= startDate);
  }
  
  async addPriceHistoryEntry(entry: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.nextPriceHistoryId++;
    const timestamp = entry.timestamp || new Date();
    
    const priceEntry: PriceHistory = {
      ...entry,
      id,
      timestamp,
      volume: entry.volume !== undefined ? entry.volume : null
    };
    
    const projectHistory = this.priceHistory.get(entry.projectId) || [];
    projectHistory.push(priceEntry);
    this.priceHistory.set(entry.projectId, projectHistory);
    
    return priceEntry;
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
      imageUrl: insertProject.imageUrl || null,
      swapUrl: insertProject.swapUrl || null
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
    await await this.updateUserRanks();
    
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
    await await this.updateUserRanks();
    
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

  private generateSamplePriceHistory(projectId: number, basePrice: number, volatility: number, days: number): void {
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Generate a unique starting price between $0.02 and $0.1
    // We'll make it fluctuate based on project ID to ensure diversity
    const startPriceRange = (0.02 + ((projectId % 5) * 0.02)) + (Math.random() * 0.02);
    let currentPrice = startPriceRange;
    
    // Different projects have different patterns
    // Project ID determines pattern type:
    // 1, 5, 9 = Steady rise with dips
    // 2, 6, 10 = Choppy uptrend
    // 3, 7, 11 = Rapid early rise, correction, then steady
    // 4, 8, 12 = Slow start, then acceleration upward
    const patternType = projectId % 4;
    
    // Create cycles of price movement (to simulate market cycles)
    const cycles = [
      { length: Math.floor(days * 0.3), trend: patternType === 3 ? 'flat' : 'up' },
      { length: Math.floor(days * 0.2), trend: patternType === 0 ? 'correction' : patternType === 1 ? 'down' : 'up' },
      { length: Math.floor(days * 0.3), trend: patternType === 2 ? 'correction' : 'up' },
      { length: days - (Math.floor(days * 0.8)), trend: 'up' } // Remaining days
    ];
    
    // Calculate when major price swings will occur (for more realistic charts)
    const swingDays = [];
    for (let i = 0; i < 5; i++) {
      swingDays.push(Math.floor(Math.random() * days));
    }
    
    let cycleStartDay = 0;
    let dayInCycle = 0;
    
    // Generate a data point for each day
    for (let i = days; i >= 0; i--) {
      // Calculate timestamp for this data point
      const timestamp = new Date(now.getTime() - (i * millisecondsPerDay));
      
      // More recent days have more data points
      const dataPointsPerDay = i < 7 ? 24 : i < 30 ? 8 : 1;
      
      // Determine which cycle we're in
      let currentCycle = cycles[0];
      let cycleIndex = 0;
      let tempDay = 0;
      
      for (let c = 0; c < cycles.length; c++) {
        tempDay += cycles[c].length;
        if (days - i <= tempDay) {
          currentCycle = cycles[c];
          cycleIndex = c;
          break;
        }
      }
      
      // Calculate day position in current cycle (for trend calculation)
      dayInCycle = (days - i) - cycleStartDay;
      if (dayInCycle >= currentCycle.length) {
        cycleStartDay += currentCycle.length;
        dayInCycle = 0;
      }
      
      // Cycle progress factor (0 to 1)
      const cycleProgress = dayInCycle / currentCycle.length;
      
      // Progress factor for entire history (0 to 1)
      const totalProgress = 1 - (i / days);
      
      // Check if this is a swing day for more dramatic price movement
      const isSwingDay = swingDays.includes(i);
      
      for (let j = 0; j < dataPointsPerDay; j++) {
        // Add some hours to the timestamp
        const pointTimestamp = new Date(timestamp.getTime() + (j * millisecondsPerDay / dataPointsPerDay));
        
        // Base volatility adjusted by time and cycle
        let adjustedVolatility = volatility;
        
        // Increase volatility for the past week
        if (i < 7) adjustedVolatility *= 1.5;
        
        // Calculate price change based on current trend
        let trendFactor = 0;
        switch (currentCycle.trend) {
          case 'up':
            // Strong uptrend
            trendFactor = 0.5 + (cycleProgress * 0.5);
            break;
          case 'down':
            // Downtrend
            trendFactor = -0.3 - (cycleProgress * 0.3);
            break;
          case 'correction':
            // Correction (drops then recovers)
            trendFactor = cycleProgress < 0.4 ? -0.5 : 0.3;
            break;
          case 'flat':
            // Sideways movement
            trendFactor = 0.05;
            break;
        }
        
        // Apply more randomness to early datapoints
        const randomAdjustment = (Math.random() * 2 - 1) * adjustedVolatility * (1 - (totalProgress * 0.7));
        
        // Calculate actual change percentage
        let changePercent = trendFactor + (randomAdjustment / 100);
        
        // Make swing days more dramatic
        if (isSwingDay) {
          // Exaggerate the existing trend on swing days
          changePercent *= 2 + (Math.random());
        }
        
        // Apply change with pattern-specific adjustments
        switch (patternType) {
          case 0: // Steady rise with dips
            if (i % 14 === 0) changePercent *= -2; // Create periodic dips
            break;
          case 1: // Choppy uptrend
            changePercent += (Math.sin(i * 0.8) * volatility * 0.1); // Add sine wave pattern
            break;
          case 2: // Rapid early rise
            if (i > days * 0.7) changePercent *= 1.5; // Early boost
            break;
          case 3: // Slow start, acceleration
            if (i < days * 0.4) changePercent *= 1.5; // Late boost
            break;
        }
        
        // Apply change to current price
        currentPrice = Math.max(startPriceRange * 0.5, currentPrice * (1 + changePercent));
        
        // Target a specific end price near basePrice, but with some variation
        if (i < 5) {
          const targetEndPrice = basePrice * (0.9 + (Math.random() * 0.2));
          const distanceToTarget = targetEndPrice - currentPrice;
          const adjustment = distanceToTarget * (1 - (i / 5)) * 0.4;
          currentPrice += adjustment;
        }
        
        // Ensure we don't exceed base price by too much
        currentPrice = Math.min(currentPrice, basePrice * 1.1);
        
        // Calculate volume based on price and volatility
        // Higher volume during price movements and for higher marketcap projects
        const volumeMultiplier = Math.abs(changePercent) > 0.01 ? 2.0 : 1.0;
        const baseVolume = 400000 + ((projectId % 4) * 100000); // Different base volumes per project
        const volume = currentPrice * baseVolume * volumeMultiplier * (0.7 + Math.random() * 0.6);
        
        this.addPriceHistoryEntry({
          projectId,
          timestamp: pointTimestamp,
          price: currentPrice.toFixed(6),
          volume: volume.toFixed(2)
        });
      }
    }
  }
  
  private generateRealX23PriceHistory(projectId: number): void {
    // This method generates price history data for X23 based on real market patterns
    // It simulates realistic price movements over the past 90 days
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Define base price and realistic market movements
    const basePrice = 115.46; // Current price based on market data
    
    // X23 price data (simulated based on real crypto market patterns)
    // Starting from 90 days ago to present
    const pricePatterns = [
      // 90-60 days ago: Accumulation phase with low volatility
      { days: 90, endDay: 60, baseChange: -0.2, volatility: 1.2, trend: 'sideways' },
      
      // 60-45 days ago: Initial breakout 
      { days: 60, endDay: 45, baseChange: 0.4, volatility: 2.5, trend: 'upward' },
      
      // 45-30 days ago: Consolidation after first pump
      { days: 45, endDay: 30, baseChange: -0.1, volatility: 3.0, trend: 'sideways' },
      
      // 30-15 days ago: Major rally period
      { days: 30, endDay: 15, baseChange: 0.8, volatility: 4.5, trend: 'upward' },
      
      // 15-7 days ago: Correction period
      { days: 15, endDay: 7, baseChange: -0.3, volatility: 5.0, trend: 'downward' },
      
      // Last 7 days: Recovery and new ATH
      { days: 7, endDay: 0, baseChange: 0.25, volatility: 3.0, trend: 'upward' }
    ];
    
    // Calculate initial price (90 days ago)
    // Working backward from current price and market patterns
    let startingPrice = basePrice / 2.1; // X23 was worth about 55 USD 90 days ago
    
    // Generate price data for each period
    for (const period of pricePatterns) {
      const daySpan = period.days - period.endDay;
      
      // Calculate daily price change for this period
      const dailyChangeBase = period.baseChange / daySpan;
      
      // Generate a data point for each day in this period
      for (let i = period.days; i > period.endDay; i--) {
        // Calculate timestamp for this data point
        const timestamp = new Date(now.getTime() - (i * millisecondsPerDay));
        
        // More data points for recent days
        const dataPointsPerDay = i < 7 ? 24 : i < 30 ? 8 : 4;
        
        // Calculate day's base change based on trend
        let todayBaseChange = dailyChangeBase;
        if (period.trend === 'upward') {
          // Accelerating gains in bull trend
          todayBaseChange *= (1 + ((period.days - i) / period.days));
        } else if (period.trend === 'downward') {
          // Decelerating losses in bear trend
          todayBaseChange *= (1 - ((period.days - i) / period.days * 0.5));
        }
        
        for (let j = 0; j < dataPointsPerDay; j++) {
          // Add some hours to the timestamp
          const pointTimestamp = new Date(timestamp.getTime() + (j * millisecondsPerDay / dataPointsPerDay));
          
          // Add volatility + trend
          const randomFactor = period.trend === 'sideways' ? (Math.random() * 2 - 1) : 
                              period.trend === 'upward' ? (Math.random() * 1.5 - 0.5) : 
                              (Math.random() * 1.5 - 1);
                              
          const change = (randomFactor * period.volatility / 100) + (todayBaseChange / dataPointsPerDay);
          startingPrice = Math.max(0.1, startingPrice * (1 + change));
          
          // Calculate volume - higher during significant moves
          const volumeMultiplier = Math.abs(change) > 0.01 ? 1.5 : 1.0;
          const volume = startingPrice * 750000 * volumeMultiplier * (0.7 + Math.random() * 0.6);
          
          this.addPriceHistoryEntry({
            projectId,
            timestamp: pointTimestamp,
            price: startingPrice.toFixed(6),
            volume: volume.toFixed(2)
          });
        }
      }
    }
  }

  private async initializeSampleData() {
    // Project X23: Real Market Data
    const x23 = await this.createProject({
      name: "x23.ai",
      description: "x23.ai is a cutting-edge decentralized AI protocol that combines advanced machine learning with blockchain technology to create intelligent and adaptive decentralized applications. By leveraging neural networks and robust data processing capabilities, x23.ai enables smarter, more responsive DeFi platforms and Web3 services.",
      tokenSymbol: "X23",
      tokenName: "X23 Token",
      price: 115.46,
      marketCap: 923680000,
      volume24h: 18700000,
      change24h: 5.82,
      totalSupply: 10000000,
      circulatingSupply: 6340000,
      category: "AI Protocol",
      shortDescription: "Decentralized AI Protocol",
      blockchain: "Ethereum, Solana",
      tokenStandard: "ERC-20, SPL",
      contractAddress: "0xc530b75465ce3c6286e718110a7b2e2b64bdc860",
      rank: 1,
      websiteUrl: "https://x23protocol.io",
      whitePaperUrl: "https://x23protocol.io/whitepaper.pdf",
      githubUrl: "https://github.com/X23Protocol",
      twitterUrl: "https://twitter.com/X23Protocol",
      discordUrl: "https://discord.gg/x23protocol",
      avatarBg: "#FFFFFF",
      avatarText: "X23",
      avatarColor: "#101010",
      isFeatured: true,
      isNew: false,
      imageUrl: "/assets/x23-logo.png",
      swapUrl: "https://quickswap.exchange/#/swap?outputCurrency=0xc530b75465ce3c6286e718110a7b2e2b64bdc860"
    });
    
    // Add project features
    await await this.addProjectFeature({ projectId: x23.id, feature: "AI-Powered Decision Engine for optimal on-chain decisions" });
    await await this.addProjectFeature({ projectId: x23.id, feature: "Cross-Chain Compatibility with seamless integration across multiple blockchain networks" });
    await await this.addProjectFeature({ projectId: x23.id, feature: "Self-Learning Protocols that adapt to market conditions and optimize performance" });
    await await this.addProjectFeature({ projectId: x23.id, feature: "Predictive Analytics providing real-time insights and forecasting for DeFi applications" });
    
    // Add technical details
    await await this.addProjectTechnicalDetail({ projectId: x23.id, label: "Consensus Mechanism", value: "AI-Enhanced Proof of Stake" });
    await await this.addProjectTechnicalDetail({ projectId: x23.id, label: "Transaction Speed", value: "4,000 TPS" });
    await await this.addProjectTechnicalDetail({ projectId: x23.id, label: "Token Utility", value: "Governance, Protocol Fee Reduction, Data Access" });
    await await this.addProjectTechnicalDetail({ projectId: x23.id, label: "Security Audits", value: "Certik, Trail of Bits, Consensys Diligence" });
    
    // Real historical X23 price data (simulated based on real market patterns)
    await this.generateRealX23PriceHistory(x23.id);
    
    // Project 3: Citizen Wallet
    const citizenWallet = await this.createProject({
      name: "Citizen Wallet",
      description: "Citizen Wallet is an open-source platform designed to empower communities by facilitating the creation and management of local currencies. The platform emphasizes a user-friendly experience, ensuring smooth onboarding and accessibility for all community members, including those without smartphones or a preference against installing additional applications.",
      tokenSymbol: "CTZN",
      tokenName: "Citizen Wallet Token",
      price: 0.92,
      marketCap: 7300000,
      volume24h: 720000,
      change24h: 1.23,
      totalSupply: 50000000,
      circulatingSupply: 22500000,
      category: "Infra / Tooling",
      shortDescription: "Community Currency Platform",
      blockchain: "Polygon",
      tokenStandard: "ERC-20",
      contractAddress: "0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607",
      rank: 2, // Updated rank
      websiteUrl: "https://citizenwallet.xyz",
      whitePaperUrl: "https://citizenwallet.xyz/whitepaper.pdf",
      githubUrl: "https://github.com/citizenwallet",
      twitterUrl: "https://twitter.com/citizenwallet",
      discordUrl: "https://discord.gg/citizenwallet",
      avatarBg: "#FBBA80",
      avatarText: "CW",
      avatarColor: "#101010",
      isFeatured: false,
      imageUrl: "/project-logos/citizen-wallet.svg",
      swapUrl: "https://quickswap.exchange/#/swap?outputCurrency=0x0D9B0790E97e3426C161580dF4Ee853E4A7C4607"
    });

    // Project 5: Grand Timeline
    const grandTimeline = await this.createProject({
      name: "Grand Timeline",
      description: "Grand Timeline is an advanced decentralized storage solution that provides secure, encrypted file storage on the blockchain. Users can store their data with complete privacy, while also being able to share access with specific parties when needed.",
      tokenSymbol: "GRNDT",
      tokenName: "Grand Timeline Token",
      price: 0.65,
      marketCap: 5100000,
      volume24h: 580000,
      change24h: -0.89,
      totalSupply: 75000000,
      circulatingSupply: 18000000,
      category: "AI Protocol",
      shortDescription: "Yield Optimization Protocol",
      blockchain: "Ethereum, BSC, Solana",
      tokenStandard: "ERC-20",
      contractAddress: "0xfAFB870F1918827fe57Ca4b891124606EaA7e6bd",
      rank: 3, // Updated rank
      websiteUrl: "https://quantumyield.finance",
      whitePaperUrl: "https://quantumyield.finance/whitepaper.pdf",
      githubUrl: "https://github.com/quantumyield",
      twitterUrl: "https://twitter.com/QuantumYield",
      discordUrl: "https://discord.gg/quantumyield",
      avatarBg: "#FBBA80",
      avatarText: "QY",
      avatarColor: "#101010",
      isFeatured: false,
      imageUrl: "/project-logos/quantum-dao.svg",
      swapUrl: "https://quickswap.exchange/#/swap?outputCurrency=0x460a8186aa4574c18709d1eff118efdaa5235c19"
    });
    
    // Project 6: Prismo Technology
    const prismoTechnology = await this.createProject({
      name: "Prismo Technology",
      description: "Prismo Technology is a next-generation security protocol that provides real-time monitoring and protection for blockchain assets and smart contracts. Our platform uses AI-powered anomaly detection to identify and prevent security breaches before they can impact your assets.",
      tokenSymbol: "PRSM",
      tokenName: "Prismo Technology Token",
      price: 0.18,
      marketCap: 1200000,
      volume24h: 180000,
      change24h: 0,
      totalSupply: 100000000,
      circulatingSupply: 0,
      category: "Infra / Tooling",
      shortDescription: "AI-Powered Blockchain Security Protocol",
      blockchain: "Ethereum, Polygon",
      tokenStandard: "ERC-20",
      contractAddress: "0x0b7a46E1af45E1EaadEeD34B55b6FC00A85c7c68",
      rank: 4, // Updated rank
      websiteUrl: "https://chainguard.io",
      whitePaperUrl: "https://chainguard.io/whitepaper.pdf",
      githubUrl: "https://github.com/chainguard",
      twitterUrl: "https://twitter.com/ChainGuard",
      discordUrl: "https://discord.gg/chainguard",
      avatarBg: "#FBBA80",
      avatarText: "CG",
      avatarColor: "#101010",
      isFeatured: false,
      isNew: false,
      imageUrl: "/project-logos/chain-guard.svg",
      swapUrl: "https://quickswap.exchange/#/swap?outputCurrency=0x4dc15edc968eceaec3a5e0f12d0acecacee05e25"
    });
    
    // Project 5: Gridlock
    const zkVault = await this.createProject({
      name: "Gridlock",
      description: "Gridlock is a next-generation blockchain infrastructure that enhances network security and scalability through innovative grid-based node architecture. Our solution enables parallel transaction processing for improved throughput while maintaining decentralization.",
      tokenSymbol: "GRID",
      tokenName: "GRID Token",
      price: 0.069,
      marketCap: 400000,
      volume24h: 0,
      change24h: 0,
      totalSupply: 250000000,
      circulatingSupply: 0,
      category: "Infra / Tooling",
      shortDescription: "Zero-Knowledge Privacy for Digital Assets",
      blockchain: "Ethereum",
      tokenStandard: "ERC-20",
      contractAddress: "0x00000000000000000000000000000000000grid01",
      rank: 8,
      websiteUrl: "https://zkvault.io",
      whitePaperUrl: "https://zkvault.io/whitepaper.pdf",
      githubUrl: "https://github.com/zkvault",
      twitterUrl: "https://twitter.com/ZKVault",
      discordUrl: "https://discord.gg/zkvault",
      avatarBg: "#FBBA80",
      avatarText: "ZK",
      avatarColor: "#101010",
      isFeatured: false,
      isNew: true,
      imageUrl: "/project-logos/zk-vault.svg"
    });
    
    // Project 9: To Da Moon
    const cosmosBridge = await this.createProject({
      name: "To Da Moon",
      description: "To Da Moon is a community-driven DeFi project focused on innovative staking solutions and yield optimization strategies. Our protocol aims to maximize returns for token holders while maintaining robust security and governance controls.",
      tokenSymbol: "2MOON",
      tokenName: "To Da Moon Token",
      price: 0.069,
      marketCap: 400000,
      volume24h: 0,
      change24h: 0,
      totalSupply: 200000000,
      circulatingSupply: 0,
      category: "GameFi",
      shortDescription: "Connecting Cosmos to Ethereum and Beyond",
      blockchain: "Cosmos, Ethereum",
      tokenStandard: "ERC-20",
      contractAddress: "0x00000000000000000000000000000000000moon1",
      rank: 9,
      websiteUrl: "https://cosmosbridge.network",
      whitePaperUrl: "https://cosmosbridge.network/whitepaper.pdf",
      githubUrl: "https://github.com/cosmosbridge",
      twitterUrl: "https://twitter.com/CosmosBridge",
      discordUrl: "https://discord.gg/cosmosbridge",
      avatarBg: "#FBBA80",
      avatarText: "CB",
      avatarColor: "#101010",
      isFeatured: true,
      isNew: true,
      imageUrl: "/project-logos/cosmos-bridge.svg"
    });
    

    
    // Project 11: How to DAO
    const nftMarketplace = await this.createProject({
      name: "How to DAO",
      description: "How to DAO provides educational resources, governance frameworks, and tooling for creating and managing decentralized autonomous organizations. Our platform offers templates, best practices, and community support to help projects launch and maintain effective DAOs.",
      tokenSymbol: "H2D",
      tokenName: "How to DAO Token",
      price: 0.069,
      marketCap: 400000,
      volume24h: 0,
      change24h: 0,
      totalSupply: 150000000,
      circulatingSupply: 20000000,
      category: "SoFi",
      shortDescription: "Cross-Chain Digital Collectibles Marketplace",
      blockchain: "Ethereum, Solana, Polygon",
      tokenStandard: "ERC-20",
      contractAddress: "0x000000000000000000000000000000000000h2d1",
      rank: 11,
      websiteUrl: "https://nftmarketplace.io",
      whitePaperUrl: "https://nftmarketplace.io/whitepaper.pdf",
      githubUrl: "https://github.com/nftmarketplace",
      twitterUrl: "https://twitter.com/NFTMarketplace",
      discordUrl: "https://discord.gg/nftmarketplace",
      avatarBg: "#FBBA80",
      avatarText: "NM",
      avatarColor: "#101010",
      isFeatured: false,
      isNew: true,
      imageUrl: "/project-logos/nft-marketplace.svg"
    });
    
    // Project 12: Web3 Packs
    const web3Social = await this.createProject({
      name: "Web3 Packs",
      description: "Web3 Packs delivers curated collections of digital assets that introduce users to different blockchain ecosystems. Our platform provides educational resources and starter assets to help onboard new users into web3 with confidence and knowledge.",
      tokenSymbol: "WPACK",
      tokenName: "Web3 Packs Token",
      price: 0.069,
      marketCap: 400000,
      volume24h: 0,
      change24h: 0,
      totalSupply: 200000000,
      circulatingSupply: 20000000,
      category: "DeFi",
      shortDescription: "Decentralized Social Media Protocol",
      blockchain: "Solana",
      tokenStandard: "SPL",
      contractAddress: "0x0000000000000000000000000000000000wpack1",
      rank: 12,
      websiteUrl: "https://web3social.io",
      whitePaperUrl: "https://web3social.io/whitepaper.pdf",
      githubUrl: "https://github.com/web3social",
      twitterUrl: "https://twitter.com/Web3Social",
      discordUrl: "https://discord.gg/web3social",
      avatarBg: "#FBBA80",
      avatarText: "W3",
      avatarColor: "#101010",
      isFeatured: false,
      isNew: true,
      imageUrl: "/project-logos/web3-social.svg"
    });
    


    // Add features for X23.ai
    // These are already added above by specific calls for x23.id
    
    // Add features for Citizen Wallet
    await this.addProjectFeature({ projectId: 2, feature: "Simple Transactions for ERC20 tokens" });
    await this.addProjectFeature({ projectId: 2, feature: "Voucher System for wallet-less users" });
    await this.addProjectFeature({ projectId: 2, feature: "Web Burner Wallet for temporary usage" });
    await this.addProjectFeature({ projectId: 2, feature: "NFC Wallets for hardware-free transactions" });
    await this.addProjectFeature({ projectId: 2, feature: "Point of Sale (POS) for Merchants" });
    await this.addProjectFeature({ projectId: 2, feature: "Multicurrency Support" });

    // Add technical details for Citizen Wallet
    await this.addProjectTechnicalDetail({ projectId: 2, label: "Supported Networks", value: "Polygon, Optimism, Celo, Base" });
    await this.addProjectTechnicalDetail({ projectId: 2, label: "Active Communities", value: "24+" });
    await this.addProjectTechnicalDetail({ projectId: 2, label: "Open Source Status", value: "MIT License" });
    
    // Add features for Grand Timeline
    await this.addProjectFeature({ projectId: 3, feature: "Secure encrypted file storage on the blockchain" });
    await this.addProjectFeature({ projectId: 3, feature: "Distributed storage across multiple nodes" });
    await this.addProjectFeature({ projectId: 3, feature: "File sharing with granular access control" });
    await this.addProjectFeature({ projectId: 3, feature: "Immutable audit trail of file modifications" });
    
    // Add technical details for Grand Timeline
    await this.addProjectTechnicalDetail({ projectId: 3, label: "Storage Capacity", value: "45 PB" });
    await this.addProjectTechnicalDetail({ projectId: 3, label: "Average Storage Cost", value: "$0.005/GB/month" });
    await this.addProjectTechnicalDetail({ projectId: 3, label: "Active Users", value: "42,650" });
    await this.addProjectTechnicalDetail({ projectId: 3, label: "Network Uptime", value: "99.995%" });
    
    // Add features for Prismo Technology
    await this.addProjectFeature({ projectId: 4, feature: "Real-time monitoring of smart contract vulnerabilities" });
    await this.addProjectFeature({ projectId: 4, feature: "AI-powered threat detection and prevention" });
    await this.addProjectFeature({ projectId: 4, feature: "Automated audit reports for developers" });
    await this.addProjectFeature({ projectId: 4, feature: "Insurance coverage for protected assets" });
    await this.addProjectFeature({ projectId: 4, feature: "Cross-chain security solutions" });
    
    // Add technical details for Prismo Technology
    await this.addProjectTechnicalDetail({ projectId: 4, label: "Protected Assets", value: "$0" });
    await this.addProjectTechnicalDetail({ projectId: 4, label: "Vulnerability Detection Rate", value: "97.8%" });
    await this.addProjectTechnicalDetail({ projectId: 4, label: "AI Model Accuracy", value: "99.2%" });
    await this.addProjectTechnicalDetail({ projectId: 4, label: "Response Time", value: "<500ms" });
    
    // Add features for MetaverseDAO
    await this.addProjectFeature({ projectId: 7, feature: "Community governance of virtual world assets" });
    await this.addProjectFeature({ projectId: 7, feature: "Cross-platform asset interoperability" });
    await this.addProjectFeature({ projectId: 7, feature: "Decentralized marketplace for creators" });
    await this.addProjectFeature({ projectId: 7, feature: "Virtual land acquisition and development" });
    await this.addProjectFeature({ projectId: 7, feature: "Metaverse event hosting capabilities" });
    
    // Add technical details for MetaverseDAO
    await this.addProjectTechnicalDetail({ projectId: 7, label: "Virtual Land Parcels", value: "10,000" });
    await this.addProjectTechnicalDetail({ projectId: 7, label: "Connected Platforms", value: "3" });
    await this.addProjectTechnicalDetail({ projectId: 7, label: "Active Creators", value: "120+" });
    await this.addProjectTechnicalDetail({ projectId: 7, label: "Governance Proposals", value: "18" });
    
    // Add features for ZK Vault
    await this.addProjectFeature({ projectId: 8, feature: "Zero-knowledge proof technology for privacy" });
    await this.addProjectFeature({ projectId: 8, feature: "Private transactions with public verifiability" });
    await this.addProjectFeature({ projectId: 8, feature: "Multi-signature wallet security" });
    await this.addProjectFeature({ projectId: 8, feature: "Self-custody with institutional-grade security" });
    await this.addProjectFeature({ projectId: 8, feature: "Fully compliant with regulatory frameworks" });
    
    // Add technical details for ZK Vault
    await this.addProjectTechnicalDetail({ projectId: 8, label: "Privacy Level", value: "Tier-1" });
    await this.addProjectTechnicalDetail({ projectId: 8, label: "Throughput", value: "5,000 TPS" });
    await this.addProjectTechnicalDetail({ projectId: 8, label: "Security Audits", value: "3" });
    await this.addProjectTechnicalDetail({ projectId: 8, label: "Encryption Standard", value: "Military Grade" });
    
    // Add features for Cosmos Bridge
    await this.addProjectFeature({ projectId: 9, feature: "Seamless cross-chain asset transfers" });
    await this.addProjectFeature({ projectId: 9, feature: "IBC-compatible protocol architecture" });
    await this.addProjectFeature({ projectId: 9, feature: "Universal liquidity across connected chains" });
    await this.addProjectFeature({ projectId: 9, feature: "Low-latency finality across blockchains" });
    await this.addProjectFeature({ projectId: 9, feature: "Composable smart contract interoperability" });
    
    // Add technical details for Cosmos Bridge
    await this.addProjectTechnicalDetail({ projectId: 9, label: "Connected Chains", value: "11" });
    await this.addProjectTechnicalDetail({ projectId: 9, label: "Bridge Security", value: "Multi-party computation" });
    await this.addProjectTechnicalDetail({ projectId: 9, label: "Confirmation Time", value: "<30 seconds" });
    await this.addProjectTechnicalDetail({ projectId: 9, label: "Max Transaction Size", value: "Unlimited" });
    
    // Add features for DeFi Pulse
    await this.addProjectFeature({ projectId: 10, feature: "Real-time analytics dashboard for all major DeFi protocols" });
    await this.addProjectFeature({ projectId: 10, feature: "Comprehensive yield comparison tools" });
    await this.addProjectFeature({ projectId: 10, feature: "Risk assessment scoring for protocols" });
    await this.addProjectFeature({ projectId: 10, feature: "Automated portfolio rebalancing" });
    await this.addProjectFeature({ projectId: 10, feature: "Gas fee optimization algorithms" });
    
    // Add technical details for DeFi Pulse
    await this.addProjectTechnicalDetail({ projectId: 10, label: "Tracked Protocols", value: "87" });
    await this.addProjectTechnicalDetail({ projectId: 10, label: "Data Refresh Rate", value: "5 minutes" });
    await this.addProjectTechnicalDetail({ projectId: 10, label: "API Endpoints", value: "42" });
    await this.addProjectTechnicalDetail({ projectId: 10, label: "Daily Active Users", value: "25,000+" });
    
    // Add features for NFT Marketplace
    await this.addProjectFeature({ projectId: 11, feature: "Zero gas fees for minting and trading" });
    await this.addProjectFeature({ projectId: 11, feature: "Cross-chain NFT compatibility" });
    await this.addProjectFeature({ projectId: 11, feature: "Flexible royalty management for creators" });
    await this.addProjectFeature({ projectId: 11, feature: "Verified artist credentials system" });
    await this.addProjectFeature({ projectId: 11, feature: "Integrated NFT lending market" });
    
    // Add technical details for NFT Marketplace
    await this.addProjectTechnicalDetail({ projectId: 11, label: "Total NFTs", value: "3.2 million" });
    await this.addProjectTechnicalDetail({ projectId: 11, label: "Monthly Volume", value: "$14.5M" });
    await this.addProjectTechnicalDetail({ projectId: 11, label: "Verified Artists", value: "2,400+" });
    await this.addProjectTechnicalDetail({ projectId: 11, label: "Average Royalty", value: "7.5%" });
    
    // Add features for Web3 Social
    await this.addProjectFeature({ projectId: 12, feature: "Decentralized content ownership and monetization" });
    await this.addProjectFeature({ projectId: 12, feature: "Token-gated communities and content" });
    await this.addProjectFeature({ projectId: 12, feature: "User-controlled data sharing and privacy settings" });
    await this.addProjectFeature({ projectId: 12, feature: "Built-in creator tipping and subscription models" });
    await this.addProjectFeature({ projectId: 12, feature: "Content moderation through community governance" });
    
    // Add technical details for Web3 Social
    await this.addProjectTechnicalDetail({ projectId: 12, label: "Daily Active Users", value: "175,000" });
    await this.addProjectTechnicalDetail({ projectId: 12, label: "Content Creators", value: "18,500" });
    await this.addProjectTechnicalDetail({ projectId: 12, label: "Communities", value: "2,800" });
    await this.addProjectTechnicalDetail({ projectId: 12, label: "Storage Protocol", value: "IPFS/Arweave" });
    

    
    // Create sample users
    await this.createUser({
      username: "cryptowhale",
      email: "whale@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=cryptowhale",
      points: 12450,
    });
    
    await this.createUser({
      username: "hodler123",
      email: "hodl@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=hodler123",
      points: 8920,
    });
    
    await this.createUser({
      username: "satoshifan",
      email: "satoshi@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=satoshifan",
      points: 7340,
    });
    
    await this.createUser({
      username: "tokenmasterx",
      email: "tokenmaster@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=tokenmasterx",
      points: 5100,
    });
    
    await this.createUser({
      username: "defi_guru",
      email: "defiguru@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=defi_guru",
      points: 4320,
    });
    
    await this.createUser({
      username: "blockchain_dev",
      email: "blockdev@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=blockchain_dev",
      points: 3840,
    });
    
    await this.createUser({
      username: "ethinvestor",
      email: "eth@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=ethinvestor",
      points: 2950,
    });
    
    await this.createUser({
      username: "nftcollector",
      email: "nft@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=nftcollector",
      points: 1750,
    });
    
    await this.createUser({
      username: "web3builder",
      email: "web3@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=web3builder",
      points: 1320,
    });
    
    await this.createUser({
      username: "metaversefan",
      email: "meta@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=metaversefan",
      points: 980,
    });
    
    // Update all user ranks
    await this.updateUserRanks();
    
    // Add some point transactions as examples
    await this.addPointTransaction({
      userId: 1,
      projectId: 1,
      amount: 500,
      tokenAmount: 40,
      transactionHash: "0x1234...5678",
      description: "Purchased X23 tokens"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 2,
      amount: 300,
      tokenAmount: 80,
      transactionHash: "0x8765...4321",
      description: "Purchased CTZN tokens"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 3,
      amount: 450,
      tokenAmount: 120,
      transactionHash: "0xabcd...ef01",
      description: "Purchased GRID tokens"
    });
    
    // Add transactions for the additional tokens in portfolio
    await this.addPointTransaction({
      userId: 1,
      projectId: 4,
      amount: 600,
      tokenAmount: 150,
      transactionHash: "0xdef0...1234",
      description: "Purchased PRSM tokens"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 8,
      amount: 750,
      tokenAmount: 200,
      transactionHash: "0x5678...9abc",
      description: "Purchased GRID tokens"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 9,
      amount: 325,
      tokenAmount: 75,
      transactionHash: "0xfedc...ba98",
      description: "Purchased 2MOON tokens"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 11,
      amount: 920,
      tokenAmount: 320,
      transactionHash: "0x7654...3210",
      description: "Purchased H2D tokens"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 12,
      amount: 375,
      tokenAmount: 90,
      transactionHash: "0xcba9...8765",
      description: "Purchased WPACK tokens"
    });
    
    // Add X23 transactions for user 1 (multiple rounds with different cliff and end dates)
    await this.addPointTransaction({
      userId: 1,
      projectId: 1, // X23 now has ID 1
      amount: 850,
      tokenAmount: 350,
      transactionHash: "0x3456...7890",
      description: "Purchased X23 tokens - Round 1"
    });
    
    await this.addPointTransaction({
      userId: 1,
      projectId: 1, // X23 now has ID 1
      amount: 1200,
      tokenAmount: 583,
      transactionHash: "0x9012...3456",
      description: "Purchased X23 tokens - Round 2"
    });
    
    // Add transaction for user 2
    await this.addPointTransaction({
      userId: 2,
      projectId: 2,
      amount: 450,
      tokenAmount: 55,
      transactionHash: "0xabcd...ef01",
      description: "Purchased CTZN tokens"
    });
    
    // Generate price history for launched projects 
    // (excluding new projects that don't have price data yet)
    await this.generateSamplePriceHistory(1, 1.15, 4.5, 90); // X23.ai 
    await this.generateSamplePriceHistory(2, 0.92, 3.8, 90); // Citizen Wallet
    await this.generateSamplePriceHistory(3, 0.65, 4.3, 90); // Grand Timeline
    await this.generateSamplePriceHistory(4, 0.18, 5.0, 90); // Prismo Technology
    await this.generateSamplePriceHistory(8, 0.069, 0.0, 7); // Gridlock 
    await this.generateSamplePriceHistory(9, 0.069, 0.0, 7); // To Da Moon
    await this.generateSamplePriceHistory(11, 0.069, 0.0, 7); // How to DAO
    await this.generateSamplePriceHistory(12, 0.069, 0.0, 7); // Web3 Packs
  }
  
  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }
    
    const updatedProject: Project = {
      ...project,
      ...updates
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
}

export const storage = new MemStorage();
