import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { getCookie } from "../../lib/utils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    const token = getCookie("stream_auth");
    console.log(token);
    if (token) {
      const decoded = jwtDecode(token);
      setIsAuthenticated(true);
      setUser(decoded.userId);
    }
  }, [setIsAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
