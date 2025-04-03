import React, { createContext, useContext, useEffect } from 'react';

// Simple dummy type since we're removing theme toggle functionality
type ThemeContextType = {
  theme: 'light';
  toggleTheme: () => void; // Keeping the function for compatibility but it won't do anything
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Set everything to light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    
    // Remove dark mode class if it exists
    document.body.classList.remove('dark');
    
    // Force all dark mode classes to be removed
    document.documentElement.classList.remove('dark');
  }, []);

  // Dummy function that doesn't do anything
  const toggleTheme = () => {
    // No-op function, keeping it for compatibility
    console.log('Dark mode has been disabled');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}