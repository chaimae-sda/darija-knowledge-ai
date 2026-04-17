// In-memory data storage for development/demo when MongoDB is not available
export const mockDb = {
  users: [
    {
      _id: 'test_user_id',
      username: 'Chaimae',
      email: 'test@example.com',
      password: 'password',
      avatar: '👧',
      level: 2,
      xp: 1250,
      booksRead: 5,
      badges: [
        { id: 'first_scan', name: 'Premier Scan', icon: '📸', color: '#5b67ca', unlockedAt: new Date() },
        { id: 'fast_reader', name: 'Lecteur Rapide', icon: '⚡', color: '#fbbf24', unlockedAt: new Date() }
      ],
      stats: {
        readingTime: 45,
        quizzesPassed: 3,
        bestStreak: 2
      }
    }
  ],
  texts: [
    {
      _id: 'text_1',
      title: 'Le Petit Prince - Introduction',
      originalText: "C'est ainsi que j'ai vécu seul, sans personne avec qui parler véritablement, jusqu'à une panne dans le désert du Sahara, il y a six ans. Quelque chose s'était cassé dans mon moteur.",
      darijaText: "هكدا عشت بوحدي، بلا ما نهضر مع حتى شي حد بصح، تال وقيتة فاش بقات بيا الطوموبيل فصحرا د سوس هادي ست سنين. شي حاجة تهرسات ليا فالموتور.",
      isFavorite: true,
      readCount: 12,
      source: 'upload',
      createdAt: new Date()
    },
    {
      _id: 'text_2',
      title: 'Histoire du Maroc',
      originalText: "Le Maroc est un pays situé au nord-ouest de l'Afrique. Il a une histoire riche et diversifiée.",
      darijaText: "لمغريب بلاد كاينة ف شمال لغرب ديال افريقيا. عندو تاريخ غني و منوع بزاف.",
      isFavorite: false,
      readCount: 5,
      source: 'scan',
      createdAt: new Date()
    }
  ],
  userProgress: []
};

// Helper methods to simulate Mongoose-like behavior
export const findUserById = (id) => mockDb.users.find(u => u._id === id);
export const findUserByEmail = (email) => mockDb.users.find(u => u.email === email);
export const addUser = (user) => {
  mockDb.users.push(user);
  return user;
};
export const getTexts = () => mockDb.texts;
export const getTextById = (id) => mockDb.texts.find(t => t._id === id);
