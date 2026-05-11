// Routes for Darija audio story library
import express from 'express';
import AudioStory from '../models/AudioStory.js';

const router = express.Router();

/**
 * Get all audio stories (public)
 */
router.get('/', async (req, res) => {
  try {
    const stories = await AudioStory.findAll();
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

/**
 * Get a single audio story by ID (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const story = await AudioStory.findByPk(req.params.id);
    if (!story) return res.status(404).json({ error: 'Not found' });
    res.json(story);
  } catch (err) {
    console.error('Error fetching story:', err);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

/**
 * Upload a new audio story (background/admin/creator only)
 * For now, no authentication required for simpler backend ingestion
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, audioUrl, transcription, creatorId } = req.body;
    
    if (!title || !audioUrl) {
      return res.status(400).json({ error: 'Title and audioUrl required' });
    }

    const story = await AudioStory.create({ 
      title, 
      description, 
      imageUrl, 
      audioUrl, 
      transcription, 
      creatorId 
    });

    res.status(201).json(story);
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

export default router;
