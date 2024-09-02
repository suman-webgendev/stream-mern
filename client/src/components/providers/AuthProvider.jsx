import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const {
    data,
    isLoading: queryLoading,
    error,
  } = useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => {
      const response = await api.get("/api/auth/check");
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!queryLoading) {
      setIsAuthenticated(data?.authenticated === true);
      setUser(data?.user);
      setIsLoading(false);
    }

    if (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser({});
      setIsLoading(false);
    }
  }, [data, queryLoading, error]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, isLoading, error, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
