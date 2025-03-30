import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="font-['Tusker_Grotesk'] uppercase text-[color:var(--color-black)] text-2xl font-bold tracking-wider mr-1">
                  Quadratic
                </span>
                <span className="font-['Tusker_Grotesk'] uppercase text-[color:var(--color-peach)] text-2xl font-bold tracking-wider">
                  Accelerator
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--color-black)]" 
                    : "border-transparent text-[color:var(--color-black-100)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--color-black)]"
                }`}>
                  PROJECTS
              </Link>
              <Link href="/portfolio" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/portfolio" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--color-black)]" 
                    : "border-transparent text-[color:var(--color-black-100)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--color-black)]"
                }`}>
                PORTFOLIO
              </Link>
              <Link href="/points" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/points" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--color-black)]" 
                    : "border-transparent text-[color:var(--color-black-100)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--color-black)]"
                }`}>
                POINTS
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <Button size="icon" variant="ghost" className="text-[color:var(--color-gray)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="ml-3 relative">
              <Button variant="ghost" size="sm" className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-peach)]">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                  <span className="font-['IBM_Plex_Mono'] font-medium">JD</span>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Button variant="ghost" size="sm" className="inline-flex items-center justify-center p-2 rounded-md text-[color:var(--color-gray)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
