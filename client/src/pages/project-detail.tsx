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
import { ArrowLeft } from "lucide-react";
import { Project, ProjectWithDetails } from "@shared/schema";

export default function ProjectDetail() {
  const { id } = useParams();
  
  const { data: project, isLoading, isError } = useQuery<ProjectWithDetails>({
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
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <ProjectAvatar
              name={project.name}
              tokenSymbol={project.tokenSymbol}
              bgColor={project.avatarBg}
              textColor={project.avatarColor}
              initials={project.avatarText || project.name.substring(0, 2)}
              size="lg"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 mr-2">
                  Accelerator Funded
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                  {project.category}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <Button>
              Buy {project.tokenSymbol}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-500">Token Price</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 font-mono">
                      {formatCurrency(project.price)}
                    </p>
                    <div className="flex items-center mt-1">
                      <PercentageChange value={project.change24h} />
                      <span className="text-xs text-gray-500 ml-2">(24h)</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-500">Market Cap</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 font-mono">
                      {formatCurrency(project.marketCap)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        Fully Diluted: {formatCurrency(project.totalSupply * project.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-500">Volume (24h)</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 font-mono">
                      {formatCurrency(project.volume24h)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {((project.volume24h / project.marketCap) * 100).toFixed(1)}% of market cap
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-gray-500">Circulating Supply</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 font-mono">
                      {formatNumber(project.circulatingSupply)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        Total: {formatNumber(project.totalSupply)} {project.tokenSymbol}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mb-6">
              <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start border-b border-gray-200 pb-0">
                  <TabsTrigger value="overview" className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-6 py-3 text-sm mr-8">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="tokenomics" className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-6 py-3 text-sm mr-8">
                    Tokenomics
                  </TabsTrigger>
                  <TabsTrigger value="team" className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-6 py-3 text-sm mr-8">
                    Team
                  </TabsTrigger>
                  <TabsTrigger value="roadmap" className="data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-6 py-3 text-sm">
                    Roadmap
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About {project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  <h4 className="text-md font-medium text-gray-900 mb-2 mt-4">Key Features</h4>
                  <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
                    {project.features?.map((feature) => (
                      <li key={feature.id}>{feature.feature}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-md font-medium text-gray-900 mb-2 mt-4">Technology</h4>
                  <p className="text-gray-600">
                    {project.name}'s core infrastructure is built on a modified Byzantine Fault Tolerance consensus mechanism 
                    that allows for secure distribution of validator duties. Our smart contracts are audited by leading security 
                    firms, and we've implemented a comprehensive risk management framework to protect user funds.
                  </p>
                </TabsContent>
                
                <TabsContent value="tokenomics">
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Token Distribution</h3>
                    <p className="text-gray-600">
                      Information about token distribution will be available soon.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="team">
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Team Members</h3>
                    <p className="text-gray-600">
                      Information about the team will be available soon.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="roadmap">
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Development Roadmap</h3>
                    <p className="text-gray-600">
                      Information about the project roadmap will be available soon.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div>
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Token Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Token Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{project.tokenName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Symbol</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{project.tokenSymbol}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Blockchain</dt>
                    <dd className="mt-1 text-sm text-gray-900">{project.blockchain}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Token Standard</dt>
                    <dd className="mt-1 text-sm text-gray-900">{project.tokenStandard}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Supply</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{formatNumber(project.totalSupply)} {project.tokenSymbol}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Token Contract</dt>
                    <dd className="mt-1 text-sm text-gray-900 truncate font-mono">{project.contractAddress}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Staking Statistics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  {project.technicalDetails?.map((detail) => (
                    <div key={detail.id}>
                      <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-semibold">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Links & Resources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="divide-y divide-gray-200">
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Website</span>
                    <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800">
                      {new URL(project.websiteUrl).hostname}
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Whitepaper</span>
                    <a href={project.whitePaperUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800">
                      View PDF
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">GitHub</span>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800">
                      {new URL(project.githubUrl).pathname.substring(1)}
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Twitter</span>
                    <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800">
                      @{new URL(project.twitterUrl).pathname.substring(1)}
                    </a>
                  </li>
                  <li className="py-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Discord</span>
                    <a href={project.discordUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800">
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
