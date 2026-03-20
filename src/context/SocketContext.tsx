import React, { createContext } from 'react';

export const SocketContext = createContext({});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};
