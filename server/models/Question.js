import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  textId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Text',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionTextDarija: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isDarija: Boolean
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  xpReward: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Question', questionSchema);
