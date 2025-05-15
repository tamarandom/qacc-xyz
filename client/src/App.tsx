import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Home from "@/pages/home-fixed";
import LandingPage from "@/pages/landing-page";
import ProjectDetail from "@/pages/project-detail";
import PointsPage from "@/pages/points";
import UserScorePage from "@/pages/user-score";
import PortfolioPage from "@/pages/portfolio";
import WalletPage from "@/pages/wallet-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import ActiveRoundsPage from "@/pages/active-rounds";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/points" component={PointsPage} />
      <ProtectedRoute path="/user-score" component={UserScorePage} />
      <ProtectedRoute path="/portfolio" component={PortfolioPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/active-rounds" component={ActiveRoundsPage} />
      <AdminRoute path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
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
        <HelmetProvider>
          <AuthProvider>
            <InitDarkMode />
            <div className="flex flex-col min-h-screen dark bg-[color:var(--background)]">
              <Navbar />
              <main className="flex-1 bg-[color:var(--background)]">
                <Router />
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
