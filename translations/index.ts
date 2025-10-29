import { az } from './az';
import { en } from './en';
import { ru } from './ru';

export type TranslationKeys = typeof az;
export type Language = 'az' | 'ru' | 'en';

export const translations = {
  az,
  ru,
  en,
};

export const getTranslations = (language: Language): TranslationKeys => {
  return translations[language];
};

