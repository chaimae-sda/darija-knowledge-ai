export const libraryService = {
  getResources: (t) => [
    {
      id: 'stories',
      icon: '📚',
      color: '#6d46df',
      title: t('library.resources.stories.title'),
      description: t('library.resources.stories.description'),
      links: [
        { name: 'StoryWeaver', url: 'https://storyweaver.org.in/' },
        { name: 'Il était une histoire', url: 'https://www.iletaitunehistoire.com/' },
      ],
    },
    {
      id: 'playful-learning',
      icon: '🧠',
      color: '#10b981',
      title: t('library.resources.playfulLearning.title'),
      description: t('library.resources.playfulLearning.description'),
      links: [
        { name: 'TelmidTICE', url: 'https://telmidtice.men.gov.ma/' },
        { name: 'Logicieleducatif', url: 'https://www.logicieleducatif.fr/' },
        { name: 'Ortholud', url: 'https://www.ortholud.com/' },
      ],
    },
    {
      id: 'moroccan-culture',
      icon: '🏺',
      color: '#f59e0b',
      title: t('library.resources.moroccanCulture.title'),
      description: t('library.resources.moroccanCulture.description'),
      links: [
        { name: 'Ministère de la Culture', url: 'https://www.culture.ma/' },
        { name: 'Bibliotheque nationale du Royaume du Maroc', url: 'https://bnrm.ma/' },
        { name: 'Fondation Nationale des Musées', url: 'https://www.fnm.ma/' },
      ],
    },
    {
      id: 'games',
      icon: '🎮',
      color: '#ef4444',
      title: t('library.resources.games.title'),
      description: t('library.resources.games.description'),
      links: [
        { name: 'TV5MONDE Langue francaise', url: 'https://langue-francaise.tv5monde.com/' },
        { name: 'Lumni', url: 'https://www.lumni.fr/' },
      ],
    },
  ],
};
