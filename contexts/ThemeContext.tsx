import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  toggleColorScheme: () => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setColorSchemeState(savedTheme as ColorScheme);
      } else if (systemColorScheme) {
        setColorSchemeState(systemColorScheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleColorScheme = async () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    await setColorScheme(newScheme);
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, toggleColorScheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

