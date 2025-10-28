import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, DesignSystem } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarItemStyle: {
          width: 85,
        },
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
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
          title: 'Ana Səhifə',
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
          title: 'Əməliyyatlar',
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
          title: 'Komunal',
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
          title: 'Hədəflərim',
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
          title: 'Borclar',
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
          title: 'Profil',
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
