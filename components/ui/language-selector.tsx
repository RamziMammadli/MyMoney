import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/constants/theme';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useThemedColors } from '@/hooks/useThemedStyles';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const colors = useThemedColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const handleSelectLanguage = async (lang: Language) => {
    await setLanguage(lang);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.profile.language}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  language === lang.code && styles.languageItemSelected,
                ]}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <View style={styles.languageLeft}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      language === lang.code && styles.languageNameSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </View>
                {language === lang.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ReturnType<typeof useThemedColors>) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: DesignSystem.borderRadius.large,
    width: '85%',
    maxWidth: 400,
    ...DesignSystem.shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Inter',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    padding: DesignSystem.spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.medium,
    marginBottom: DesignSystem.spacing.sm,
    backgroundColor: colors.surface,
  },
  languageItemSelected: {
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 28,
    marginRight: DesignSystem.spacing.md,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Inter',
  },
  languageNameSelected: {
    color: colors.primary,
  },
});

