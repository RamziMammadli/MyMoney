import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { colorScheme } = useTheme();

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RootNavigator />
      </LanguageProvider>
    </ThemeProvider>
  );
}
