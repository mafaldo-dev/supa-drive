import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// color tokens used across the application. you can expand this list as needed.
const lightColors = {
  background: '#f5f5f5',
  headerBackground: '#ffffff',
  cardBackground: '#ffffff',
  border: '#eee',
  borderLight: '#f5f5f5',
  textPrimary: '#333333',
  textSecondary: '#999999',
  accent: '#FF6B6B',
  accentLight: '#FF6B6B20',
  accentDark: '#FF6B6B40',
  onAccent: '#ffffff',
  modalOverlay: 'rgba(0,0,0,0.5)',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#009688',
  switchTrackOff: '#ddd',
  switchTrackOn: '#FF6B6B',
  switchThumb: '#ffffff',
  freeBadge: '#999999',
  declineButton: '#f0f0f0',
  emptyText: '#cccccc',
  newsBody: '#666666',
  planCard: '#f8f8f8',
  premiumCard: '#fff5f5',
  googleButtonBg: '#ffffff',
  googleIconBg: '#f0f0f0',
};

const darkColors = {
  background: '#1a1a2e',
  headerBackground: '#16213e',
  cardBackground: '#16213e',
  border: '#333333',
  borderLight: '#333333',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  accent: '#FF6B6B',
  accentLight: '#FF6B6B20',
  accentDark: '#FF6B6B40',
  onAccent: '#ffffff',
  modalOverlay: 'rgba(0,0,0,0.5)',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#009688',
  switchTrackOff: '#555555',
  switchTrackOn: '#FF6B6B',
  switchThumb: '#ffffff',
  freeBadge: '#555555',
  declineButton: '#2a2a2a',
  emptyText: '#999999',
  newsBody: '#cccccc',
  planCard: '#1f1f3e',
  premiumCard: '#2a1a20',
  googleButtonBg: '#ffffff',
  googleIconBg: '#f0f0f0',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    AsyncStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
