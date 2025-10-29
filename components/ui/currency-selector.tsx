import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystem } from '@/constants/theme';
import { Currency, currencySymbols, useLanguage } from '@/contexts/LanguageContext';
import { useThemedColors } from '@/hooks/useThemedStyles';

interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
}

export function CurrencySelector({ visible, onClose }: CurrencySelectorProps) {
  const { currency, setCurrency, t } = useLanguage();
  const colors = useThemedColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const currencies: { code: Currency; name: string; flag: string }[] = [
    { code: 'AZN', name: t.currency.azn, flag: '🇦🇿' },
    { code: 'USD', name: t.currency.usd, flag: '🇺🇸' },
    { code: 'RUB', name: t.currency.rub, flag: '🇷🇺' },
    { code: 'TRY', name: t.currency.try, flag: '🇹🇷' },
  ];

  const handleSelectCurrency = async (curr: Currency) => {
    await setCurrency(curr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.currency.selectCurrency}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {currencies.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[
                styles.currencyItem,
                currency === curr.code && styles.currencyItemSelected,
              ]}
              onPress={() => handleSelectCurrency(curr.code)}
            >
              <View style={styles.currencyLeft}>
                <Text style={styles.currencyFlag}>{curr.flag}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>
                    {curr.code} ({currencySymbols[curr.code]})
                  </Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                </View>
              </View>
              {currency === curr.code && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors: ReturnType<typeof useThemedColors>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.lg,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: DesignSystem.borderRadius.medium,
    marginBottom: DesignSystem.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: DesignSystem.spacing.md,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
});

