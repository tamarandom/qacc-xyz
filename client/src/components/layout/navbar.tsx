import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Menu, LogOut, User, Settings, ChevronDown } from "lucide-react";
import qaccLogo from "../../assets/qacc-logo-light.png";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme(); // Keep for compatibility
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
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
                  {/* Display user points for logged in users */}
                  <div className="bg-[#2a323c] rounded-full px-4 py-2 font-['IBM_Plex_Mono'] text-md font-medium">
                    {Number.isFinite(user.points) ? Math.round(user.points).toLocaleString() : 0} Pt
                  </div>
                  
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
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
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 bg-[#11151b] border border-[#2a323c] text-white">
                      <div className="flex items-center p-4 border-b border-[#2a323c]">
                        <div className="h-12 w-12 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)] mr-3">
                          <span className="font-['IBM_Plex_Mono'] font-medium text-lg">
                            {user?.username ? user.username.substring(0, 2).toUpperCase() : ""}
                          </span>
                        </div>
                        <div>
                          <div className="font-['IBM_Plex_Mono'] font-medium text-lg text-white">
                            {user?.username}
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="bg-[#2a323c]" />
                      
                      <DropdownMenuItem 
                        className="p-4 cursor-pointer hover:bg-[#1c2430] transition-colors flex items-center"
                        asChild
                      >
                        <Link href="/wallet">
                          <div className="flex items-center w-full">
                            <User className="mr-2 h-5 w-5" />
                            <span className="font-['IBM_Plex_Mono'] text-base">View Profile</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-[#2a323c]" />
                      
                      <DropdownMenuItem 
                        className="p-4 cursor-pointer hover:bg-[#1c2430] transition-colors flex items-center"
                        asChild
                      >
                        <Link href="/wallet">
                          <div className="flex items-center w-full">
                            <Settings className="mr-2 h-5 w-5" />
                            <span className="font-['IBM_Plex_Mono'] text-base">Account Settings</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-[#2a323c]" />
                      
                      <DropdownMenuItem 
                        className="p-4 cursor-pointer hover:bg-[#1c2430] transition-colors flex items-center text-white"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                            <span className="font-['IBM_Plex_Mono'] text-base">Logging out...</span>
                          </>
                        ) : (
                          <>
                            <LogOut className="mr-2 h-5 w-5" />
                            <span className="font-['IBM_Plex_Mono'] text-base">Logout</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Points display for non-logged in users */}
                <div className="bg-[#2a323c] rounded-full px-4 py-2 font-['IBM_Plex_Mono'] text-md font-medium">
                  0 Pt
                </div>
                
                {/* Connect button */}
                <Link href="/auth">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="font-['IBM_Plex_Mono'] text-sm font-medium px-6 py-2 bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none hover:bg-[color:var(--color-peach-300)]"
                  >
                    Connect
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
                <div className="flex items-center mb-3">
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
                
                {/* Points display for mobile logged-in users */}
                <div className="bg-[#2a323c] rounded-full px-4 py-2 font-['IBM_Plex_Mono'] text-md font-medium text-center mb-3">
                  {Number.isFinite(user.points) ? Math.round(user.points).toLocaleString() : 0} Pt
                </div>
                
                <div className="mt-3 space-y-3">
                  <Link href="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full font-['IBM_Plex_Mono'] text-sm flex items-center justify-center bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                    >
                      <User className="h-4 w-4 mr-2" /> 
                      View Profile
                    </Button>
                  </Link>
                  
                  <Link href="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full font-['IBM_Plex_Mono'] text-sm flex items-center justify-center bg-[color:var(--card-background)] text-[color:var(--text-primary)] border-[color:var(--border-color)] hover:bg-[color:var(--border-color)]"
                    >
                      <Settings className="h-4 w-4 mr-2" /> 
                      Account Settings
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
                    onClick={async () => {
                      await handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" /> 
                        Logout
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {/* Points display for mobile */}
                <div className="bg-[#2a323c] rounded-full px-4 py-2 font-['IBM_Plex_Mono'] text-md font-medium text-center">
                  0 Pt
                </div>
                
                {/* Connect button for mobile */}
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="default" 
                    className="w-full font-['IBM_Plex_Mono'] text-sm font-medium bg-[color:var(--color-peach)] text-[color:var(--color-black)] border-none hover:bg-[color:var(--color-peach-300)]"
                  >
                    Connect
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
