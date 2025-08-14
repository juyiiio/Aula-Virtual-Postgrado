import React, { createContext, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 'medium');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeFontSize = (size) => {
    setFontSize(size);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-sidebar-collapsed', sidebarCollapsed);
  }, [theme, fontSize, sidebarCollapsed]);

  const value = {
    theme,
    fontSize,
    sidebarCollapsed,
    setTheme,
    setFontSize,
    setSidebarCollapsed,
    toggleTheme,
    changeFontSize,
    toggleSidebar
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
