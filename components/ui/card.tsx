import { Colors, DesignSystem, WalletColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export type CardVariant = 'default' | 'glass' | 'gradient' | 'elevated';
export type CardSize = 'small' | 'medium' | 'large';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  padding?: keyof typeof DesignSystem.spacing;
}

export function Card({
  children,
  variant = 'default',
  size = 'medium',
  style,
  onPress,
  disabled = false,
  padding = 'md',
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: DesignSystem.borderRadius.large,
      overflow: 'hidden',
    };

    // Size styles
    const sizeStyles = {
      small: {
        padding: DesignSystem.spacing.sm,
      },
      medium: {
        padding: DesignSystem.spacing.md,
      },
      large: {
        padding: DesignSystem.spacing.lg,
      },
    };

    // Variant styles
    const variantStyles = {
      default: {
        backgroundColor: Colors.light.card,
        ...DesignSystem.shadows.small,
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...DesignSystem.shadows.medium,
      },
      gradient: {
        backgroundColor: 'transparent',
        ...DesignSystem.shadows.medium,
      },
      elevated: {
        backgroundColor: Colors.light.card,
        ...DesignSystem.shadows.large,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const renderCardContent = () => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={WalletColors.whiteGlassGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    return null;
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {renderCardContent()}
      <View style={{ padding: DesignSystem.spacing[padding] }}>
        {children}
      </View>
    </CardComponent>
  );
}

// Balans kartı üçün xüsusi komponent
export interface BalanceCardProps {
  balance: string;
  currency: string;
  accountName: string;
  onPress?: () => void;
}

export function BalanceCard({ balance, currency, accountName, onPress }: BalanceCardProps) {
  return (
    <Card variant="gradient" size="large" onPress={onPress} style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.accountName}>{accountName}</Text>
        <Text style={styles.currency}>{currency}</Text>
      </View>
      <View style={styles.balanceAmount}>
        <Text style={styles.balanceText}>{balance}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    marginHorizontal: DesignSystem.spacing.md,
    marginVertical: DesignSystem.spacing.sm,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  currency: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  balanceAmount: {
    alignItems: 'flex-start',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
});
