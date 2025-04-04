import React from 'react';
import { Wallet, Users, Globe, Scroll, Tag, Terminal } from 'lucide-react';

/**
 * CitizenWalletAboutContent Component
 * 
 * Displays the About section content for the Citizen Wallet project.
 * This is a custom component specifically for the Citizen Wallet project
 * following QACC brand guidelines.
 */
export function CitizenWalletAboutContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        Citizen Wallet is an open-source platform designed to empower communities by facilitating the creation 
        and management of local currencies. The platform emphasizes a user-friendly experience, ensuring smooth 
        onboarding and accessibility for all community members, including those without smartphones or a 
        preference against installing additional applications. By providing tools to establish community-specific 
        tokens, Citizen Wallet aims to foster resilient and regenerative local economies.
      </p>

      <h3 className="text-xl font-medium mt-8 font-tusker">KEY FEATURES</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Wallet className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Simple Transactions</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Users can send and receive ERC20 tokens on networks like Polygon, Optimism, Celo, or Base without the 
              need for sign-ups, setups, or gas fees.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Tag className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Voucher System</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For individuals without wallets, the platform allows the creation of vouchers that can be 
              scanned to generate a web wallet, enabling seamless token redemption without installations or 
              personal data requirements.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Globe className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Web Burner Wallet</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A temporary wallet generated in the browser, stored within the URL hash, ensuring privacy 
              and ease of use for short-term engagements.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Terminal className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">NFC Wallets</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Support for Near Field Communication (NFC) wallets, providing a hardware-free interface for transactions.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Users className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Point of Sale (POS) for Merchants</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Merchants can effortlessly accept payments through cards, vouchers, and NFC badges 
              at physical locations.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Scroll className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Multicurrency Support</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Users can manage multiple community currencies within a single application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CitizenWalletTeamContent Component
 * 
 * Displays the Team content for the Citizen Wallet project.
 * This is a custom component specifically for the Citizen Wallet project
 * following QACC brand guidelines.
 */
export function CitizenWalletTeamContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        <div className="bg-white dark:bg-[color:var(--color-black)]/20 p-5 rounded-lg border border-gray-100 dark:border-[color:var(--color-black)]/30">
          <div className="w-20 h-20 rounded-full bg-[color:var(--color-peach)]/10 flex items-center justify-center mb-4 mx-auto">
            <span className="text-[color:var(--color-peach)] text-xl font-bold">J</span>
          </div>
          <h4 className="text-lg font-medium text-center mb-2">Jonas</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">More coming soon</p>
        </div>
        
        <div className="bg-white dark:bg-[color:var(--color-black)]/20 p-5 rounded-lg border border-gray-100 dark:border-[color:var(--color-black)]/30">
          <div className="w-20 h-20 rounded-full bg-[color:var(--color-peach)]/10 flex items-center justify-center mb-4 mx-auto">
            <span className="text-[color:var(--color-peach)] text-xl font-bold">K</span>
          </div>
          <h4 className="text-lg font-medium text-center mb-2">Kevin</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">More coming soon</p>
        </div>
      </div>
    </div>
  );
}

/**
 * CitizenWalletRoadmapContent Component
 * 
 * Displays the Roadmap content for the Citizen Wallet project.
 * This is a custom component specifically for the Citizen Wallet project
 * following QACC brand guidelines.
 */
export function CitizenWalletRoadmapContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        Citizen Wallet has outlined several features in various stages of development:
      </p>

      <div className="mt-6 mb-8">
        <h4 className="text-lg font-medium mb-4 text-[color:var(--color-peach)]">Live Features</h4>
        <ul className="space-y-2 list-disc pl-5 text-sm">
          <li>Simple Transactions</li>
          <li>Voucher System</li>
          <li>Web Burner Wallet</li>
          <li>NFC Wallets</li>
          <li>POS for Merchants</li>
          <li>Multicurrency Support</li>
        </ul>
      </div>

      <p className="text-base">
        For the most current information on upcoming features and developments, users are encouraged to visit 
        the official website or join the community channels.
      </p>

      <h3 className="text-xl font-medium mt-8 font-tusker">COMMUNITY ENGAGEMENT</h3>
      <p className="text-base">
        Citizen Wallet actively fosters community involvement through various platforms:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-base font-medium mb-2">Discord</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Engage in discussions and stay updated on the latest developments.
          </p>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-base font-medium mb-2">Telegram</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Join the conversation and connect with other community members.
          </p>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-base font-medium mb-2">GitHub</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contribute to the open-source codebase and collaborate on improvements.
          </p>
        </div>
      </div>

      <p className="text-base mt-6">
        By offering these tools and fostering an inclusive environment, Citizen Wallet aims to revolutionize 
        the way communities interact with and benefit from localized currencies.
      </p>
    </div>
  );
}