import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, DesignSystem } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].primary,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarItemStyle: {
          width: 85,
        },
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: Colors[colorScheme].border,
          borderTopWidth: 1,
          paddingTop: Platform.OS === 'ios' ? DesignSystem.spacing.xs : DesignSystem.spacing.xs,
          paddingBottom: Platform.OS === 'ios' ? DesignSystem.spacing.sm : DesignSystem.spacing.xs,
          height: Platform.OS === 'ios' ? 80 : 60,
          ...DesignSystem.shadows.small,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="house.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t.tabs.transactions,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="list.bullet" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="utilities"
        options={{
          title: t.tabs.utilities,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="bolt.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t.tabs.goals,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="target" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: t.tabs.debts,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="creditcard.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="person.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
