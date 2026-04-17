import React from 'react';
import { BookOpen, Gamepad2, Home, ScanLine, User } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const BottomNav = ({ activeTab, onTabChange }) => {
  const { t } = useI18n();
  const tabs = [
    { id: 'home', label: t('nav.home'), Icon: Home },
    { id: 'library', label: t('nav.library'), Icon: BookOpen },
    { id: 'scan', label: t('nav.scan'), Icon: ScanLine, isSpecial: true },
    { id: 'journey', label: t('nav.journey'), Icon: Gamepad2 },
    { id: 'profile', label: t('nav.profile'), Icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon, isSpecial }) => {
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            className={`bottom-nav__item ${isActive ? 'is-active' : ''} ${isSpecial ? 'is-special' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <span className="bottom-nav__icon">
              <Icon size={isSpecial ? 24 : 20} strokeWidth={isActive || isSpecial ? 2.4 : 2} />
            </span>
            {!isSpecial && <span className="bottom-nav__label">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
