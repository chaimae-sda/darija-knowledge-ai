import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { mockDb, findUserById } from '../config/mockDb.js';

const router = express.Router();

// Get questions for a text
router.get('/text/:textId', authenticateToken, async (req, res) => {
  try {
    // Return mock questions for demo
    const questions = [
      { 
        _id: 'q1', 
        textId: req.params.textId, 
        questionText: "De quoi parle ce texte ?", 
        questionTextDarija: "علاش كيهضر هاد النص ؟", 
        correctAnswer: "Option A",
        options: ["Option A", "Option B", "Option C"],
        xpReward: 10
      }
    ];
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answer
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    
    // Simple mock logic
    const isCorrect = true; 
    const xpEarned = isCorrect ? 50 : 0;

    const user = findUserById(req.user.id);
    if (user) {
      user.xp += xpEarned;
      user.stats.quizzesPassed += 1;
      
      const newLevel = Math.floor(user.xp / 1000) + 1;
      user.level = newLevel;
    }

    res.json({
      isCorrect,
      correctAnswer: "Option A",
      xpEarned,
      totalXp: user?.xp || 0,
      level: user?.level || 1,
      message: 'Great job! ✅'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

