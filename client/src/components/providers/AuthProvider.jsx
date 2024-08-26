import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => {
      const response = await api.get("/auth/check");
      return response.data;
    },
  });

  useEffect(() => {
    if (!queryLoading) {
      setIsAuthenticated(data?.authenticated === true);
      setIsLoading(false);
    }
  }, [data, queryLoading]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
