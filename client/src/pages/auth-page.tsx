import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const { user, isLoading, login } = useAuth();
  
  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero section */}
      <div className="w-full md:w-1/2 bg-black p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto text-white space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 to-orange-400 text-transparent bg-clip-text">
            Explore the Future of DeFi with q/acc
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Discover cutting-edge web3 projects, earn points, and track your portfolio in the first community-driven DeFi accelerator.
          </p>
          <div className="pt-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-400 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-black">1</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Browse Projects</h3>
                <p className="text-sm text-gray-400">Discover and research innovative Web3 startups</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-400 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-black">2</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Support Projects</h3>
                <p className="text-sm text-gray-400">Buy tokens and become an early backer</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-400 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-black">3</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Earn Points</h3>
                <p className="text-sm text-gray-400">Track your portfolio and climb the leaderboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth form */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">WELCOME TO Q/ACC</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 items-center justify-center py-6">
              <Button 
                onClick={login} 
                className="w-full h-12 bg-[#FBBA80] hover:bg-[#E9A970] text-black font-semibold text-base flex items-center justify-center gap-2"
              >
                <FcGoogle className="h-5 w-5" />
                Sign In with Google
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                You'll be securely authenticated through Replit's authentication service, which uses Google login.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}