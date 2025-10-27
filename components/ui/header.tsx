import { Colors, DesignSystem } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  const getHeaderStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.md,
    };

    const variantStyles = {
      default: {
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
      },
      transparent: {
        backgroundColor: 'transparent',
      },
      gradient: {
        backgroundColor: Colors.light.primary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTitleStyle = () => {
    const baseStyle = {
      fontSize: 24,
      fontWeight: '700' as const,
      color: variant === 'gradient' ? '#FFFFFF' : Colors.light.text,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
    };

    return baseStyle;
  };

  const getSubtitleStyle = () => {
    return {
      fontSize: 14,
      fontWeight: '500' as const,
      color: variant === 'gradient' ? 'rgba(255, 255, 255, 0.8)' : Colors.light.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
      marginTop: DesignSystem.spacing.xs,
    };
  };

  const renderLeftButton = () => {
    if (showBackButton) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={variant === 'gradient' ? '#FFFFFF' : Colors.light.icon}
          />
        </TouchableOpacity>
      );
    }

    if (leftIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={leftIcon}
            size={24}
            color={variant === 'gradient' ? '#FFFFFF' : Colors.light.icon}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.iconButton} />;
  };

  const renderRightButton = () => {
    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={rightIcon}
            size={24}
            color={variant === 'gradient' ? '#FFFFFF' : Colors.light.icon}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.iconButton} />;
  };

  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar
        barStyle={variant === 'gradient' ? 'light-content' : 'dark-content'}
        backgroundColor={variant === 'gradient' ? Colors.light.primary : Colors.light.background}
      />
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

export function BalanceHeader({ balance, currency, onPress }: BalanceHeaderProps) {
  return (
    <Header
      title="MyMoney"
      subtitle={`${balance} ${currency}`}
      variant="gradient"
      rightIcon="eye"
      onRightPress={onPress}
      style={styles.balanceHeader}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
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
});
