import React, { createContext, useContext } from "react";

export interface UserContextType {
  userName: string;
  userId?: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("UserContext not found");
  return ctx;
};

export const UserProvider: React.FC<{ user: UserContextType; children: React.ReactNode }> = ({ user, children }) => (
  <UserContext.Provider value={user}>{children}</UserContext.Provider>
);
