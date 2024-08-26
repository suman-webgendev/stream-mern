import { AuthContext } from "@/components/providers/AuthProvider";
import { useContext } from "react";

export const useAuth = () => {
  return useContext(AuthContext);
};
