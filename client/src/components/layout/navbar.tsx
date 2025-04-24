import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Menu, LogOut, User } from "lucide-react";
import qaccLogo from "../../assets/qacc-logo-light.png";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme(); // Keep for compatibility
  
  const handleLogout = () => {
    logout();
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
              <Link href="/projects" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/projects" 
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
              <Link href="/active-rounds" className={`inline-flex items-center px-1 pt-1 border-b-2 font-['IBM_Plex_Mono'] text-sm font-medium ${
                  location === "/active-rounds" 
                    ? "border-[color:var(--color-peach)] text-[color:var(--text-primary)]" 
                    : "border-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--color-peach-200)] hover:text-[color:var(--text-primary)]"
                }`}>
                FUNDING ROUNDS
              </Link>

            </div>
          </div>
          
          {/* Auth Buttons or User Info - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
            {user ? (
              <>       
                <div className="flex items-center space-x-3">
                  {user.role === 'admin' && (
                    <Link href="/admin">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="font-['IBM_Plex_Mono'] text-xs font-medium bg-[color:var(--card-background)] text-[color:var(--color-peach)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                      >
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-[color:var(--text-primary)]">
                      {user?.username}
                    </span>
                    {user.role === 'admin' && (
                      <span className="text-xs text-[color:var(--color-peach)]">Admin</span>
                    )}
                    {user.role === 'project_owner' && (
                      <span className="text-xs text-blue-500">Project Owner</span>
                    )}
                  </div>
                  
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
              href="/projects" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/projects"
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
            <Link 
              href="/active-rounds" 
              className={`block py-2 px-3 rounded-md font-['IBM_Plex_Mono'] text-base font-medium ${
                location === "/active-rounds"
                  ? "bg-[color:var(--border-color)] text-[color:var(--color-peach)]"
                  : "text-[color:var(--text-primary)] hover:bg-[color:var(--border-color)] hover:text-[color:var(--text-primary)]"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FUNDING ROUNDS
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
                    {user.role === 'admin' && (
                      <div className="text-xs text-[color:var(--color-peach)]">Admin</div>
                    )}
                    {user.role === 'project_owner' && (
                      <div className="text-xs text-blue-500">Project Owner</div>
                    )}
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
                  
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        variant="outline" 
                        className="w-full font-['IBM_Plex_Mono'] text-sm flex items-center justify-center bg-[color:var(--card-background)] text-[color:var(--color-peach)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                          <path d="M12 4.5A2.5 2.5 0 0 0 9.5 7 2.5 2.5 0 0 0 12 9.5a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 12 4.5z"></path>
                          <path d="M19.5 19.5c0-3.59-2.91-6.5-6.5-6.5s-6.5 2.91-6.5 6.5"></path>
                          <path d="M2 19.5a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5"></path>
                        </svg>
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  
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
