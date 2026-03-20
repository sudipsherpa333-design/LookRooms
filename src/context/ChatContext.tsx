import React, { createContext } from 'react';

export const ChatContext = createContext({});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
};
