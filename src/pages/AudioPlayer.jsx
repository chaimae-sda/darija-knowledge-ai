import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Maximize2, Pause, Play, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../context/I18nContext';
import { apiClient } from '../services/apiService';

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const AudioPlayer = ({ storyId, onBack }) => {
  const { t } = useI18n();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  
  const audioRef = useRef(new Audio());
  const timelineTrackRef = useRef(null);

  useEffect(() => {
    const loadStory = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getAudioStory(storyId);
        setStory(data);
        if (data.audio_url) {
          audioRef.current.src = data.audio_url;
        }
      } catch (error) {
        console.error('Error loading story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();

    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, [storyId]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress({
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeekBy = (delta) => {
    audioRef.current.currentTime = Math.min(
      Math.max(audioRef.current.currentTime + delta, 0),
      audioRef.current.duration || 0
    );
  };

  const handleTimelineSeek = (event) => {
    if (!timelineTrackRef.current || !audioRef.current.duration) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = audioRef.current.duration * Math.min(Math.max(percent, 0), 1);
  };

  if (loading) {
    return <div className="page-feedback">{t('common.loading')}</div>;
  }

  if (!story) {
    return <div className="page-feedback">Story not found.</div>;
  }

  const timelineProgress = `${(progress.currentTime / (progress.duration || 1)) * 100}%`;

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(story.audio_url);

  return (
    <section className="audio-screen">
      <header className="screen-header screen-header--overlay">
        <button type="button" className="icon-chip icon-chip--dark" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <h2>{t('library.sections.audio')}</h2>
        <LanguageSwitcher tone="dark" />
      </header>

      <div className="audio-artwork">
        {youtubeId ? (
          <div className="youtube-container youtube-container--hero">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="youtube-iframe"
            ></iframe>
          </div>
        ) : (
          <>
            {story.image_url ? (
              <img src={story.image_url} alt={story.title} className="audio-artwork__img" />
            ) : (
              <div className="audio-artwork__placeholder">
                <Volume2 size={48} />
              </div>
            )}
            <div className={`audio-artwork__halo ${isPlaying ? 'is-playing' : ''}`} />
          </>
        )}
      </div>

      <div className="audio-meta">
        <strong>{story.title}</strong>
        <p>{story.description}</p>
      </div>

      {!youtubeId && (
        <>
          <div className="wave-strip" aria-hidden="true">
            {Array.from({ length: 32 }).map((_, index) => (
              <span
                key={index}
                className={`wave-strip__bar ${isPlaying ? 'is-playing' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.05}s`, 
                  height: `${12 + Math.random() * 24}px`,
                  opacity: isPlaying ? 1 : 0.3
                }}
              />
            ))}
          </div>

          <div className="audio-timeline">
            <span>{formatTime(progress.currentTime)}</span>
            <button
              type="button"
              className="audio-timeline__track"
              ref={timelineTrackRef}
              onClick={handleTimelineSeek}
            >
              <div className="audio-timeline__progress" style={{ width: timelineProgress }} />
            </button>
            <span>{formatTime(progress.duration)}</span>
          </div>

          <div className="audio-controls">
            <button type="button" className="icon-chip icon-chip--dark" onClick={() => handleSeekBy(-10)}>
              <RotateCcw size={20} />
            </button>
            <button type="button" className="play-button" onClick={togglePlay}>
              {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
            </button>
            <button type="button" className="icon-chip icon-chip--dark" onClick={() => handleSeekBy(10)}>
              <RotateCw size={20} />
            </button>
          </div>
        </>
      )}

      <div className="audio-actions">
        {youtubeId && (
          <a 
            href={story.audio_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-pill action-pill--youtube"
          >
            <Play size={16} />
            <span>Ouvrir sur YouTube</span>
          </a>
        )}
        <button type="button" className="action-pill">
            <Maximize2 size={16} />
            <span>Transcription</span>
        </button>
      </div>
    </section>
  );
};

export default AudioPlayer;
