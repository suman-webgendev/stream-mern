import { AuthContext } from "@/components/providers/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { api } from "../lib/utils";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth must be used within a AuthProvider");

  return context;
};

export const useSignIn = (navigate) => {
  return useMutation({
    mutationFn: async (values) => {
      const response = await api.post("/api/auth/login", values);
      return response.data;
    },
    onSuccess: () => {
      navigate("/");
      navigate(0);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (values) => {
      const response = await api.post("/api/auth/register", values);
      return response.data;
    },
  });
};

export const useLogout = (setIsAuthenticated, navigate, queryClient) => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.invalidateQueries(["authCheck"]);
      navigate("/login");
    },
  });
};

export const useAuthCheck = () => {
  return useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => {
      const response = await api.get("/api/auth/check");
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
};
