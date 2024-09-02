import { createContext } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
};
