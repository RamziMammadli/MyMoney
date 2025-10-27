import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import { Colors, DesignSystem } from '@/constants/theme';

interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
}

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const profileMenuItems: ProfileMenuItem[] = [
    {
      id: 'personal-info',
      title: 'Şəxsi Məlumatlar',
      subtitle: 'Ad, soyad və kontakt məlumatları',
      icon: 'person',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: 'security',
      title: 'Təhlükəsizlik',
      subtitle: 'Şifrə və təhlükəsizlik tənzimləmələri',
      icon: 'shield-checkmark',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: 'notifications',
      title: 'Bildirişlər',
      subtitle: 'Push bildirişləri və email',
      icon: 'notifications',
      onPress: () => {},
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          thumbColor={notificationsEnabled ? '#FFFFFF' : Colors.light.iconSecondary}
        />
      ),
    },
    {
      id: 'biometric',
      title: 'Biometrik Giriş',
      subtitle: 'Barmaq izi və ya Face ID',
      icon: 'finger-print',
      onPress: () => {},
      rightComponent: (
        <Switch
          value={biometricEnabled}
          onValueChange={setBiometricEnabled}
          trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          thumbColor={biometricEnabled ? '#FFFFFF' : Colors.light.iconSecondary}
        />
      ),
    },
    {
      id: 'language',
      title: 'Dil',
      subtitle: 'Azərbaycan dili',
      icon: 'language',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: 'currency',
      title: 'Valyuta',
      subtitle: 'AZN (Azərbaycan Manatı)',
      icon: 'cash',
      onPress: () => {},
      showArrow: true,
    },
  ];

  const supportMenuItems: ProfileMenuItem[] = [
    {
      id: 'help',
      title: 'Kömək və Dəstək',
      icon: 'help-circle',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: 'contact',
      title: 'Bizimlə Əlaqə',
      icon: 'mail',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: 'feedback',
      title: 'Təklif və Şikayət',
      icon: 'chatbubble',
      onPress: () => {},
      showArrow: true,
    },
    {
      id: 'about',
      title: 'Haqqımızda',
      subtitle: 'Versiya 1.0.0',
      icon: 'information-circle',
      onPress: () => {},
      showArrow: true,
    },
  ];

  const renderMenuItem = (item: ProfileMenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      disabled={!item.showArrow && !item.rightComponent}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={item.icon} size={20} color={Colors.light.icon} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.rightComponent || (item.showArrow && (
          <Ionicons name="chevron-forward" size={16} color={Colors.light.iconSecondary} />
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderProfileHeader = () => (
    <Card variant="gradient" style={styles.profileCard}>
      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#1E88E5', '#90CAF9']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>RM</Text>
          </LinearGradient>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Ramzi Mammadli</Text>
          <Text style={styles.profileEmail}>ramzi@example.com</Text>
          <Text style={styles.profilePhone}>+994 50 123 45 67</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create" size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Profil"
        subtitle="Hesabınızı idarə edin"
        rightIcon="settings"
        onRightPress={() => {}}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        {renderProfileHeader()}

        {/* Profile settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesab Tənzimləmələri</Text>
          <Card style={styles.menuCard}>
            {profileMenuItems.map((item, index) => (
              <View key={item.id}>
                {renderMenuItem(item)}
                {index < profileMenuItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dəstək</Text>
          <Card style={styles.menuCard}>
            {supportMenuItems.map((item, index) => (
              <View key={item.id}>
                {renderMenuItem(item)}
                {index < supportMenuItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Logout button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Çıxış"
            variant="outline"
            size="large"
            icon={<Ionicons name="log-out" size={20} color={Colors.light.error} />}
            onPress={() => {}}
            style={[styles.logoutButton, { borderColor: Colors.light.error }]}
            textStyle={{ color: Colors.light.error }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  profileCard: {
    marginBottom: DesignSystem.spacing.xl,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: DesignSystem.spacing.md,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  profilePhone: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.small,
  },
  section: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignSystem.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.medium,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  menuItemRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: DesignSystem.spacing.md,
  },
  logoutContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  logoutButton: {
    borderColor: Colors.light.error,
  },
});
