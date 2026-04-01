import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// color tokens used across the application. you can expand this list as needed.
const lightColors = {
  bg: '#f0f0f7',
  card2: '#f8f8ff',
  green: '#4ade80',
  background: '#f5f5f5',
  header: '#ffffff',
  headerBackground: '#ffffff',
  card: '#ffffff',
  cardBackground: '#ffffff',
  border: '#eee',
  borderLight: '#f5f5f5',
  textPrimary: '#333333',
  textSecondary: '#999999',
  accent: '#FF6B6B',
  accentSoft: 'rgba(255,107,107,0.08)',
  input: '#f8f8ff',
  overlay: 'rgba(0,0,0,0.5)',
  success: '#4CAF50',
  danger: '#f87171',
  warning: '#FFC107',
  error: '#F44336',
  info: '#009688',
  gold: '#FFD700',
  accentLight: 'rgba(255,107,107,0.08)',
  accentLight: 'rgba(255,107,107,0.08)',
  switchTrackOff: '#ddd',
  switchTrackOn: '#FF6B6B',
  switchThumb: '#ffffff',
  freeBadge: '#999999',
  onAccent: '#ffffff',
  declineButton: '#f0f0f0',
  emptyText: '#cccccc',
  newsBody: '#666666',
  planCard: '#f8f8f8',
  premiumCard: '#fff5f5',
  googleButtonBg: '#ffffff',
  googleIconBg: '#f0f0f0',
};

const darkColors = {
  bg: '#0d0d14',
  card2: '#16213e',
  green: '#4ade80',
  background: '#1a1a2e',
  header: '#16213e',
  headerBackground: '#16213e',
  card: '#1a1a2e',
  cardBackground: '#16213e',
  border: '#333333',
  borderLight: '#333333',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  accent: '#FF6B6B',
  accentSoft: 'rgba(255,107,107,0.12)',
  input: '#16213e',
  overlay: 'rgba(0,0,0,0.75)',
  success: '#4CAF50',
  danger: '#f87171',
  warning: '#FFC107',
  error: '#F44336',
  info: '#009688',
  gold: '#FFD700',
  switchTrackOff: '#555555',
  switchTrackOn: '#FF6B6B',
  switchThumb: '#ffffff',
  freeBadge: '#555555',
  onAccent: '#ffffff',
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
