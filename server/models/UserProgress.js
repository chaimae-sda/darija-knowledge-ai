import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedQuestions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    isCorrect: Boolean,
    timestamp: Date,
    xpEarned: Number
  }],
  readTexts: [{
    textId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Text'
    },
    readAt: Date,
    readDuration: Number // in minutes
  }],
  totalXpEarned: {
    type: Number,
    default: 0
  },
  journeyProgress: {
    currentLevel: {
      type: Number,
      default: 0
    },
    completedLevels: [Number]
  },
  lastActivityAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('UserProgress', userProgressSchema);
