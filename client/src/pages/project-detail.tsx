import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ProjectTabs } from "@/components/projects/project-tabs";
import { X23AboutContent, X23TeamContent, X23RoadmapContent } from "@/components/projects/x23-content";
import { GridlockAboutContent, GridlockRoadmapContent } from "@/components/projects/gridlock-content";
import { Web3PacksAboutContent, Web3PacksTeamContent, Web3PacksRoadmapContent } from "@/components/projects/web3packs-content";
import { HowToDAOAboutContent, HowToDAOTeamContent, HowToDAORoadmapContent } from "@/components/projects/howtodao-content";
import { ToDaMoonAboutContent, ToDaMoonTeamContent, ToDaMoonRoadmapContent } from "@/components/projects/todamoon-content";
import { CitizenWalletAboutContent, CitizenWalletTeamContent, CitizenWalletRoadmapContent } from "@/components/projects/citizenwallet-content";
import quickswapLogo from "@assets/quickswap-logo.jpg";

import { Project, ProjectFeature, ProjectTechnicalDetail, ProjectStatus } from "@shared/schema";

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
      
      <div className="bg-white dark:bg-[color:var(--color-black)] rounded-lg shadow-sm overflow-hidden border-b-0">
        <div className="px-4 py-5 sm:px-6 bg-white dark:bg-[color:var(--color-black)]">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
            {/* Left Side - Project Info */}
            <div className="flex items-start">
              {project.status === 'pre-launch' && (
                <Badge className="mr-4 bg-[#FBBA80] text-[#101010] hover:bg-[#FBBA80] dark:bg-[#FBBA80] text-sm py-1 px-3 self-center">
                  NEW
                </Badge>
              )}
              {project.status === 'pre-abc' && (
                <Badge className="mr-4 bg-[#6F4FE8] text-white hover:bg-[#6F4FE8] dark:bg-[#6F4FE8] text-sm py-1 px-3 self-center">
                  pre-ABC
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
                    {/* Farcaster Link */}
                    <a 
                      href="https://warpcast.com/x23" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-[color:var(--color-peach)]"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.991 13.963c1.73 0 3.417-1.496 3.417-5.238 0-1.086-.678-1.846-1.67-1.846-1.166 0-2.209 1.068-2.209 3.18 0 .677.339 1.139.678 1.139.205 0 .361-.169.361-.508 0-.339-.156-.474-.156-.593 0-.101.055-.152.165-.152.272 0 .509.254.509.982 0 .966-.58 1.564-1.327 1.564-.797 0-1.395-.602-1.395-1.631 0-1.876 1.099-3.385 3.062-3.385 1.462 0 2.48.864 2.48 2.447 0 4.251-1.999 6.201-3.774 6.201-.984 0-1.564-.356-1.564-.889 0-.186.085-.356.339-.356.424 0 .593.542.662.847.101.068.203.102.339.102.364 0 .678-.288.678-.763 0-.593-.508-.966-1.208-.966-.339 0-.644.119-.948.356l-.17-.288c.304-.339.848-.932.848-1.766 0-.932-.526-1.547-1.369-1.547-.695 0-1.293.424-1.293 1.036 0 .373.203.66.932.796.712.136 1.259.322 1.259.898 0 .441-.237.694-.509.694-.169 0-.322-.068-.44-.186-.119-.136-.186-.305-.169-.458 0-.203-.136-.339-.322-.339-.169 0-.288.152-.288.356 0 .52.561.982 1.512.982z" fillRule="evenodd" clipRule="evenodd" />
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
              {(project.status === 'pre-launch' || project.status === 'pre-abc') ? (
                // For new projects: more compact price display and button
                <>
                  {/* Stats section */}
                  <div className="text-right mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                    <div className="flex items-center justify-end">
                      <span className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {formatCurrency(project.price)}
                      </span>
                      <PercentageChange value={project.change24h} className="ml-2" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(24h)</span>
                    </div>
                  </div>
                  
                  {/* Buy button */}
                  <div className="mt-3">
                    <button className="px-6 py-1.5 text-sm font-medium bg-[color:var(--color-peach)] text-black hover:bg-[color:var(--color-peach-dark)] rounded-md transition-colors shadow-sm">
                      Buy {project.tokenSymbol}
                    </button>
                  </div>
                </>
              ) : (
                // For launched projects: Compact layout with buttons below
                <>
                  {/* Stats row */}
                  <div className="flex justify-end items-center space-x-8 mb-3">
                    {/* Market Cap - Most important data */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Market Cap</p>
                      <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(project.marketCap, false, true, true)}
                      </p>
                    </div>
                    
                    {/* Price with 24h change */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                      <div className="flex items-center">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(project.price)}
                        </span>
                        <PercentageChange value={project.change24h} className="ml-1 text-xs" />
                      </div>
                    </div>
                    
                    {/* 24h Volume */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">24h Volume</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {formatCurrency(project.volume24h, false, false, true)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons - Eye-catching */}
                  <div className="flex items-center space-x-3">
                    <button className="px-5 py-1.5 text-sm font-medium bg-[color:var(--color-peach)] text-black hover:bg-[color:var(--color-peach-dark)] rounded-md transition-colors shadow-sm font-bold">
                      Buy
                    </button>
                    <a 
                      href={project.swapUrl || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-1.5 text-sm font-medium bg-[#4A89DC] text-white hover:bg-[#3A79CC] rounded-md transition-colors shadow-md inline-flex items-center gap-1 border border-[#3A79CC]/30"
                    >
                      <img src={quickswapLogo} alt="DEX" className="h-4 w-4 rounded-full" />
                      <span className="font-bold">Swap</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Chart for all launched projects */}
        {project.status === 'launched' && (
          <div className="px-4 py-4 bg-white dark:bg-[color:var(--color-black)] border-t-0">
            <div className="mx-auto max-w-5xl overflow-hidden">
              <GeckoTerminalChart projectId={project.id} tokenSymbol={project.tokenSymbol} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-[color:var(--color-black)]">
          {/* Full width for new projects, 3/4 width for established projects */}
          <div className={`bg-white dark:bg-[color:var(--color-black)] rounded-lg p-4 ${(project.status === 'pre-launch' || project.status === 'pre-abc') ? 'md:col-span-4' : 'md:col-span-3'}`}>
            {/* Project Info Tabs */}
            {project.id === 1 ? (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
                aboutContent={<X23AboutContent />}
                teamContent={<X23TeamContent />}
                roadmapContent={<X23RoadmapContent />}
              />
            ) : project.id === 2 ? (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
                aboutContent={<CitizenWalletAboutContent />}
                teamContent={<CitizenWalletTeamContent />}
                roadmapContent={<CitizenWalletRoadmapContent />}
              />
            ) : project.id === 5 ? (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
                aboutContent={<GridlockAboutContent />}
                roadmapContent={<GridlockRoadmapContent />}
              />
            ) : project.id === 6 ? (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
                aboutContent={<ToDaMoonAboutContent />}
                teamContent={<ToDaMoonTeamContent />}
                roadmapContent={<ToDaMoonRoadmapContent />}
              />
            ) : project.id === 7 ? (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
                aboutContent={<HowToDAOAboutContent />}
                teamContent={<HowToDAOTeamContent />}
                roadmapContent={<HowToDAORoadmapContent />}
              />
            ) : project.id === 8 ? (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
                aboutContent={<Web3PacksAboutContent />}
                teamContent={<Web3PacksTeamContent />}
                roadmapContent={<Web3PacksRoadmapContent />}
              />
            ) : (
              <ProjectTabs 
                projectId={project.id}
                projectName={project.name}
              />
            )}
          </div>
          
          {/* Only show token holders for launched projects */}
          {project.status === 'launched' && (
            <div>
              <Card className="dark:bg-[color:var(--color-black)] border-0 shadow-none">
                <CardHeader className="pb-2 pl-0 pr-0">
                  <CardTitle className="text-xs sm:text-sm text-white font-medium text-right">TOP 10 HOLDERS</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-0">
                  <TokenHolders projectId={parseInt(id || "0")} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
