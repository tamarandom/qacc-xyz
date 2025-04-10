import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Menu, LogOut, User } from "lucide-react";
import qaccLogo from "../../assets/qacc-logo-light.png";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toggleTheme } = useTheme(); // Keep for compatibility
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleRedirectToAuth = () => {
    window.location.href = "/auth";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-[color:var(--card-background)] shadow-sm sticky top-0 z-10 border-b border-[color:var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src={qaccLogo} 
                  alt="Quadratic Accelerator Logo" 
                  className="h-8 pr-2 max-w-[200px]"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--text-primary)]" 
                    : "border-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--text-primary)]"
                }`}>
                  PROJECTS
              </Link>
              <Link href="/portfolio" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/portfolio" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--text-primary)]" 
                    : "border-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--text-primary)]"
                }`}>
                PORTFOLIO
              </Link>
              <Link href="/points" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/points" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--text-primary)]" 
                    : "border-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--text-primary)]"
                }`}>
                LEADERBOARD
              </Link>

            </div>
          </div>
          
          {/* Auth Buttons or User Info - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
            {user ? (
              <>                
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-[color:var(--text-primary)]">
                    {user?.username}
                  </span>
                  
                  <Link href="/wallet">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 rounded-full focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                        <span className="font-['IBM_Plex_Mono'] font-medium">
                          {user?.username ? user.username.substring(0, 2).toUpperCase() : ""}
                        </span>
                      </div>
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-['IBM_Plex_Mono'] text-sm font-medium px-6 py-2 bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                  >
                    Log In
                  </Button>
                </Link>
                
                <Link href="/auth?tab=register">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="font-['IBM_Plex_Mono'] text-sm font-medium px-6 py-2 bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none hover:bg-[color:var(--color-peach-300)]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--border-color)]"
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
        <div className="sm:hidden bg-[color:var(--card-background)] border-t border-[color:var(--border-color)] pt-2 pb-3">
          <div className="space-y-1 px-4">
            <Link 
              href="/" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/"
                  ? "bg-[color:var(--border-color)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--text-primary)] hover:bg-[color:var(--border-color)] hover:text-[color:var(--text-primary)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PROJECTS
            </Link>
            <Link 
              href="/portfolio" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/portfolio"
                  ? "bg-[color:var(--border-color)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--text-primary)] hover:bg-[color:var(--border-color)] hover:text-[color:var(--text-primary)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PORTFOLIO
            </Link>
            <Link 
              href="/points" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/points"
                  ? "bg-[color:var(--border-color)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--text-primary)] hover:bg-[color:var(--border-color)] hover:text-[color:var(--text-primary)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              LEADERBOARD
            </Link>

          </div>
          
          {/* Auth area - Mobile */}
          <div className="border-t border-[color:var(--border-color)] pt-4 pb-3 px-4">
            {user ? (
              <>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                      <span className="font-['IBM_Plex_Mono'] font-medium">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-[color:var(--text-primary)]">{user.username}</div>
                  </div>
                </div>
                
                <div className="mt-3 space-y-3">
                  <Link href="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full font-['IBM_Plex_Mono'] text-sm flex items-center justify-center bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                    >
                      <User className="h-4 w-4 mr-2" /> 
                      My Profile
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full font-['IBM_Plex_Mono'] text-sm flex items-center justify-center bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> 
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full font-['IBM_Plex_Mono'] text-sm font-medium bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                  >
                    Log In
                  </Button>
                </Link>
                
                <Link href="/auth?tab=register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="default" 
                    className="w-full font-['IBM_Plex_Mono'] text-sm font-medium bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none hover:bg-[color:var(--color-peach-300)]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
