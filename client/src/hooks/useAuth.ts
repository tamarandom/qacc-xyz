import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { 
    data: user, 
    isLoading,
    error 
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    // Helper functions
    logout: () => {
      // Redirect to the server logout endpoint
      window.location.href = "/api/logout";
    },
    login: () => {
      // Redirect to the server login endpoint
      window.location.href = "/api/login";
    }
  };
}