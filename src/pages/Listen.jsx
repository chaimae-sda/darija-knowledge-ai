import React, { useEffect, useState } from 'react';
import { Headphones, Play, Search, Star } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../context/I18nContext';
import { apiClient } from '../services/apiService';

const Listen = ({ onSelectAudio }) => {
  const { t, formatDate } = useI18n();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getAudioStories();
        setStories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading audio stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="screen screen--listen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Module d'écoute</p>
          <h1>Histoires Audio</h1>
        </div>
        <LanguageSwitcher />
      </header>

      <div className="search-card">
        <Search size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une histoire..."
        />
      </div>

      <div className="listen-grid">
        {loading && <div className="empty-state">{t('library.loading')}</div>}
        
        {!loading && filteredStories.length === 0 && (
          <div className="empty-state">
            <strong>Aucune histoire trouvée</strong>
            <span>Reviens plus tard pour de nouveaux contenus.</span>
          </div>
        )}

        {!loading && filteredStories.map((story) => (
          <div key={story.id} className="audio-card-premium" onClick={() => onSelectAudio(story.id)}>
            <div className="audio-card-premium__image">
              {story.image_url ? (
                <img src={story.image_url} alt={story.title} />
              ) : (
                <div className="audio-card-premium__placeholder">
                  <Headphones size={32} />
                </div>
              )}
              <div className="audio-card-premium__play">
                <Play size={20} fill="currentColor" />
              </div>
            </div>
            <div className="audio-card-premium__content">
              <h3>{story.title}</h3>
              <p>{story.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Listen;
