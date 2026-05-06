import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const LanguageSwitcher = ({ tone = 'light' }) => {
  const { t, language, setLanguage, languages } = useI18n();
  const chipClass = tone === 'dark' ? 'icon-chip icon-chip--dark' : 'icon-chip icon-chip--ghost';

  return (
    <details className="language-menu language-menu--app">
      <summary className={chipClass} aria-label={t('home.chooseLanguage')} title={t('home.chooseLanguage')}>
        <Globe size={18} />
      </summary>
      <div className="home-floating-panel home-floating-panel--language app-language-panel">
        <div className="home-panel__header">
          <strong>{t('home.language')}</strong>
        </div>
        <div className="language-menu__list">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`language-menu__item ${language === item.code ? 'is-active' : ''}`}
              onClick={() => setLanguage(item.code)}
            >
              <span>{item.nativeLabel}</span>
              <small>{item.label}</small>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
};

export default LanguageSwitcher;
