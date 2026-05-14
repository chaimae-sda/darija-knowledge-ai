import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const router = express.Router();

// Initialize Google AI with the server-side key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MISTRAL_API_KEY = process.env.VITE_MISTRAL_API_KEY;

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * @route POST /api/ai/translate
 * @desc Proxy for Darija/English/French translation
 */
router.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const langName = targetLang === 'darija' ? 'Moroccan Darija (Arabic script)' : (targetLang === 'en' ? 'English' : 'French');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Translate the following text to ${langName}. Provide ONLY the translation:\n\n${text}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    res.json({ translation: translatedText.trim() });
  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback to Mistral if Gemini fails and target is Darija
    if (targetLang === 'darija' && MISTRAL_API_KEY) {
      try {
        const response = await axios.post(MISTRAL_URL, {
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: `Traduisez le texte français suivant en Darija authentique (caractères arabes). Uniquement la traduction:\n\n${text}` }],
          temperature: 0.3,
        }, {
          headers: { Authorization: `Bearer ${MISTRAL_API_KEY}` }
        });
        return res.json({ translation: response.data.choices[0].message.content.trim() });
      } catch (mistralError) {
        console.error('Mistral fallback failed:', mistralError);
      }
    }
    
    res.status(500).json({ error: 'Translation failed' });
  }
});

/**
 * @route POST /api/ai/summarize
 * @desc Proxy for text summarization
 */
router.post('/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Résumez le texte suivant de manière simple et pédagogique. 
IMPORTANT: Ne commencez PAS par "Résumé pour un enfant..." ou toute phrase similaire. Commencez directement par le résumé.
Fournissez le résumé en deux parties:
- D'abord en Français.
- Ensuite en Darija Marocain (caractères arabes).
Texte: ${text.slice(0, 5000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ summary: response.text().trim() });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

/**
 * @route POST /api/ai/quiz
 * @desc Proxy for quiz generation
 */
router.post('/quiz', async (req, res) => {
  const { title, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `Créez 5 questions de compréhension sur "${title}".
Texte: ${text.slice(0, 4000)}

Renvoyez uniquement un tableau JSON:
[{
  "questionTextFr": "...",
  "questionTextDarija": "...",
  "optionsFr": ["...", "...", "..."],
  "optionsDarija": ["...", "...", "..."],
  "correctIndex": 0,
  "xpReward": 30
}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const questions = JSON.parse(response.text());
    res.json({ questions });
  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Quiz generation failed' });
  }
});

/**
 * @route POST /api/ai/tts
 * @desc Proxy for Gemini TTS (AUDIO modality)
 */
router.post('/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    const response = await axios.post(endpoint, {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede" 
            }
          }
        }
      }
    });

    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find(p => p.inlineData && p.inlineData.data);
    const audioBase64 = audioPart?.inlineData?.data;

    if (!audioBase64) throw new Error('No audio data received');

    res.json({ audioBase64 });
  } catch (error) {
    console.error('TTS error:', error.response?.data || error.message);
    res.status(500).json({ error: 'TTS failed' });
  }
});

export default router;
