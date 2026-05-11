import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, HelpCircle, Sparkles, Trophy, XCircle } from 'lucide-react';
import { apiClient } from '../services/apiService';
import { useI18n } from '../context/I18nContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Quiz = ({ textId, onBack }) => {
  const { t, language } = useI18n();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: questions, 2: results
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getQuizQuestions(textId);
        setQuestions(data);
      } catch (error) {
        console.error('Failed to load quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [textId]);

  const handleAnswer = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    if (index === currentQuestion.correctIndex) {
      setScore(s => s + 1);
      setEarnedXp(x => x + (currentQuestion.xpReward || 20));
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setCurrentStep(2);
    if (earnedXp > 0) {
      await apiClient.addXP(earnedXp);
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading__spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-feedback">
        <HelpCircle size={48} />
        <p>Désolé, aucun quiz n'a pu être généré pour ce texte.</p>
        <button className="action-button" onClick={onBack}>Retour</button>
      </div>
    );
  }

  // Intro Step
  if (currentStep === 0) {
    return (
      <section className="quiz-screen quiz-screen--intro">
        <header className="screen-header">
          <button className="icon-chip" onClick={onBack}><ChevronLeft size={20} /></button>
          <h2>Quiz IA</h2>
          <LanguageSwitcher />
        </header>

        <div className="quiz-intro-content">
          <div className="quiz-icon-hero">
            <Sparkles size={48} className="sparkle-anim" />
          </div>
          <h1>Prêt pour le défi ?</h1>
          <p>Testez votre compréhension du texte avec ce quiz généré par IA.</p>
          
          <div className="quiz-stats-mini">
            <div className="mini-stat">
              <strong>{questions.length}</strong>
              <span>Questions</span>
            </div>
            <div className="mini-stat">
              <strong>+{questions.length * 30}</strong>
              <span>XP Max</span>
            </div>
          </div>

          <button className="action-button action-button--primary" onClick={() => setCurrentStep(1)}>
            Commencer le Quiz
          </button>
        </div>
      </section>
    );
  }

  // Quiz Step
  if (currentStep === 1) {
    const currentQuestion = questions[currentIndex];
    const isDarija = language === 'darija';
    const questionText = isDarija ? currentQuestion.questionTextDarija : currentQuestion.questionTextFr;
    const options = isDarija ? currentQuestion.optionsDarija : currentQuestion.optionsFr;

    return (
      <section className="quiz-screen">
        <header className="quiz-progress">
          <div className="quiz-progress__meta" style={{ marginBottom: '12px' }}>
            <span>Question {currentIndex + 1}/{questions.length}</span>
            <LanguageSwitcher />
            <strong>Score: {score}</strong>
          </div>
          <div className="quiz-progress__track">
            <div 
              className="quiz-progress__bar" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
            />
          </div>
        </header>

        <div className="quiz-body">
          <h2 className={isDarija ? 'text-darija' : ''}>{questionText}</h2>

          <div className="quiz-options">
            {options.map((option, idx) => {
              let statusClass = '';
              if (isAnswered) {
                if (idx === currentQuestion.correctIndex) statusClass = 'is-correct';
                else if (idx === selectedOption) statusClass = 'is-wrong';
              }

              return (
                <button
                  key={idx}
                  className={`quiz-option ${selectedOption === idx ? 'is-selected' : ''} ${statusClass} ${isDarija ? 'text-darija' : ''}`}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                >
                  <span className="quiz-option__dot">{String.fromCharCode(65 + idx)}</span>
                  <span className="quiz-option__text">{option}</span>
                  {statusClass === 'is-correct' && <CheckCircle2 size={20} className="status-icon" style={{ marginLeft: 'auto' }} />}
                  {statusClass === 'is-wrong' && <XCircle size={20} className="status-icon" style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        </div>

        <footer className="quiz-footer">
          {isAnswered && (
            <button className="action-button action-button--primary" onClick={nextQuestion}>
              {currentIndex < questions.length - 1 ? 'Suivant' : 'Voir les résultats'}
            </button>
          )}
        </footer>
      </section>
    );
  }

  // Results Step
  return (
    <section className="quiz-screen quiz-screen--results">
      <div className="results-content">
        <div className="results-trophy">
          <Trophy size={64} color="#f59e0b" />
        </div>
        <h1>Félicitations !</h1>
        <p>Vous avez terminé le quiz avec succès.</p>

        <div className="results-summary">
          <div className="result-item">
            <span>Score</span>
            <strong>{score} / {questions.length}</strong>
          </div>
          <div className="result-item">
            <span>XP Gagnés</span>
            <strong>+{earnedXp} XP</strong>
          </div>
        </div>

        <button className="action-button action-button--primary" onClick={onBack}>
          Retour à la lecture
        </button>
      </div>
    </section>
  );
};

export default Quiz;
