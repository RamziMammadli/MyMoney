import { DesignSystem, WalletColors } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedStyles';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const colors = useThemedColors();
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: DesignSystem.borderRadius.medium,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...DesignSystem.shadows.small,
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: DesignSystem.spacing.md,
        paddingVertical: DesignSystem.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: DesignSystem.spacing.lg,
        paddingVertical: DesignSystem.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: DesignSystem.spacing.xl,
        paddingVertical: DesignSystem.spacing.lg,
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.secondary,
      },
      accent: {
        backgroundColor: colors.accent,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
      fontWeight: '600',
    };

    const sizeTextStyles = {
      small: {
        fontSize: 14,
        lineHeight: 20,
      },
      medium: {
        fontSize: 16,
        lineHeight: 24,
      },
      large: {
        fontSize: 18,
        lineHeight: 28,
      },
    };

    const variantTextStyles = {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: '#FFFFFF',
      },
      accent: {
        color: colors.text,
      },
      outline: {
        color: colors.primary,
      },
      ghost: {
        color: colors.primary,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
        />
      );
    }

    return (
      <>
        {icon && <>{icon}</>}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </>
    );
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={WalletColors.skyTrustGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
