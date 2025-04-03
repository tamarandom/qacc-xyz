import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Home from "@/pages/home-fixed";
import ProjectDetail from "@/pages/project-detail";
import PointsPage from "@/pages/points";
import UserScorePage from "@/pages/user-score";
import PortfolioPage from "@/pages/portfolio";
import { ThemeProvider } from "@/contexts/theme-context";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/points" component={PointsPage} />
      <Route path="/user-score" component={UserScorePage} />
      <Route path="/portfolio" component={PortfolioPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Force dark mode on initial load
function InitDarkMode() {
  useEffect(() => {
    // Apply dark mode to the document
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <InitDarkMode />
        <div className="flex flex-col min-h-screen dark bg-[color:var(--background)]">
          <Navbar />
          <main className="flex-1 bg-[color:var(--background)]">
            <Router />
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
