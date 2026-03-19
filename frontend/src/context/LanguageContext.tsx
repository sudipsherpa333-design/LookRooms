import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ne';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome to LookRooms',
    find_room: 'Find your perfect room',
    search_placeholder: 'Search by city, area, or room type...',
    login: 'Login',
    register: 'Register',
    rent: 'Rent',
    buy: 'Buy',
    home: 'Home',
    listings: 'Listings',
    messages: 'Messages',
    profile: 'Profile',
    logout: 'Logout'
  },
  ne: {
    welcome: 'LookRooms मा स्वागत छ',
    find_room: 'आफ्नो उत्तम कोठा फेला पार्नुहोस्',
    search_placeholder: 'शहर, क्षेत्र, वा कोठा प्रकार द्वारा खोज्नुहोस्...',
    login: 'लगइन',
    register: 'दर्ता गर्नुहोस्',
    rent: 'भाडामा',
    buy: 'किन्नुहोस्',
    home: 'गृहपृष्ठ',
    listings: 'सूचीहरू',
    messages: 'सन्देशहरू',
    profile: 'प्रोफाइल',
    logout: 'लगआउट'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
