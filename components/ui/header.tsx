import { DesignSystem } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'transparent' | 'gradient';
}

export function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBackButton = false,
  onBackPress,
  style,
  variant = 'default',
}: HeaderProps) {
  const colors = useThemedColors();
  
  const getHeaderStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.md,
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      transparent: {
        backgroundColor: 'transparent',
      },
      gradient: {
        backgroundColor: colors.primary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTitleStyle = () => {
    return {
      fontSize: 24,
      fontWeight: '700' as const,
      color: variant === 'gradient' ? '#FFFFFF' : colors.text,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    };
  };

  const getSubtitleStyle = () => {
    return {
      fontSize: 14,
      fontWeight: '500' as const,
      color: variant === 'gradient' ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
      marginTop: DesignSystem.spacing.xs,
    };
  };

  const iconColor = variant === 'gradient' ? '#FFFFFF' : colors.icon;

  const renderLeftButton = () => {
    // Icons are disabled; keep spacing with an empty view
    return <View style={styles.iconButton} />;
  };

  const renderRightButton = () => {
    // Icons are disabled; keep spacing with an empty view
    return <View style={styles.iconButton} />;
  };

  return (
    <SafeAreaView style={[{ backgroundColor: colors.background }, style]}>
      <View style={getHeaderStyle()}>
        <View style={styles.headerContent}>
          {renderLeftButton()}
          <View style={styles.titleContainer}>
            <Text style={getTitleStyle()}>{title}</Text>
            {subtitle && <Text style={getSubtitleStyle()}>{subtitle}</Text>}
          </View>
          {renderRightButton()}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Balans header komponenti
export interface BalanceHeaderProps {
  balance: string;
  currency: string;
  onPress?: () => void;
}

// App Header Component
interface AppHeaderProps {
  title?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  notificationCount?: number;
}

export function AppHeader({ 
  title,
  onNotificationPress, 
  onProfilePress, 
  onSearchPress,
  notificationCount = 0 
}: AppHeaderProps) {
  const { t } = useLanguage();
  const colors = useThemedColors();
  const displayTitle = title || t.app.name;
  
  return (
    <View style={[styles.appHeaderContainer, { 
      backgroundColor: colors.background,
      borderBottomColor: colors.border 
    }]}>
      <View style={styles.appHeaderContent}>
        {/* Left Side - App Name */}
        <View style={styles.appHeaderLeft}>
          <Text style={[styles.appTitle, { color: colors.text }]}>{displayTitle}</Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>{t.app.subtitle}</Text>
        </View>

        {/* Right Side - Actions (disabled icons; keep placeholders) */}
        <View style={styles.appHeaderRight}>
          <View style={[styles.headerActionButton, { backgroundColor: colors.surface }]} />
          <View style={[styles.headerActionButton, { backgroundColor: colors.surface }]} />
          <View style={[styles.headerActionButton, { backgroundColor: colors.surface }]} />
        </View>
      </View>
    </View>
  );
}

export function BalanceHeader({ balance, currency, onPress }: BalanceHeaderProps) {
  const { t } = useLanguage();
  return (
    <Header
      title={t.app.name}
      subtitle={`${balance} ${currency}`}
      variant="gradient"
      // Icons removed; keep layout only
      style={styles.balanceHeader}
    />
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceHeader: {
    marginBottom: DesignSystem.spacing.sm,
  },
  // App Header Styles
  appHeaderContainer: {
    paddingTop: Platform.OS === 'ios' ? 80 : 20,
    paddingBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    ...DesignSystem.shadows.small,
    marginBottom: DesignSystem.spacing.md,
  },
  appHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appHeaderLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    fontWeight: '500',
  },
  appHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...DesignSystem.shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: DesignSystem.borderRadius.round,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});
