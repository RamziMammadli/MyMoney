/**
 * Cüzdan App - Ağ + Mavi Konsept Rəng Palitrası
 * Modern FinTech dizaynı üçün optimallaşdırılmış rəng sistemi
 */

import { Platform } from 'react-native';

// Ağ + Mavi konseptinə əsaslanan rəng palitrası
export const WalletColors = {
  // Primary colors
  trustBlue: '#1E88E5',        // Əsas mavi - etibar və balans
  skyBlue: '#90CAF9',          // Açıq mavi - sakitlik və modernlik
  cleanWhite: '#FFFFFF',       // Əsas fon - minimal və geniş məkan
  mistGray: '#F6F7FB',         // Kart və bölmə arxa planları
  energyYellow: '#FFC107',     // Accent - "Pay", "Top Up" düymələri
  graphiteBlue: '#2C3E50',     // Mətn və ikonlar - dərinlik və kontrast
  coolGray: '#DCE1E9',         // Sərhədlər və ayırıcılar
  
  // Gradient colors
  skyTrustGradient: ['#90CAF9', '#1E88E5'],
  whiteGlassGradient: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'],
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export const Colors = {
  light: {
    // Primary colors
    primary: WalletColors.trustBlue,
    secondary: WalletColors.skyBlue,
    accent: WalletColors.energyYellow,
    
    // Background colors
    background: WalletColors.cleanWhite,
    surface: WalletColors.mistGray,
    card: WalletColors.mistGray,
    
    // Text colors
    text: WalletColors.graphiteBlue,
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    
    // UI elements
    border: WalletColors.coolGray,
    divider: WalletColors.coolGray,
    icon: WalletColors.graphiteBlue,
    iconSecondary: '#6B7280',
    
    // Tab navigation
    tabIconDefault: '#6B7280',
    tabIconSelected: WalletColors.trustBlue,
    tint: WalletColors.trustBlue,
    
    // Status colors
    success: WalletColors.success,
    warning: WalletColors.warning,
    error: WalletColors.error,
    info: WalletColors.info,
  },
  dark: {
    // Primary colors
    primary: WalletColors.trustBlue,
    secondary: WalletColors.skyBlue,
    accent: WalletColors.energyYellow,
    
    // Background colors
    background: '#1A1A1A',
    surface: '#2A2A2A',
    card: '#2A2A2A',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textLight: '#808080',
    
    // UI elements
    border: '#404040',
    divider: '#404040',
    icon: '#FFFFFF',
    iconSecondary: '#B0B0B0',
    
    // Tab navigation
    tabIconDefault: '#808080',
    tabIconSelected: WalletColors.trustBlue,
    tint: WalletColors.trustBlue,
    
    // Status colors
    success: WalletColors.success,
    warning: WalletColors.warning,
    error: WalletColors.error,
    info: WalletColors.info,
  },
};

// Font sistemi - San Francisco və modern fontlar
export const Fonts = Platform.select({
  ios: {
    /** iOS San Francisco font sistemi */
    primary: 'SF Pro Display',
    secondary: 'SF Pro Text',
    rounded: 'SF Pro Rounded',
    mono: 'SF Mono',
  },
  default: {
    primary: 'Inter',
    secondary: 'Inter',
    rounded: 'Inter',
    mono: 'monospace',
  },
  web: {
    primary: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    secondary: "'SF Pro Text', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    rounded: "'SF Pro Rounded', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
  },
});

// Dizayn konstantları
export const DesignSystem = {
  // Border radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    round: 50,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Shadow styles
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
};
