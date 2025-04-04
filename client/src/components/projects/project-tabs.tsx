import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectTabsProps {
  projectId: number;
  projectName: string;
  aboutContent?: React.ReactNode;
  teamContent?: React.ReactNode;
  roadmapContent?: React.ReactNode;
}

/**
 * ProjectTabs Component
 * 
 * A reusable component for project detail tabs following QACC brand guidelines.
 * This component will display tabs for About, Team, and Roadmap sections.
 * Each tab can receive custom content or display a placeholder if no content is provided.
 */
export function ProjectTabs({
  projectId,
  projectName,
  aboutContent,
  teamContent,
  roadmapContent
}: ProjectTabsProps) {
  return (
    <div className="mb-6">
      <Tabs defaultValue="about" className="dark:bg-[color:var(--color-black)]">
        {/* Tabs navigation */}
        <div className="overflow-x-auto no-scrollbar bg-white dark:bg-[color:var(--color-black)]">
          <TabsList className="w-max min-w-full flex justify-start bg-white dark:bg-[color:var(--color-black)]">
            <TabsTrigger 
              value="about" 
              className="px-4 sm:px-6 md:px-8 py-3 text-sm sm:text-base mr-2 sm:mr-6 md:mr-8 whitespace-nowrap dark:text-gray-300"
            >
              ABOUT
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="px-4 sm:px-6 md:px-8 py-3 text-sm sm:text-base mr-2 sm:mr-6 md:mr-8 whitespace-nowrap dark:text-gray-300"
            >
              TEAM
            </TabsTrigger>
            <TabsTrigger 
              value="roadmap" 
              className="px-4 sm:px-6 md:px-8 py-3 text-sm sm:text-base whitespace-nowrap dark:text-gray-300"
            >
              ROADMAP
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab content */}
        <TabsContent value="about" className="pt-6 dark:bg-[color:var(--color-black)]">
          {aboutContent ? (
            aboutContent
          ) : (
            <div className="text-gray-600 dark:text-gray-300 italic text-sm">
              No information available yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="team" className="pt-6 dark:bg-[color:var(--color-black)]">
          {teamContent ? (
            teamContent
          ) : (
            <div className="text-gray-600 dark:text-gray-300 italic text-sm">
              No team information available yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="roadmap" className="pt-6 dark:bg-[color:var(--color-black)]">
          {roadmapContent ? (
            roadmapContent
          ) : (
            <div className="text-gray-600 dark:text-gray-300 italic text-sm">
              No roadmap information available yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}