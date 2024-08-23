import { getCookie } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { createContext, useLayoutEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    username: "",
    userId: "",
  });

  useLayoutEffect(() => {
    const token = getCookie();
    if (token) {
      const decoded = jwtDecode(token);
      setIsAuthenticated(true);
      setUser({
        userId: decoded.userId,
        username: decoded.username,
      });
    }
  }, [setIsAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
