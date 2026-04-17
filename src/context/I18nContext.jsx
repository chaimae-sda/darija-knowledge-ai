import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DATE_LOCALES, SUPPORTED_LANGUAGES, translations } from '../i18n/translations';

const LANGUAGE_STORAGE_KEY = 'darija.app.language';

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return translations[saved] ? saved : 'fr';
  } catch {
    return 'fr';
  }
};

const resolveValue = (language, path) => {
  const segments = path.split('.');
  let value = translations[language];

  for (const segment of segments) {
    value = value?.[segment];
  }

  return value;
};

export const I18nContext = createContext({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
  formatDate: (value) => value,
  languages: SUPPORTED_LANGUAGES,
});

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === 'darija' ? 'ar' : language;
    document.documentElement.dir = language === 'darija' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo(() => {
    const t = (key, params = {}) => {
      const template = resolveValue(language, key) ?? resolveValue('fr', key) ?? key;

      if (typeof template !== 'string') {
        return template;
      }

      return Object.entries(params).reduce(
        (message, [param, replacement]) => message.replaceAll(`{${param}}`, String(replacement)),
        template,
      );
    };

    const formatDate = (value, options = {}) =>
      new Date(value).toLocaleDateString(DATE_LOCALES[language] || 'fr-FR', options);

    return {
      language,
      setLanguage,
      t,
      formatDate,
      languages: SUPPORTED_LANGUAGES,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
