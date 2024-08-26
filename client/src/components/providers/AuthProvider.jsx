import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => {
      const response = await api.get("/auth/check");
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticated(data?.authenticated === true);
    }
    if (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    }
  }, [data, isLoading, error]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
