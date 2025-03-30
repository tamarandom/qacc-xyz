import { Suspense } from "react";
import ProjectList from "@/components/projects/project-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
          THE FUTURE OF <span className="text-[color:var(--color-peach)]">TOKENISATION</span>
        </h1>
        <p className="mt-3 font-['IBM_Plex_Mono'] text-[color:var(--color-black-100)]">
          Browse through our portfolio of carefully selected Web3 startups participating in our Quadratic Accelerator program.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-['Tusker_Grotesk'] uppercase tracking-wider text-[color:var(--color-black)]">
          Active Projects
        </h2>
        <div className="h-1 w-20 bg-[color:var(--color-peach)] mt-2 mb-6"></div>
      </div>
      
      <Suspense fallback={<div className="py-10"><Skeleton className="h-[400px] w-full" /></div>}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
