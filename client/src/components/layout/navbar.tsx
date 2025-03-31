import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BellIcon, X, Menu } from "lucide-react";
import qaccLogo from "../../assets/qacc-logo.jpg";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src={qaccLogo} 
                  alt="Quadratic Accelerator Logo" 
                  className="h-8"
                />
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
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-[color:var(--color-gray)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 pt-2 pb-3">
          <div className="space-y-1 px-4">
            <Link 
              href="/" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/"
                  ? "bg-[color:var(--color-peach-50)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PROJECTS
            </Link>
            <Link 
              href="/portfolio" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/portfolio"
                  ? "bg-[color:var(--color-peach-50)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PORTFOLIO
            </Link>
            <Link 
              href="/points" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/points"
                  ? "bg-[color:var(--color-peach-50)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)] hover:text-[color:var(--color-black)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              POINTS
            </Link>
          </div>
          
          <div className="border-t border-gray-200 pt-4 pb-2">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                  <span className="font-['IBM_Plex_Mono'] font-medium">JD</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-[color:var(--color-black)]">John Doe</div>
                <div className="text-sm font-medium text-[color:var(--color-gray)]">john@example.com</div>
              </div>
              <Button size="icon" variant="ghost" className="ml-auto text-[color:var(--color-gray)]">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
