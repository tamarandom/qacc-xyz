import React from 'react';
import { Package, Layers, Clock } from 'lucide-react';

/**
 * Web3PacksAboutContent Component
 * 
 * Displays the About section content for the Web3 Packs project.
 * This is a custom component specifically for the Web3 Packs project
 * following QACC brand guidelines.
 */
export function Web3PacksAboutContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        Web3 Packs is an innovative platform developed by Charged Particles, designed to simplify 
        and enhance user engagement with decentralized finance (DeFi). It offers curated bundles 
        of digital assets—including ERC-20 tokens, NFTs, and liquidity positions—nested within NFTs. 
        This structure allows users to acquire a diverse portfolio in a single transaction, 
        streamlining the process of entering various DeFi ecosystems.
      </p>

      <h3 className="text-xl font-medium mt-8 font-tusker">KEY FEATURES</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Package className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Curated Bundles</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pre-selected combinations of tokens and assets facilitate instant portfolio 
              diversification without the need for extensive research.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Layers className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Simplified Transactions</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Users can acquire multiple assets through a single purchase, reducing the 
              complexity typically associated with DeFi participation.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Clock className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Accessibility</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              With entry points as low as $5, Web3 Packs aims to make DeFi accessible 
              to a broad audience.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/MCEjjT6jPC0" 
              title="Web3 Packs Overview"
              className="w-full h-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Web3PacksTeamContent Component
 * 
 * Displays the Team content for the Web3 Packs project.
 * This is a custom component specifically for the Web3 Packs project
 * following QACC brand guidelines.
 */
export function Web3PacksTeamContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        Web3 Packs is a product of Charged Particles, with a team of experienced professionals 
        dedicated to simplifying and enhancing DeFi engagement for users.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2">Rob Secord</h4>
          <p className="text-sm font-medium text-[color:var(--color-peach)]">Founder, Visionary, and Technical Lead</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            With over 20 years of engineering experience, including more than 5 years in fintech, 
            Rob brings extensive technical expertise to the Web3 Packs platform.
          </p>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2">Ben Lakoff, CFA</h4>
          <p className="text-sm font-medium text-[color:var(--color-peach)]">Co-Founder and Business Lead</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            An experienced founder and finance professional who has raised over $50 million 
            for early-stage startups, Ben drives the business strategy for Web3 Packs.
          </p>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2">Mango</h4>
          <p className="text-sm font-medium text-[color:var(--color-peach)]">Team Member</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            More information coming soon about Mango's role and contributions to the Web3 Packs platform.
          </p>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2">Steve</h4>
          <p className="text-sm font-medium text-[color:var(--color-peach)]">Team Member</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            More information coming soon about Steve's role and contributions to the Web3 Packs platform.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Web3PacksRoadmapContent Component
 * 
 * Displays the Roadmap content for the Web3 Packs project.
 * This is a custom component specifically for the Web3 Packs project
 * following QACC brand guidelines.
 */
export function Web3PacksRoadmapContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        While specific future milestones for Web3 Packs are not detailed in the available sources, 
        Charged Particles has a history of continuous innovation. The introduction of Web3 Packs 
        represents their commitment to simplifying DeFi engagement. Users are encouraged to follow 
        Charged Particles' official channels for updates on upcoming features and developments.
      </p>

      <div className="mt-8 space-y-6">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Current Focus</h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            <li>Expanding the range of curated asset bundles</li>
            <li>Enhancing user experience and interface simplicity</li>
            <li>Building partnerships with DeFi protocols and projects</li>
          </ul>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Future Directions</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Charged Particles continues to innovate in the DeFi space. Stay connected with their
            official channels for announcements regarding upcoming features, partnerships, and
            developments for the Web3 Packs platform.
          </p>
          <div className="mt-4 flex space-x-4">
            <a 
              href="https://twitter.com/ChargedParticles" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[color:var(--color-peach)] hover:text-[color:var(--color-peach-dark)] font-medium text-sm"
            >
              Follow on Twitter
            </a>
            <a 
              href="https://medium.com/charged-particles" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[color:var(--color-peach)] hover:text-[color:var(--color-peach-dark)] font-medium text-sm"
            >
              Medium Blog
            </a>
            <a 
              href="https://discord.gg/charged-particles" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[color:var(--color-peach)] hover:text-[color:var(--color-peach-dark)] font-medium text-sm"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}