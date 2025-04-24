import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowRightCircle, ExternalLink } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#101010] overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-10 md:pt-16 pb-20 md:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Gradient Animation Elements */}
          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-[#FBBA80] opacity-20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-[30%] right-[-200px] w-[400px] h-[400px] bg-[#91A0A1] opacity-10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Tusker_Grotesk'] font-bold uppercase tracking-wider mb-6 text-white">
              q/<span className="text-[#FBBA80]">acc</span>
            </h1>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-['Tusker_Grotesk'] uppercase tracking-wide mb-6 text-white leading-tight">
              Quadratic <span className="text-[#FBBA80]">Accelerator</span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-10 text-[#F6F6F6] font-['IBM_Plex_Mono'] max-w-3xl mx-auto">
              A community-driven accelerator platform for supporting and scaling web3 projects.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-[#FBBA80] hover:bg-[#FBBA80]/90 text-[#101010] py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
              >
                <Link href="/projects">
                  Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                asChild
                className="border-[#FBBA80] text-[#FBBA80] hover:bg-[#FBBA80]/10 py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
              >
                <Link href="/auth">
                  Join As Backer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-[#151515]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-['Tusker_Grotesk'] uppercase tracking-wide mb-12 text-white text-center">
            How <span className="text-[#FBBA80]">q/acc</span> Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-[#1D1D1D] p-8 rounded-lg border border-[#333] hover:border-[#FBBA80] transition-all duration-300">
              <div className="text-[#FBBA80] font-['Tusker_Grotesk'] text-6xl mb-4">01</div>
              <h3 className="text-xl font-['Tusker_Grotesk'] uppercase mb-4 text-white">Back Projects</h3>
              <p className="text-[#F6F6F6] font-['IBM_Plex_Mono']">
                Use your wallet funds to back promising web3 projects during active funding rounds.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-[#1D1D1D] p-8 rounded-lg border border-[#333] hover:border-[#FBBA80] transition-all duration-300">
              <div className="text-[#FBBA80] font-['Tusker_Grotesk'] text-6xl mb-4">02</div>
              <h3 className="text-xl font-['Tusker_Grotesk'] uppercase mb-4 text-white">Earn Points</h3>
              <p className="text-[#F6F6F6] font-['IBM_Plex_Mono']">
                Receive points for every backed project and climb up the leaderboard.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-[#1D1D1D] p-8 rounded-lg border border-[#333] hover:border-[#FBBA80] transition-all duration-300">
              <div className="text-[#FBBA80] font-['Tusker_Grotesk'] text-6xl mb-4">03</div>
              <h3 className="text-xl font-['Tusker_Grotesk'] uppercase mb-4 text-white">Unlock Tokens</h3>
              <p className="text-[#F6F6F6] font-['IBM_Plex_Mono']">
                Track your token holdings and claim them once the vesting period expires.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              asChild
              variant="outline"
              className="border-[#FBBA80] text-[#FBBA80] hover:bg-[#FBBA80]/10 py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
            >
              <Link href="/active-rounds">
                View Active Rounds <ArrowRightCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Projects Section */}
      <section className="py-16 md:py-24 bg-[#101010]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-['Tusker_Grotesk'] uppercase tracking-wide mb-2 text-white text-center">
            Featured <span className="text-[#FBBA80]">Projects</span>
          </h2>
          
          <p className="text-center text-[#F6F6F6] font-['IBM_Plex_Mono'] mb-12 max-w-3xl mx-auto">
            Discover innovative web3 projects carefully selected for the q/acc program.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Project Card Placeholders - These will be replaced with actual data */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1D1D1D] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group border border-[#333] hover:border-[#FBBA80]">
                <div className="h-40 bg-gradient-to-r from-[#1D1D1D] to-[#252525] flex items-center justify-center">
                  <div className="bg-[#FBBA80] w-20 h-20 rounded-full flex items-center justify-center">
                    <span className="text-[#101010] font-['IBM_Plex_Mono'] font-bold text-xl">P{i}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-['Tusker_Grotesk'] uppercase mb-2 text-white">Project {i}</h3>
                  <p className="text-[#A0A0A0] text-sm font-['IBM_Plex_Mono'] mb-4">
                    {i === 1 ? 'Artificial Intelligence' : i === 2 ? 'DeFi Protocol' : 'NFT Marketplace'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#FBBA80] font-['IBM_Plex_Mono']">${i === 1 ? '115.46' : i === 2 ? '0.92' : '0.65'}</span>
                    <Button 
                      asChild
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-[#FBBA80] group-hover:text-[#FBBA80] hover:bg-transparent p-0"
                    >
                      <Link href={`/projects/${i}`}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              asChild
              className="bg-[#FBBA80] hover:bg-[#FBBA80]/90 text-[#101010] py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
            >
              <Link href="/projects">
                Browse All Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 md:py-24 bg-[#151515]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-['Tusker_Grotesk'] uppercase tracking-wide mb-6 text-white">
                About <span className="text-[#FBBA80]">q/acc</span>
              </h2>
              
              <p className="text-[#F6F6F6] font-['IBM_Plex_Mono'] mb-6">
                The Quadratic Accelerator (q/acc) is a community-driven platform designed to support and scale promising web3 projects. 
                We use a unique quadratic funding model to ensure fair resource allocation based on community interest.
              </p>
              
              <p className="text-[#F6F6F6] font-['IBM_Plex_Mono'] mb-6">
                Our mission is to empower the next generation of decentralized applications and foster innovation in the web3 ecosystem.
              </p>
              
              <Button 
                asChild
                variant="outline"
                className="border-[#FBBA80] text-[#FBBA80] hover:bg-[#FBBA80]/10 py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
              >
                <a href="https://qacc.giveth.io" target="_blank" rel="noopener noreferrer">
                  Learn More <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            
            <div className="bg-[#1D1D1D] p-8 rounded-lg border border-[#333]">
              <h3 className="text-2xl font-['Tusker_Grotesk'] uppercase mb-6 text-[#FBBA80]">Key Benefits</h3>
              
              <ul className="space-y-4 font-['IBM_Plex_Mono']">
                <li className="flex items-start">
                  <ArrowRightCircle className="text-[#FBBA80] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#F6F6F6]">Early access to promising web3 projects</span>
                </li>
                <li className="flex items-start">
                  <ArrowRightCircle className="text-[#FBBA80] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#F6F6F6]">Reward system that incentivizes community backing</span>
                </li>
                <li className="flex items-start">
                  <ArrowRightCircle className="text-[#FBBA80] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#F6F6F6]">Transparent funding and token distribution</span>
                </li>
                <li className="flex items-start">
                  <ArrowRightCircle className="text-[#FBBA80] h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#F6F6F6]">Portfolio tracking and vesting management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-[#101010] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#FBBA80] opacity-20 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[20%] w-[250px] h-[250px] bg-[#91A0A1] opacity-10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-['Tusker_Grotesk'] uppercase tracking-wide mb-8 text-white">
              Ready to <span className="text-[#FBBA80]">Join</span> The Future Of <span className="text-[#FBBA80]">Tokenization</span>?
            </h2>
            
            <p className="text-xl mb-10 text-[#F6F6F6] font-['IBM_Plex_Mono']">
              Join q/acc today and become part of a vibrant community supporting innovative web3 projects.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-[#FBBA80] hover:bg-[#FBBA80]/90 text-[#101010] py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
              >
                <Link href="/auth">
                  Create Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="border-[#FBBA80] text-[#FBBA80] hover:bg-[#FBBA80]/10 py-6 px-8 rounded-md text-lg font-['IBM_Plex_Mono'] font-medium"
              >
                <Link href="/projects">
                  Browse Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}