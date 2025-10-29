import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { getTranslations, Language, TranslationKeys } from '@/translations';

export type Currency = 'AZN' | 'USD' | 'RUB' | 'TRY';

export const currencySymbols: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  RUB: '₽',
  TRY: '₺',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  currency: Currency;
  setCurrency: (curr: Currency) => Promise<void>;
  currencySymbol: string;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';
const CURRENCY_STORAGE_KEY = '@app_currency';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('az');
  const [currency, setCurrencyState] = useState<Currency>('AZN');
  const [t, setT] = useState<TranslationKeys>(getTranslations('az'));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'az' || savedLanguage === 'ru' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
        setT(getTranslations(savedLanguage as Language));
      }

      const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency && (savedCurrency === 'AZN' || savedCurrency === 'USD' || savedCurrency === 'RUB' || savedCurrency === 'TRY')) {
        setCurrencyState(savedCurrency as Currency);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
      setT(getTranslations(lang));
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const setCurrency = async (curr: Currency) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, curr);
      setCurrencyState(curr);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const currencySymbol = currencySymbols[currency];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currency, setCurrency, currencySymbol, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

