import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { mockDb, findUserById } from '../config/mockDb.js';

const router = express.Router();

// Journey levels data
const JOURNEY_LEVELS = [
  { id: 1, name: 'Découverte', icon: '🔍', description: 'Découvrez les bases du Darija' },
  { id: 2, name: 'Apprenti', icon: '📚', description: 'Apprenez de nouveaux mots' },
  { id: 3, name: 'Curieux', icon: '🤔', description: 'Explorez la culture' },
  { id: 4, name: 'Savant', icon: '🧠', description: 'Maîtrisez la langue' },
  { id: 5, name: 'Maître', icon: '👑', description: 'Devenez expert en Darija' }
];

// Get journey progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Use user XP to calculate level
    let currentLevel = 0;
    if (user.xp >= 0) {
      currentLevel = Math.floor(user.xp / 500) + 1;
      if (currentLevel > JOURNEY_LEVELS.length) {
        currentLevel = JOURNEY_LEVELS.length;
      }
    }

    const levels = JOURNEY_LEVELS.map((level, index) => ({
      ...level,
      isUnlocked: index < currentLevel,
      isCurrentLevel: index + 1 === currentLevel,
      xpRequired: (level.id - 1) * 500,
      xpToNext: level.id * 500
    }));

    res.json({
      currentLevel,
      totalXp: user.xp,
      levels,
      nextLevelXp: (currentLevel + 1) * 500,
      xpProgress: user.xp % 500
    });
  } catch (error) {
    console.error('Journey Progress Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete level
router.post('/complete-level/:levelId', authenticateToken, async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Mock completing a level - give XP
    user.xp = (user.xp || 0) + 200;

    res.json({
      message: 'Level completed!',
      completedLevel: levelId,
      newXp: user.xp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
