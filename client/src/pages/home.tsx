import { Suspense } from "react";
import ProjectList from "@/components/projects/project-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DeFi Projects</h1>
        <p className="mt-2 text-sm text-gray-600">
          Browse through our portfolio of carefully selected Web3 startups participating in our accelerator program.
        </p>
      </div>
      
      <Suspense fallback={<div className="py-10"><Skeleton className="h-[400px] w-full" /></div>}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
