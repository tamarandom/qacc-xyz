import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  login: () => void;
  logout: () => void;
  loginWithCredentials: (username: string, password: string) => void;
  registerWithCredentials: (data: RegisterFormData) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const login = () => {
    // Redirect to login page (using Replit Auth)
    window.location.href = "/api/login";
  };

  const logout = () => {
    // Redirect to the server logout endpoint
    window.location.href = "/api/logout";
  };
  
  // Login with username and password
  const loginWithCredentials = async (username: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const response = await apiRequest("POST", "/api/login-credentials", { username, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed. Please check your credentials.");
      }
      
      const userData = await response.json();
      queryClient.setQueryData(["/api/auth/user"], userData);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.username}!`,
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };
  
  // Register with username, email, and password
  const registerWithCredentials = async (data: RegisterFormData) => {
    setIsAuthLoading(true);
    try {
      const response = await apiRequest("POST", "/api/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }
      
      const userData = await response.json();
      queryClient.setQueryData(["/api/auth/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome to q/acc, ${userData.username}!`,
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isUserLoading || isAuthLoading,
        isAuthenticated: !!user,
        error,
        login,
        logout,
        loginWithCredentials,
        registerWithCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}