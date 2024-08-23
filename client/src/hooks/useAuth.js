import { AuthContext } from "@/components/providers/AuthProvider";
import { useContext } from "react";

/**
 * Custom hook to access the authentication context.
 *
 * This hook provides access to the authentication state, including
 * whether the user is authenticated and the user's information.
 *
 * @returns {Object} The authentication context.
 * @returns {boolean} return.isAuthenticated - Whether the user is authenticated.
 * @returns {Object} return.user - The user's information.
 * @returns {string} return.user.userId - The ID of the authenticated user.
 * @returns {string} return.user.username - The username of the authenticated user.
 *
 * @throws {Error} Throws an error if the hook is used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");

  return context;
};
