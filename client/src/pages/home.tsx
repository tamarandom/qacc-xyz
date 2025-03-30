import { Suspense, useState } from "react";
import ProjectList from "@/components/projects/project-list";
import ProjectGrid from "@/components/projects/project-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
          THE FUTURE OF <span className="text-[color:var(--color-peach)]">TOKENISATION</span>
        </h1>
        <p className="mt-3 font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)] max-w-3xl">
          Browse through our portfolio of carefully selected Web3 startups participating in our Quadratic Accelerator program.
        </p>
      </div>
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
            Active Projects
          </h2>
          <div className="h-1 w-20 bg-[color:var(--color-peach)] mt-2"></div>
        </div>
        
        <div className="flex items-center">
          <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <TabsList className="bg-[color:var(--color-light-gray)]">
              <TabsTrigger 
                value="grid"
                className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] text-[color:var(--color-black-100)]"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline font-['IBM_Plex_Mono'] text-xs">Grid</span>
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className="data-[state=active]:bg-[color:var(--color-peach)] data-[state=active]:text-[color:var(--color-black)] text-[color:var(--color-black-100)]"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline font-['IBM_Plex_Mono'] text-xs">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="py-10">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[250px] w-full rounded-lg" />
              <Skeleton className="h-[250px] w-full rounded-lg" />
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </div>
          ) : (
            <Skeleton className="h-[400px] w-full" />
          )}
        </div>
      }>
        {viewMode === "grid" ? <ProjectGrid /> : <ProjectList />}
      </Suspense>
    </div>
  );
}
