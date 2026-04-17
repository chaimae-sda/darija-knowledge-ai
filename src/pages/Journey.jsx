import React, { useContext, useEffect, useState } from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { apiClient } from '../services/apiService';

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

const Journey = ({ onBack, onStartQuiz }) => {
  const { user } = useContext(AuthContext);
  const { t } = useI18n();
  const [journeyData, setJourneyData] = useState(null);
  const [texts, setTexts] = useState([]);
  const nodes = t('journey.nodes').map((label, index) => ({
    id: index + 1,
    label,
    top: ['25%', '40%', '48%', '63%', '77%'][index],
    left: ['48%', '24%', '56%', '24%', '57%'][index],
  }));

  useEffect(() => {
    const loadData = async () => {
      const [progress, libraryTexts] = await Promise.all([apiClient.getJourneyProgress(), apiClient.getTexts()]);
      setJourneyData(progress);
      setTexts(Array.isArray(libraryTexts) ? libraryTexts : []);
    };

    loadData();
  }, [user?.xp]);

  const handleNodeClick = (levelId, isUnlocked) => {
    if (!isUnlocked || texts.length === 0 || !onStartQuiz) {
      return;
    }

    const text = texts[(levelId - 1) % texts.length];
    onStartQuiz(text._id);
  };

  if (!journeyData) {
    return <div className="page-feedback">{t('journey.loading')}</div>;
  }

  return (
    <section className="journey-screen">
      <header className="journey-screen__header">
        <button type="button" className="icon-chip icon-chip--dark" onClick={onBack}>
          <ChevronLeft size={18} />
        </button>
        <h2>{t('journey.title')}</h2>
        <button type="button" className="icon-chip icon-chip--dark">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className="journey-profile">
        <div className="journey-profile__user">
          <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'Chaimae'}`} alt={user?.username} />
          <div>
            <span>{t('journey.currentLevel')}</span>
            <strong>{journeyData.levelName || user?.levelName || t('journey.explorer')}</strong>
          </div>
        </div>
        <div className="journey-profile__xp">
          <span>{t('journey.xp')}</span>
          <strong>{user?.xp || 0}</strong>
        </div>
      </div>

      <div className="journey-map">
        <img src={assetUrl('journey_map.png')} alt={t('journey.mapAlt')} className="journey-map__image" />
        {nodes.map((node, index) => {
          const currentLevel = journeyData.currentLevel;
          const isComplete = index + 1 < currentLevel;
          const isCurrent = index + 1 === currentLevel;
          const isUnlocked = isComplete || isCurrent;

          return (
            <button
              key={node.id}
              type="button"
              className={`journey-node ${isComplete ? 'is-complete' : ''} ${isCurrent ? 'is-current' : ''} ${!isUnlocked ? 'is-locked' : ''}`}
              style={{ top: node.top, left: node.left }}
              onClick={() => handleNodeClick(node.id, isUnlocked)}
            >
              <span className="journey-node__bubble">{isUnlocked ? node.id : '🔒'}</span>
              <span className="journey-node__label">{node.label}</span>
            </button>
          );
        })}

        <div className="journey-treasure">🎁</div>
      </div>
    </section>
  );
};

export default Journey;
