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
import { ArrowLeft, Rocket, Calendar, Timer } from "lucide-react";
import { PriceChart } from "@/components/projects/price-chart";
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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-[color:var(--color-black)] rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between border-b border-gray-200 dark:border-[color:var(--color-black-200)] bg-white dark:bg-[color:var(--color-black)]">
          <div className="flex items-center">
            <ProjectAvatar
              name={project.name}
              bgColor={project.avatarBg}
              textColor={project.avatarColor}
              initials={project.avatarText || project.name.substring(0, 2)}
              size="lg"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 mr-2 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/20 dark:border-green-800">
                  Accelerator Funded
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:border-blue-800">
                  {project.category}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-[color:var(--color-peach)] hover:bg-[color:var(--color-peach-dark)] text-black">
              Buy {project.tokenSymbol}
            </Button>
            {!project.isNew && project.price > 0 && (
              <a 
                href="https://quickswap.exchange/#/swap?currency0=ETH&currency1=0xc530b75465ce3c6286e718110a7b2e2b64bdc860" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#4A89DC] hover:bg-[#3A79CC] text-white font-medium transition-colors"
              >
                <img src={quickswapLogo} alt="DEX" className="h-5 w-5 rounded-full" />
                <span>Buy on DEX</span>
              </a>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 dark:bg-[color:var(--color-black)]">
          <div className="bg-gray-50 dark:bg-[color:var(--color-black)] rounded-lg p-4 md:col-span-2">
            {project.isNew ? (
              <div className="mb-6">
                <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-center flex-col sm:flex-row gap-6 sm:gap-12">
                      <div className="flex items-center">
                        <Rocket className="h-10 w-10 text-[color:var(--color-peach)] mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Launch Status</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">DEX listing after this round</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-10 w-10 text-[color:var(--color-peach)] mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Token Supply</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatNumber(project.totalSupply)} {project.tokenSymbol}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Timer className="h-10 w-10 text-[color:var(--color-peach)] mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Standard</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{project.tokenStandard}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Price</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(project.price)}
                        </p>
                        <div className="flex items-center mt-1">
                          <PercentageChange value={project.change24h} />
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(24h)</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(project.marketCap)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Fully Diluted: {formatCurrency(project.totalSupply * project.price)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume (24h)</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(project.volume24h)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {((project.volume24h / project.marketCap) * 100).toFixed(1)}% of market cap
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Circulating Supply</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white font-mono">
                          {formatNumber(project.circulatingSupply)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Total: {formatNumber(project.totalSupply)} {project.tokenSymbol}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <PriceChart projectId={parseInt(id || "0")} />
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-6">
              <Tabs defaultValue="overview">
                {/* Wrap TabsList in a div to enable horizontal scrolling on mobile */}
                <div className="overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-[color:var(--color-black-200)] dark:bg-[color:var(--color-black)] bg-white">
                  <TabsList className="w-max min-w-full flex justify-start pb-0 bg-white dark:bg-[color:var(--color-black)]">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm mr-2 sm:mr-4 md:mr-8 whitespace-nowrap dark:text-gray-300"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tokenomics" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm mr-2 sm:mr-4 md:mr-8 whitespace-nowrap dark:text-gray-300"
                    >
                      Tokenomics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="team" 
                      className="data-[state=active]:border-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] dark:data-[state=active]:text-white data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm mr-2 sm:mr-4 md:mr-8 whitespace-nowrap dark:text-gray-300"
                    >
                      Team
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
                <CardTitle className="text-lg dark:text-white">TOKEN DETAILS</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">Token Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{project.tokenName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">Symbol</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{project.tokenSymbol}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">Blockchain</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.blockchain}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">Token Standard</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.tokenStandard}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">Total Supply</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{formatNumber(project.totalSupply)} {project.tokenSymbol}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">Contract Address</dt>
                    <dd className="mt-1 text-sm truncate font-mono">
                      <a 
                        href="https://polygonscan.com/token/0xc530b75465ce3c6286e718110a7b2e2b64bdc860" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 dark:text-[color:var(--color-peach)] dark:hover:text-[color:var(--color-peach-dark)]"
                      >
                        {project.contractAddress}
                      </a>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card className="mb-4 dark:bg-[color:var(--color-black)] dark:border-[color:var(--color-black-200)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">STAKING STATISTICS</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  {project.technicalDetails?.map((detail) => (
                    <div key={detail.id}>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">{detail.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
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
