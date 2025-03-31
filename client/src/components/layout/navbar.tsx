import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Menu, LogOut, Moon, Sun } from "lucide-react";
import qaccLogo from "../../assets/qacc-logo.jpg";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ username: "Satoshi Fan", email: "satoshi@example.com" });
  const [theme, setTheme] = useState('light');
  
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Initialize authentication state from localStorage on component mount
  useEffect(() => {
    const savedAuthState = localStorage.getItem('isAuthenticated') === 'true';
    if (savedAuthState) {
      setIsAuthenticated(true);
    }
  }, []);

  // Mock authentication functions
  const handleLogin = () => {
    console.log("Login clicked");
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    // Create a storage event for other components to detect
    window.dispatchEvent(new Event('storage'));
  };
  
  const handleSignUp = () => {
    console.log("Sign up clicked");
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    // Create a storage event for other components to detect
    window.dispatchEvent(new Event('storage'));
  };
  
  const handleLogout = () => {
    console.log("Logout clicked");
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false');
    // Create a storage event for other components to detect
    window.dispatchEvent(new Event('storage'));
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
          
          {/* Auth Buttons or User Info - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full text-[color:var(--color-gray)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {isAuthenticated ? (
              <>                
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-[color:var(--color-black)]">
                      {user.username}
                    </span>
                    <span className="text-xs text-[color:var(--color-gray)]">
                      {user.email}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 rounded-full focus:outline-none"
                      onClick={handleLogout}
                    >
                      <div className="h-8 w-8 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                        <span className="font-['IBM_Plex_Mono'] font-medium">SF</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
        <div className="sm:hidden bg-[color:var(--card-background)] border-t border-[color:var(--border-color)] pt-2 pb-3">
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
          
          {/* Auth area - Mobile */}
          <div className="border-t border-[color:var(--border-color)] pt-4 pb-3 px-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[color:var(--color-peach)] flex items-center justify-center text-[color:var(--color-black)]">
                      <span className="font-['IBM_Plex_Mono'] font-medium">SF</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-[color:var(--color-black)]">{user.username}</div>
                    <div className="text-sm font-medium text-[color:var(--color-gray)]">{user.email}</div>
                  </div>
                </div>
                
                <div className="mt-3 space-y-3">
                  <div className="flex items-center mb-3 justify-between">
                    <span className="text-sm font-medium text-[color:var(--color-black)]">
                      Toggle Theme
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                      className="rounded-full text-[color:var(--color-gray)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                
                  <Button 
                    variant="outline" 
                    className="w-full font-['IBM_Plex_Mono'] text-sm flex items-center justify-center"
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
                <div className="flex items-center mb-3 justify-between">
                  <span className="text-sm font-medium text-[color:var(--color-black)]">
                    Toggle Theme
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="rounded-full text-[color:var(--color-gray)] hover:text-[color:var(--color-black)] hover:bg-[color:var(--color-light-gray)]"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                
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
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
