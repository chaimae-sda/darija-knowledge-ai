// AudioStory model using Supabase for Darija audio story library
import { 
  getAllAudioStories, 
  getAudioStoryById, 
  createAudioStory 
} from '../config/supabase.js';

const AudioStory = {
  /**
   * Find all audio stories
   */
  findAll: async () => {
    return await getAllAudioStories();
  },

  /**
   * Find an audio story by primary key (ID)
   */
  findByPk: async (id) => {
    return await getAudioStoryById(id);
  },

  /**
   * Create a new audio story
   */
  create: async (data) => {
    // Map camelCase to snake_case for Supabase if needed
    const payload = {
      title: data.title,
      description: data.description,
      image_url: data.imageUrl,
      audio_url: data.audioUrl,
      transcription: data.transcription,
      creator_id: data.creatorId
    };
    return await createAudioStory(payload);
  }
};

export default AudioStory;
