const GAME_DATA_KEY = 'darija_knowledge_game_data';

const initialData = {
  xp: 1200,
  level: 2,
  levelName: 'Explorateur',
  booksRead: 8,
  badges: [
    { id: 'first_step', name: 'Premier pas', icon: '⭐', color: '#fbbf24' },
    { id: 'pages_10', name: '10 pages', icon: '📖', color: '#60a5fa' },
    { id: 'quiz_master', name: 'Quiz master', icon: '🏆', color: '#f87171' },
    { id: 'regular', name: 'Régulier', icon: '🔥', color: '#fb923c' }
  ],
  stats: {
    readingTime: '5h 30m',
    quizzesPassed: 18,
    bestStreak: '7 jours'
  }
};

const listeners = new Set();

export const gameService = {
  getData: () => {
    const saved = localStorage.getItem(GAME_DATA_KEY);
    return saved ? JSON.parse(saved) : initialData;
  },
  
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify: () => {
    const data = gameService.getData();
    listeners.forEach(l => l(data));
  },
  
  addXp: (amount) => {
    const data = gameService.getData();
    data.xp += amount;
    
    const nextLevelXp = data.level * 1000;
    if (data.xp >= nextLevelXp) {
      data.level += 1;
      if (data.level === 3) data.levelName = 'Savant';
    }
    
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(data));
    gameService.notify();
    return data;
  },

  getSkills: () => [
    { id: 1, name: 'Découverte', status: 'completed' },
    { id: 2, name: 'Apprenti', status: 'completed' },
    { id: 3, name: 'Curieux', status: 'current' },
    { id: 4, name: 'Savant', status: 'locked' },
    { id: 5, name: 'Maître', status: 'locked' }
  ]
};
