import React from 'react';
import { Book, Puzzle, Users } from 'lucide-react';

/**
 * HowToDAOAboutContent Component
 * 
 * Displays the About section content for the How To DAO project.
 * This is a custom component specifically for the How To DAO project
 * following QACC brand guidelines.
 */
export function HowToDAOAboutContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        How To DAO is a comprehensive initiative aimed at educating individuals and organizations 
        about Decentralized Autonomous Organizations (DAOs). The project offers a variety of 
        resources, including a forthcoming book, interactive courses, and quests designed to 
        provide practical insights into the creation, management, and participation in DAOs. 
        By demystifying the complexities of decentralized governance, How To DAO seeks to empower 
        a diverse audience to engage effectively with the Web3 ecosystem.
      </p>

      <h3 className="text-xl font-medium mt-8 font-tusker">KEY RESOURCES</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Book className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Comprehensive Book</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The "How To DAO" book, published by Penguin Random House, provides a complete guide 
              to understanding DAOs with expert insights.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Puzzle className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Interactive Courses</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Courses and quests designed to help individuals understand DAOs, acquire essential 
              skills, and become active contributors.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="mt-1 bg-[color:var(--color-peach)]/10 p-2 rounded-lg mr-3">
            <Users className="h-5 w-5 text-[color:var(--color-peach)]" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-1">Community Engagement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fostering a well-informed and engaged community, equipped to navigate and contribute 
              to the evolving landscape of decentralized organizations.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
        <h4 className="text-lg font-medium mb-3">Join the Movement</h4>
        <p className="text-sm">
          Whether you're a Web3 native looking to deepen your knowledge or someone who's new to the 
          world of decentralized organizations, How To DAO offers resources tailored to your level of 
          experience. By helping participants understand the principles, practices, and potential of 
          DAOs, the project aims to accelerate the adoption of decentralized governance models.
        </p>
      </div>
    </div>
  );
}

/**
 * HowToDAOTeamContent Component
 * 
 * Displays the Team content for the How To DAO project.
 * This is a custom component specifically for the How To DAO project
 * following QACC brand guidelines.
 */
export function HowToDAOTeamContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        The How To DAO project is led by industry veterans with extensive experience in the Web3 ecosystem, 
        bringing together their expertise to demystify the world of Decentralized Autonomous Organizations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2">Kevin Owocki</h4>
          <p className="text-sm font-medium text-[color:var(--color-peach)]">Founder of Gitcoin</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Kevin is a prominent figure in the blockchain space, known for his dedication to open-source 
            development and the advancement of decentralized technologies. His experience with Gitcoin 
            has provided him with unique insights into the functionalities and potential of DAOs.
          </p>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2">Jan (Puncar) Brezina</h4>
          <p className="text-sm font-medium text-[color:var(--color-peach)]">Web3 Ecosystem Contributor</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            An active contributor to the Web3 ecosystem, Puncar is involved with initiatives such as 
            WorkoutDAO and Bankless Consulting, focusing on the development of internet-native 
            organizations. His hands-on experience offers practical perspectives on DAO operations.
          </p>
        </div>
      </div>
      
      <div className="mt-6 bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
        <h4 className="text-lg font-medium mb-3">Expert Contributors</h4>
        <p className="text-sm">
          In addition to the core team, How To DAO features insights and contributions from various 
          experts across the Web3 space, bringing diverse perspectives and specialized knowledge 
          to the project's educational content.
        </p>
      </div>
    </div>
  );
}

/**
 * HowToDAORoadmapContent Component
 * 
 * Displays the Roadmap content for the How To DAO project.
 * This is a custom component specifically for the How To DAO project
 * following QACC brand guidelines.
 */
export function HowToDAORoadmapContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="text-base">
        How To DAO has outlined several key initiatives aimed at expanding knowledge and 
        participation in the decentralized governance space. Their strategic roadmap 
        focuses on education, community building, and collaborative growth.
      </p>

      <div className="mt-8 space-y-6">
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Book Publication (January 2025)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            The "How To DAO" book, published by Penguin Random House, is scheduled for release in January 2025. 
            This comprehensive guide aims to provide readers with a deep understanding of DAOs, featuring 
            insights from various experts in the field.
          </p>
          <div className="flex items-center mt-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-amber-600 dark:text-amber-400 font-medium">In Production</span>
          </div>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Interactive Courses and Quests</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            In collaboration with Network State Connect on the Mighty Networks platform, How To DAO offers 
            interactive quests and courses designed to help individuals understand DAOs, acquire essential 
            skills, and become active contributors to the DAO ecosystem.
          </p>
          <div className="flex items-center mt-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">Ongoing</span>
          </div>
        </div>
        
        <div className="bg-[color:var(--color-peach)]/5 dark:bg-[color:var(--color-black)]/20 rounded-lg p-5 border border-[color:var(--color-peach)]/10 dark:border-[color:var(--color-black)]/30">
          <h4 className="text-lg font-medium mb-2 text-[color:var(--color-peach)]">Partnership Opportunities</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            The project is actively seeking partnerships to expand its reach and impact. Potential collaborations 
            include brand exposure at exclusive events and co-branded editions of the How To DAO book, aligning 
            partners with the growing decentralized movement.
          </p>
          <div className="flex items-center mt-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Open for Applications</span>
          </div>
        </div>
      </div>
    </div>
  );
}