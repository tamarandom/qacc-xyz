import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewProjectCard } from '@/components/projects/new-project-card';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Project } from '@shared/schema';

interface NewProjectContentProps {
  project: Project;
}

/**
 * NewProjectContent Component
 * 
 * Displays tab-based content specifically for new projects that haven't
 * been listed on DEX yet. This includes about, team, roadmap, and tokenomics
 * information in a visually consistent format following QACC brand guidelines.
 */
export function NewProjectContent({ project }: NewProjectContentProps) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="bg-[color:var(--color-peach)]/10 dark:bg-[color:var(--color-black)]/30 mb-6 overflow-x-auto flex w-full border-b border-[color:var(--color-peach)]/20 dark:border-[color:var(--color-black)]/50 pb-px">
        <TabsTrigger 
          value="about" 
          className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-black dark:data-[state=active]:text-black data-[state=active]:shadow-sm rounded-t-md font-tusker text-base px-8"
        >
          ABOUT
        </TabsTrigger>
        <TabsTrigger 
          value="team" 
          className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-black dark:data-[state=active]:text-black data-[state=active]:shadow-sm rounded-t-md font-tusker text-base px-8"
        >
          TEAM
        </TabsTrigger>
        <TabsTrigger 
          value="roadmap" 
          className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-black dark:data-[state=active]:text-black data-[state=active]:shadow-sm rounded-t-md font-tusker text-base px-8"
        >
          ROADMAP
        </TabsTrigger>
        <TabsTrigger 
          value="tokenomics" 
          className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-black dark:data-[state=active]:text-black data-[state=active]:shadow-sm rounded-t-md font-tusker text-base px-8"
        >
          TOKENOMICS
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold font-tusker">{project.name}</h2>
          <p>{project.description}</p>
          
          {/* Project Key Features */}
          <h3 className="text-xl font-medium mt-8 font-tusker">KEY FEATURES</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <strong>Innovative Technology:</strong> {project.name} introduces cutting-edge blockchain solutions designed for scalability and security.
              </div>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <strong>Robust Tokenomics:</strong> Transparent and sustainable token distribution model with incentives for long-term holders.
              </div>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <strong>Experienced Team:</strong> Developed by a team with extensive background in blockchain technology and market innovation.
              </div>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <strong>Community Focus:</strong> Strong emphasis on community governance and participation in project development.
              </div>
            </li>
          </ul>
        </div>
        
        {/* Token Launch Card */}
        <NewProjectCard 
          projectId={project.id}
          projectName={project.name}
          tokenSymbol={project.tokenSymbol}
          price={project.price}
          totalSupply={project.totalSupply || 10000000}
          blockchain={project.blockchain || "Polygon"}
          tokenStandard={project.tokenStandard || "ERC-20"}
        />
      </TabsContent>
      
      <TabsContent value="team" className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-2xl font-bold font-tusker">TEAM</h3>
          <p>
            The {project.name} team brings together expertise from blockchain technology, 
            software development, and financial markets to build innovative solutions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Team Member 1 */}
            <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-4 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
              <div className="h-16 w-16 rounded-full bg-[color:var(--color-peach)]/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[color:var(--color-peach)]">JS</span>
              </div>
              <h4 className="text-lg font-bold mb-1">John Smith</h4>
              <p className="text-sm text-[color:var(--color-peach)] mb-3">Founder & CEO</p>
              <p className="text-sm">
                15+ years experience in blockchain development and distributed systems. 
                Previously led engineering at [Redacted] Protocol.
              </p>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-4 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
              <div className="h-16 w-16 rounded-full bg-[color:var(--color-peach)]/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[color:var(--color-peach)]">SD</span>
              </div>
              <h4 className="text-lg font-bold mb-1">Sarah Davis</h4>
              <p className="text-sm text-[color:var(--color-peach)] mb-3">CTO</p>
              <p className="text-sm">
                PhD in Computer Science with focus on cryptography. 
                10+ years experience building secure, scalable systems.
              </p>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-4 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
              <div className="h-16 w-16 rounded-full bg-[color:var(--color-peach)]/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[color:var(--color-peach)]">MP</span>
              </div>
              <h4 className="text-lg font-bold mb-1">Michael Parker</h4>
              <p className="text-sm text-[color:var(--color-peach)] mb-3">Head of Product</p>
              <p className="text-sm">
                Former product lead at multiple Web3 startups.
                Specialized in user-centric design and token economy models.
              </p>
            </div>
          </div>
          
          <h3 className="text-xl font-medium mt-10 font-tusker">ADVISORS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Advisor 1 */}
            <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-4 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
              <div className="h-16 w-16 rounded-full bg-[color:var(--color-peach)]/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[color:var(--color-peach)]">RL</span>
              </div>
              <h4 className="text-lg font-bold mb-1">Robert Lee</h4>
              <p className="text-sm text-[color:var(--color-peach)] mb-3">Strategic Advisor</p>
              <p className="text-sm">
                Venture capitalist with 20+ investments in Web3 projects.
                Founder of Blockchain Ventures Fund.
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="roadmap" className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-2xl font-bold font-tusker">DEVELOPMENT ROADMAP</h3>
          <p>
            Our strategic roadmap outlines the key milestones and objectives for {project.name}.
            We are committed to transparent communication with our community throughout the development process.
          </p>
          
          <div className="mt-8 relative border-l-2 border-[color:var(--color-peach)]/30 pl-8 ml-4 space-y-12">
            {/* Phase 1 */}
            <div className="relative">
              <div className="absolute -left-[43px] top-0 h-8 w-8 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center">
                <span className="text-sm font-bold text-black">1</span>
              </div>
              <h4 className="text-xl font-bold mb-2 text-[color:var(--color-peach)]">Q2 2025: Project Launch</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>Token pre-sale for early backers</li>
                <li>MVP launch with core functionality</li>
                <li>Security audit by independent third party</li>
                <li>DEX listing on QuickSwap</li>
              </ul>
            </div>
            
            {/* Phase 2 */}
            <div className="relative">
              <div className="absolute -left-[43px] top-0 h-8 w-8 rounded-full bg-[color:var(--color-peach)]/70 flex items-center justify-center">
                <span className="text-sm font-bold text-black">2</span>
              </div>
              <h4 className="text-xl font-bold mb-2 text-[color:var(--color-peach)]/70">Q3 2025: Expansion</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>Feature expansion and platform improvements</li>
                <li>Integration with major DeFi protocols</li>
                <li>Community governance implementation</li>
                <li>Cross-chain functionality development</li>
              </ul>
            </div>
            
            {/* Phase 3 */}
            <div className="relative">
              <div className="absolute -left-[43px] top-0 h-8 w-8 rounded-full bg-[color:var(--color-peach)]/50 flex items-center justify-center">
                <span className="text-sm font-bold text-black">3</span>
              </div>
              <h4 className="text-xl font-bold mb-2 text-[color:var(--color-peach)]/50">Q4 2025: Adoption</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>Strategic partnerships with major Web3 projects</li>
                <li>Advanced user features and tooling</li>
                <li>Enterprise solutions development</li>
                <li>Mobile app release</li>
              </ul>
            </div>
            
            {/* Phase 4 */}
            <div className="relative">
              <div className="absolute -left-[43px] top-0 h-8 w-8 rounded-full bg-[color:var(--color-peach)]/30 flex items-center justify-center">
                <span className="text-sm font-bold text-black">4</span>
              </div>
              <h4 className="text-xl font-bold mb-2 text-[color:var(--color-peach)]/30">2026: Scaling</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>Global expansion and marketing initiatives</li>
                <li>Advanced protocol improvements</li>
                <li>Integration with traditional finance systems</li>
                <li>Research and development for next-gen features</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="tokenomics" className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-2xl font-bold font-tusker">TOKENOMICS</h3>
          <p>
            The {project.tokenSymbol} token serves as the core utility and governance token for the {project.name} ecosystem.
            Our tokenomics model is designed for long-term sustainability and community alignment.
          </p>
          
          {/* Token Allocation */}
          <div className="mt-8">
            <h4 className="text-xl font-medium mb-6 font-tusker">TOKEN ALLOCATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Visual Allocation */}
              <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-6 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
                <h5 className="text-lg font-medium mb-4">Distribution</h5>
                
                {/* Distribution Bars */}
                <div className="space-y-6">
                  {/* Community Sale */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Community Sale</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-[color:var(--color-peach)] h-2.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  
                  {/* Team & Advisors */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Team & Advisors</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-[color:var(--color-peach)]/80 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  
                  {/* Ecosystem & Development */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Ecosystem & Development</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-[color:var(--color-peach)]/60 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  {/* Liquidity & Exchange */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Liquidity & Exchange</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-[color:var(--color-peach)]/40 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  
                  {/* Marketing & Partnerships */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Marketing & Partnerships</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-[color:var(--color-peach)]/20 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Side: Token Details */}
              <div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Token Name</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{project.name} Token</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Token Symbol</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{project.tokenSymbol}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Supply</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(project.totalSupply || 10000000)} {project.tokenSymbol}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Initial Circulating Supply</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber((project.totalSupply || 10000000) * 0.3)} {project.tokenSymbol}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Initial Token Price</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(project.price)}</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h5 className="text-lg font-medium mb-3">Token Utility</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm">Governance and voting rights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm">Platform fee discounts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm">Staking rewards and yield opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[color:var(--color-peach)]/10 text-[color:var(--color-peach)] mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm">Access to premium features and services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vesting Schedule */}
          <div className="mt-10">
            <h4 className="text-xl font-medium mb-4 font-tusker">VESTING SCHEDULE</h4>
            <p className="mb-4">
              Token vesting ensures long-term commitment from the team and early backers,
              while providing a stable release of tokens into the market.
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allocation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliff</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vesting Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Release Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-sm">Community Sale</td>
                    <td className="px-4 py-3 text-sm">None</td>
                    <td className="px-4 py-3 text-sm">6 months</td>
                    <td className="px-4 py-3 text-sm">25% at TGE, then linear monthly</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Team & Advisors</td>
                    <td className="px-4 py-3 text-sm">12 months</td>
                    <td className="px-4 py-3 text-sm">36 months</td>
                    <td className="px-4 py-3 text-sm">Linear monthly after cliff</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Ecosystem & Development</td>
                    <td className="px-4 py-3 text-sm">3 months</td>
                    <td className="px-4 py-3 text-sm">24 months</td>
                    <td className="px-4 py-3 text-sm">Linear monthly after cliff</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Liquidity & Exchange</td>
                    <td className="px-4 py-3 text-sm">None</td>
                    <td className="px-4 py-3 text-sm">12 months</td>
                    <td className="px-4 py-3 text-sm">50% at TGE, then linear monthly</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Marketing & Partnerships</td>
                    <td className="px-4 py-3 text-sm">1 month</td>
                    <td className="px-4 py-3 text-sm">18 months</td>
                    <td className="px-4 py-3 text-sm">Linear monthly after cliff</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              TGE = Token Generation Event
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}