import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        error,
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