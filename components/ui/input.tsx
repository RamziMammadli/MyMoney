import { Colors, DesignSystem } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  autoCapitalize = 'none',
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    return {
      backgroundColor: Colors.light.background,
      borderWidth: 1,
      borderColor: error 
        ? Colors.light.error 
        : isFocused 
          ? Colors.light.primary 
          : Colors.light.border,
      borderRadius: DesignSystem.borderRadius.medium,
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: multiline ? DesignSystem.spacing.md : DesignSystem.spacing.sm,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      minHeight: multiline ? 80 : 48,
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: 16,
      fontWeight: '400',
      color: Colors.light.text,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
      ...(multiline && { textAlignVertical: 'top' }),
    };
  };

  const renderLeftIcon = () => {
    if (leftIcon) {
      return (
        <Ionicons
          name={leftIcon}
          size={20}
          color={isFocused ? Colors.light.primary : Colors.light.iconSecondary}
          style={styles.leftIcon}
        />
      );
    }
    return null;
  };

  const renderRightIcon = () => {
    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.rightIconContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color={isFocused ? Colors.light.primary : Colors.light.iconSecondary}
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={getContainerStyle()}>
        {renderLeftIcon()}
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textLight}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
        {renderRightIcon()}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

// Axtarış input komponenti
export interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
}

export function SearchInput({ 
  placeholder = "Axtarış...", 
  value, 
  onChangeText, 
  onClear,
  style 
}: SearchInputProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      leftIcon="search"
      rightIcon={value ? "close-circle" : undefined}
      onRightIconPress={onClear}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  leftIcon: {
    marginRight: DesignSystem.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: DesignSystem.spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: DesignSystem.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});
