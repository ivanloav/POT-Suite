import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FooterContextType {
  isVisible: boolean;
  content: ReactNode | null;
  setFooter: (content: ReactNode | null) => void;
  hideFooter: () => void;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export const FooterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const setFooter = (newContent: ReactNode | null) => {
    setContent(newContent);
    setIsVisible(!!newContent);
  };

  const hideFooter = () => {
    setContent(null);
    setIsVisible(false);
  };

  return (
    <FooterContext.Provider value={{ isVisible, content, setFooter, hideFooter }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
};