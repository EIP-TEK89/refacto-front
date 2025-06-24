import type { ReactNode } from "react";
import { AuthContext } from "./authContext";
import { useAuthState } from "./hooks/useAuthState";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use the combined auth state hook
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};
