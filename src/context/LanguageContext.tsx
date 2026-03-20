import React, { createContext } from 'react';

export const LanguageContext = createContext({});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return <LanguageContext.Provider value={{}}>{children}</LanguageContext.Provider>;
};
