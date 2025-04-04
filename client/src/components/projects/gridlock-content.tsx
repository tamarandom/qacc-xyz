import React from 'react';
import { Shield, Key, Clock, UserCheck } from 'lucide-react';

/**
 * GridlockAboutContent Component
 * 
 * Displays the About section content for the Gridlock project.
 * This is a custom component specifically for the Gridlock project
 * following QACC brand guidelines.
 */
export function GridlockAboutContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        Gridlock is a cutting-edge, open-source cryptocurrency wallet designed to provide unparalleled security 
        and ease of use for managing digital assets. By employing advanced Multi-Party Computation (MPC) 
        technology, Gridlock eliminates single points of failure by distributing cryptographic key shares 
        across multiple devices. This approach ensures that no single device ever possesses the complete 
        private key, significantly enhancing security against potential breaches.
      </p>

      <h3 className="text-xl font-medium mt-8 font-tusker">KEY FEATURES</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Shield className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Unbreakable Security</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gridlock's distributed storage mechanism ensures that your crypto remains safe, 
              even if one of your devices is compromised.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Key className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Effortless Recovery</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              In case of device loss or password forgetfulness, Gridlock's social recovery feature allows 
              for quick and secure account restoration without the need for seed phrases.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <UserCheck className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">User Control</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              As a non-custodial wallet, only you have access to your funds, ensuring true ownership 
              and control over your digital assets.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Clock className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Simple Setup</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gridlock offers an intuitive setup process, making it accessible for users regardless 
              of their technical expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * GridlockRoadmapContent Component
 * 
 * Displays the Roadmap content for the Gridlock project.
 * This is a custom component specifically for the Gridlock project
 * following QACC brand guidelines.
 */
export function GridlockRoadmapContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        Gridlock's roadmap outlines their objectives and future direction, encompassing several ongoing 
        ideas and concepts for blockchain development. Gridlock is committed to continuous improvement 
        and innovation in the cryptocurrency security space, aiming to provide users with a robust and 
        user-friendly platform for managing their digital assets.
      </p>

      <div className="mt-8 space-y-6">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Q2 2025: Enhanced Security Features</h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            <li>Implementation of advanced biometric authentication options</li>
            <li>Integration with hardware security modules for enterprise users</li>
            <li>Security audit by independent third-party specialists</li>
          </ul>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Q3 2025: Cross-Chain Expansion</h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            <li>Support for additional blockchain ecosystems</li>
            <li>Implementation of cross-chain asset management features</li>
            <li>Enhanced DeFi integration capabilities</li>
          </ul>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Q4 2025: Enterprise Solutions</h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            <li>Development of institutional-grade wallet solutions</li>
            <li>Multi-signature governance features for organizations</li>
            <li>Advanced analytics and reporting capabilities</li>
          </ul>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">2026: Mobile Experience Enhancement</h4>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            <li>Complete UI/UX overhaul for improved mobile experience</li>
            <li>Implementation of integrated fiat on/off ramps</li>
            <li>Development of Gridlock SDK for third-party integrations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}