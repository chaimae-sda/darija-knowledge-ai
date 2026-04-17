import mongoose from 'mongoose';

const textSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  darijaText: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['fr', 'en', 'ar'],
    default: 'fr'
  },
  source: {
    type: String,
    enum: ['upload', 'scan', 'manual'],
    default: 'upload'
  },
  audioUrl: String,
  readCount: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Text', textSchema);
