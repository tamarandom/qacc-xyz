import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";
import qaccLogo from "../../assets/qacc-logo.jpg";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock functions for when the real authentication is implemented
  const handleLogin = () => {
    console.log("Login clicked");
  };
  
  const handleSignUp = () => {
    console.log("Sign up clicked");
  };

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
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogin}
              className="font-['IBM_Plex_Mono'] text-sm font-medium px-6 py-2 bg-[color:var(--color-light-gray)] text-[color:var(--color-black)] border-[color:var(--color-gray-200)] hover:bg-[color:var(--color-gray-200)] hover:text-[color:var(--color-black)]"
            >
              Log In
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSignUp}
              className="font-['IBM_Plex_Mono'] text-sm font-medium px-6 py-2 bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none hover:bg-[color:var(--color-peach-300)]"
            >
              Sign Up
            </Button>
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
          
          {/* Auth buttons - Mobile */}
          <div className="border-t border-gray-200 pt-4 pb-3 px-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full font-['IBM_Plex_Mono'] text-sm font-medium bg-[color:var(--color-light-gray)] text-[color:var(--color-black)] border-[color:var(--color-gray-200)] hover:bg-[color:var(--color-gray-200)] hover:text-[color:var(--color-black)]"
              onClick={() => {
                handleLogin();
                setIsMobileMenuOpen(false);
              }}
            >
              Log In
            </Button>
            
            <Button 
              variant="default" 
              className="w-full font-['IBM_Plex_Mono'] text-sm font-medium bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none hover:bg-[color:var(--color-peach-300)]"
              onClick={() => {
                handleSignUp();
                setIsMobileMenuOpen(false);
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
