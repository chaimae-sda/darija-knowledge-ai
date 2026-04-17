import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { mockDb, findUserById } from '../config/mockDb.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = mockDb.userProgress.find(p => p.userId === req.user.id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        booksRead: user.booksRead,
        badges: user.badges,
        stats: user.stats
      },
      progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user XP
router.post('/addxp', authenticateToken, async (req, res) => {
  try {
    const { xpAmount } = req.body;
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.xp += xpAmount;
    
    // Level up every 1000 XP
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    res.json({
      xp: user.xp,
      level: user.level,
      message: 'XP added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock badge
router.post('/badge', authenticateToken, async (req, res) => {
  try {
    const { badgeId, badgeName, badgeIcon, badgeColor } = req.body;
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const badgeExists = user.badges.some(b => b.id === badgeId);
    if (badgeExists) {
      return res.status(400).json({ error: 'Badge already unlocked' });
    }

    user.badges.push({
      id: badgeId,
      name: badgeName,
      icon: badgeIcon,
      color: badgeColor,
      unlockedAt: new Date()
    });

    res.json({ message: 'Badge unlocked', badges: user.badges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

