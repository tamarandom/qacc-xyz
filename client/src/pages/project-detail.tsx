import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProjectAvatar } from "@/components/ui/project-avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PercentageChange from "@/components/ui/percentage-change";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { ArrowLeft, Rocket, Calendar, Timer, Copy, ExternalLink } from "lucide-react";
import { PriceChart } from "@/components/projects/price-chart";
import { GeckoTerminalChart } from "@/components/projects/gecko-terminal-chart";
import { TokenHolders } from "@/components/projects/token-holders";
import quickswapLogo from "@assets/quickswap-logo.jpg";

import { Project, ProjectFeature, ProjectTechnicalDetail } from "@shared/schema";

export default function ProjectDetail() {
  const { id } = useParams();
  
  const { data: project, isLoading, isError } = useQuery<Project & {
    features: ProjectFeature[];
    technicalDetails: ProjectTechnicalDetail[];
  }>({
    queryKey: [`/api/projects/${id}`],
  });
  
  if (isLoading) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </div>
        <Skeleton className="h-[800px] w-full rounded-lg" />
      </div>
    );
  }
  
  if (isError || !project) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">Failed to load project</h3>
              <p className="text-sm text-gray-500 mt-2">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[color:var(--color-black)]">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-700 dark:hover:bg-[color:var(--color-black-200)]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-[color:var(--color-black)] rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-[color:var(--color-black-200)] bg-white dark:bg-[color:var(--color-black)]">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
            {/* Left Side - Project Info */}
            <div className="flex items-start">
              {project.isNew && (
                <Badge className="mr-4 bg-black text-white hover:bg-black dark:bg-zinc-800 text-sm py-1 px-3 self-center">
                  NEW
                </Badge>
              )}
              <ProjectAvatar
                name={project.name}
                bgColor={project.avatarBg}
                textColor={project.avatarColor}
                initials={project.avatarText || project.name.substring(0, 2)}
                size="lg"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.name} <span className="text-lg text-gray-500 dark:text-gray-400">${project.tokenSymbol}</span>
                </h1>
                
                {/* Contract address with copy button */}
                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <a 
                    href={`https://polygonscan.com/token/${project.contractAddress}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:text-[color:var(--color-peach)] truncate max-w-xs"
                  >
                    {project.contractAddress}
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(project.contractAddress);
                      // Could add toast notification here
                    }}
                    className="ml-2 text-gray-400 hover:text-[color:var(--color-peach)]"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Category and Social Links */}
                <div className="flex items-center mt-2 space-x-3">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:border-blue-800">
                    {project.category}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <a 
                      href="https://x23.ai" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-[color:var(--color-peach)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </a>
                    <a 
                      href="https://twitter.com/x23_ai" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-[color:var(--color-peach)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a 
                      href="https://discord.gg/x23ai" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-[color:var(--color-peach)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.6869-.2762-5.4886 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                      </svg>
                    </a>
                    {/* DexScreener Link */}
                    <a 
                      href={`https://dexscreener.com/polygon/${project.contractAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-[color:var(--color-peach)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.993 6.917c-.629-1.266-1.744-2.01-2.968-2.01-1.177 0-2.258.7-2.892 1.883a3.646 3.646 0 00-.429 1.087c-.061.263-.09.537-.082.813l.001.016H9.377l.001-.013c.009-.28-.02-.557-.083-.824a3.648 3.648 0 00-.429-1.08c-.634-1.182-1.715-1.882-2.891-1.882-1.226 0-2.34.744-2.97 2.01C1.844 8.922 2.203 11.125 4 12.847v4.295c0 .253.068.457.151.457h1.698c.083 0 .15-.204.15-.457V13.97l-.39-.334c-.76-.653-1.217-1.364-1.435-2.124-.29-1.023-.048-2.046.756-2.813.285-.271.623-.414.969-.414.508 0 .997.28 1.28.733.262.422.339.953.23 1.586-.1.56-.354 1.152-.785 1.617l-.427.461.423.464c.56.613 1.235 1.131 2.01 1.54l1.39.733 1.393-.733c.774-.408 1.45-.927 2.01-1.54l.422-.464-.428-.461c-.43-.466-.684-1.058-.783-1.618-.108-.634-.032-1.165.23-1.586.282-.454.771-.733 1.279-.733.347 0 .684.142.97.414.804.767 1.046 1.79.755 2.813-.218.76-.674 1.471-1.435 2.125l-.389.333v3.172c0 .254.067.458.15.458h1.699c.083 0 .15-.204.15-.458v-4.295c1.799-1.721 2.157-3.924 1.997-5.93z" />
                      </svg>
                    </a>
                    {/* GeckoTerminal Link */}
                    <a 
                      href={`https://www.geckoterminal.com/polygon_pos/pools/${project.contractAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-[color:var(--color-peach)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.014 3a9 9 0 0 0-3.279 17.395 8.991 8.991 0 0 0 6.57.001A9.003 9.003 0 0 0 12.014 3zm4.343 11.925l-4.35 4.204-4.35-4.204-1.492-1.442 1.492-1.442 4.35 4.204 4.35-4.204 1.492 1.442-1.492 1.442z" />
                        <path d="M15.65 11.262l-3.633 3.505-3.633-3.505L7.45 10.28l.933-.904 3.633 3.504 3.633-3.505.934.904-.934.982z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Stats and Buttons */}
            <div className="flex flex-col items-end justify-between">
              {/* Stats section */}
              <div className="grid grid-cols-1 gap-3 mt-2">
                {project.isNew ? (
                  // For new projects, just show price
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                    <div className="flex items-center justify-end">
                      <span className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {formatCurrency(project.price)}
                      </span>
                      <PercentageChange value={project.change24h} className="ml-2" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(24h)</span>
                    </div>
                  </div>
                ) : (
                  // For launched projects, compact layout with Market Cap and Price in a grid
                  <>
                    {/* Market Cap and Price in a 2-column grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Market Cap prominently displayed */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
                        <p className="font-mono text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(project.marketCap, false, true, true)}
                        </p>
                      </div>
                      
                      {/* Price with 24h change */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                        <div className="flex items-center justify-end">
                          <span className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                            {formatCurrency(project.price)}
                          </span>
                          <PercentageChange value={project.change24h} className="ml-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(24h)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 24h Volume */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">24h Volume</p>
                      <p className="font-mono text-base text-gray-900 dark:text-white">
                        {formatCurrency(project.volume24h, false, false, true)}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-3 mt-5">
                {project.isNew ? (
                  /* Buy button for new projects */
                  <button className="px-6 py-2 text-sm font-medium bg-[color:var(--color-peach)] text-black hover:bg-[color:var(--color-peach-dark)] rounded-md transition-colors shadow-sm">
                    Buy {project.tokenSymbol}
                  </button>
                ) : (
                  /* Two buttons for launched projects: Buy and Swap */
                  <>
                    <button className="px-4 py-1.5 text-sm font-medium bg-[color:var(--color-peach)] text-black hover:bg-[color:var(--color-peach-dark)] rounded-md transition-colors shadow-sm">
                      Buy
                    </button>
                    <a 
                      href={project.swapUrl || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 text-sm font-medium bg-[#4A89DC] text-white hover:bg-[#3A79CC] rounded-md transition-colors shadow-sm inline-flex items-center gap-1"
                    >
                      <img src={quickswapLogo} alt="DEX" className="h-4 w-4 rounded-full" />
                      <span>Swap</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart for all launched projects */}
        {!project.isNew && (
          <div className="px-4 py-4 bg-white dark:bg-[color:var(--color-black)]">
            <div className="mx-auto max-w-5xl overflow-hidden">
              <GeckoTerminalChart projectId={project.id} tokenSymbol={project.tokenSymbol} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-[color:var(--color-black)]">
          <div className="bg-white dark:bg-[color:var(--color-black)] rounded-lg p-4 md:col-span-2">
            {/* For New Projects: Showcase key metrics and token sale info */}
            {project.isNew && (
              <div className="mb-8">
                <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
                  <CardHeader className="border-b border-gray-100 dark:border-[color:var(--color-black-200)]">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Rocket className="h-5 w-5 text-[color:var(--color-peach)]" />
                      <span>Token Launch Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    {/* Status banner */}
                    <div className="mb-6 bg-[color:var(--color-peach)]/10 border border-[color:var(--color-peach)]/20 rounded-md p-3 flex items-center">
                      <div className="bg-[color:var(--color-peach)] rounded-full p-1 mr-3">
                        <Rocket className="h-4 w-4 text-black" />
                      </div>
                      <span className="text-sm font-medium">Token currently in accelerator phase. Will be listed on DEX after this round.</span>
                    </div>
                    
                    {/* Key details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Project Stage</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Pre-sale Round</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Token Supply</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(project.totalSupply)}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Blockchain</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{project.blockchain}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Token Standard</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{project.tokenStandard}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Initial Token Price</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(project.price)}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Token Type</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Utility & Governance</span>
                      </div>
                    </div>
                    
                    {/* Participation CTA */}
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[color:var(--color-black-200)] text-center">
                      <button className="px-6 py-2 text-base font-medium bg-[color:var(--color-peach)] text-black hover:bg-[color:var(--color-peach-dark)] rounded-md transition-colors shadow-sm">
                        Participate in Token Sale
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Only available to qualified project backers</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="mb-6">
              <Tabs defaultValue="overview" className="dark:bg-[color:var(--color-black)]">
                {/* Wrap TabsList in a div to enable horizontal scrolling on mobile */}
                <div className="overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-[color:var(--color-black-200)] bg-white dark:bg-[color:var(--color-black)]">
                  <TabsList className="w-max min-w-full flex justify-start pb-0 bg-white dark:bg-[color:var(--color-black)]">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm mr-2 sm:mr-4 md:mr-8 whitespace-nowrap dark:text-gray-300"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="team" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm mr-2 sm:mr-4 md:mr-8 whitespace-nowrap dark:text-gray-300"
                    >
                      Team
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tokenomics" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm mr-2 sm:mr-4 md:mr-8 whitespace-nowrap dark:text-gray-300"
                    >
                      Tokenomics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="roadmap" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm whitespace-nowrap dark:text-gray-300"
                    >
                      Roadmap
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="pt-4 dark:bg-[color:var(--color-black)]">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About {project.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                  
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 mt-4">Key Features</h4>
                  <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                    {project.features?.map((feature) => (
                      <li key={feature.id}>{feature.feature}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 mt-4">Technology</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {project.name}'s core infrastructure is built on a modified Byzantine Fault Tolerance consensus mechanism 
                    that allows for secure distribution of validator duties. Our smart contracts are audited by leading security 
                    firms, and we've implemented a comprehensive risk management framework to protect user funds.
                  </p>
                </TabsContent>
                
                <TabsContent value="tokenomics" className="dark:bg-[color:var(--color-black)]">
                  <div className="py-4 dark:bg-[color:var(--color-black)]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Token Distribution</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Information about token distribution will be available soon.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="team" className="dark:bg-[color:var(--color-black)]">
                  <div className="py-4 dark:bg-[color:var(--color-black)]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Members</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Information about the team will be available soon.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="roadmap" className="dark:bg-[color:var(--color-black)]">
                  <div className="py-4 dark:bg-[color:var(--color-black)]">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Development Roadmap</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Information about the project roadmap will be available soon.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div>
            <Card className="mb-4 dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">TOP TOKEN HOLDERS</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <TokenHolders projectId={parseInt(id || "0")} />
              </CardContent>
            </Card>
            
            <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">Links & Resources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="divide-y divide-gray-200 dark:divide-[color:var(--color-black-200)]">

                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-200">Website</span>
                    <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 dark:text-[color:var(--color-peach)] dark:hover:text-[color:var(--color-peach-dark)]">
                      {new URL(project.websiteUrl).hostname}
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-200">Whitepaper</span>
                    <a href={project.whitePaperUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 dark:text-[color:var(--color-peach)] dark:hover:text-[color:var(--color-peach-dark)]">
                      View PDF
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-200">GitHub</span>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 dark:text-[color:var(--color-peach)] dark:hover:text-[color:var(--color-peach-dark)]">
                      {new URL(project.githubUrl).pathname.substring(1)}
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-200">Twitter</span>
                    <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 dark:text-[color:var(--color-peach)] dark:hover:text-[color:var(--color-peach-dark)]">
                      @{new URL(project.twitterUrl).pathname.substring(1)}
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-200">Discord</span>
                    <a href={project.discordUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 dark:text-[color:var(--color-peach)] dark:hover:text-[color:var(--color-peach-dark)]">
                      discord.gg/{new URL(project.discordUrl).pathname.split('/').pop()}
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
