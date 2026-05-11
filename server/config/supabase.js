import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key (for backend operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured');
  console.warn('Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
    }
    return data;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
    }
    return data;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

/**
 * Create new user profile
 */
export const createUserProfile = async (userId, email, username) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        username,
        avatar: '👧',
        level: 1,
        xp: 0,
        badges: [],
        stats: {
          readingTime: 0,
          quizzesPassed: 0,
          bestStreak: 0
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};

/**
 * Update user stats
 */
export const updateUserStats = async (userId, updates) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in updateUserStats:', error);
    return null;
  }
};

/**
 * Get user texts
 */
export const getUserTexts = async (userId) => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('texts')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching texts:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error in getUserTexts:', error);
    return [];
  }
};

/**
 * Create text
 */
export const createText = async (userId, textData) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('texts')
      .insert({
        owner_id: userId,
        ...textData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating text:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in createText:', error);
    return null;
  }
};

/**
 * Get text by ID
 */
export const getTextById = async (textId) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('texts')
      .select('*')
      .eq('id', textId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching text:', error);
    }
    return data;
  } catch (error) {
    console.error('Error in getTextById:', error);
    return null;
  }
};

/**
 * Check if Supabase is connected
 */
export const isSupabaseConnected = () => supabase !== null;

/**
 * Get all audio stories
 */
export const getAllAudioStories = async () => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('audio_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audio stories:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error in getAllAudioStories:', error);
    return [];
  }
};

/**
 * Get audio story by ID
 */
export const getAudioStoryById = async (id) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('audio_stories')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching audio story:', error);
    }
    return data;
  } catch (error) {
    console.error('Error in getAudioStoryById:', error);
    return null;
  }
};

/**
 * Create audio story
 */
export const createAudioStory = async (storyData) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('audio_stories')
      .insert(storyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating audio story:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in createAudioStory:', error);
    return null;
  }
};
