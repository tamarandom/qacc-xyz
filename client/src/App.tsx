import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Home from "@/pages/home-new";
import ProjectDetail from "@/pages/project-detail";
import PointsPage from "@/pages/points";
import UserScorePage from "@/pages/user-score";
import PortfolioPage from "@/pages/portfolio";
import { ThemeProvider } from "@/contexts/theme-context";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
