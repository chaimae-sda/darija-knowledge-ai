import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { mockDb, getTexts, getTextById } from '../config/mockDb.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Save text (from upload/scan)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { title, originalText, darijaText, language = 'fr', source = 'upload' } = req.body;

    const text = {
      _id: Date.now().toString(),
      userId: req.user.id,
      title,
      originalText,
      darijaText,
      language,
      source,
      readCount: 0,
      isFavorite: false,
      createdAt: new Date()
    };

    mockDb.texts.push(text);

    res.status(201).json({
      message: 'Text saved successfully',
      text,
      questionsGenerated: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user texts
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const texts = mockDb.texts.filter(t => t.userId === req.user.id);
    res.json(texts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single text
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const text = getTextById(req.params.id);
    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    if (text.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    text.readCount = (text.readCount || 0) + 1;

    res.json(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const text = getTextById(req.params.id);
    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    if (text.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    text.isFavorite = !text.isFavorite;

    res.json({ message: 'Favorite toggled', isFavorite: text.isFavorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Translate text to Darija
router.post('/translate', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.startsWith('AQ.')) {
        return res.json({ translated: "هذا نص تجريبي (ترجمة موك لأن مفتاح API غير مضبوط)" });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`
      Translate the following text to Moroccan Darija Arabic. Keep the meaning and be natural.
      Text: ${text}
      
      Response should be ONLY the translated text, nothing else.
    `);

    const translatedText = result.response.text().trim();
    res.json({ translated: translatedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OCR and Smart Translation (no auth required - OCR is preliminary step before saving)
router.post('/ocr', async (req, res) => {
  try {
    const { image, mimeType = 'image/jpeg' } = req.body;

    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.startsWith('AQ.')) {
      return res.json({
        title: "Document Scanné",
        originalText: "L'intelligence artificielle transforme notre façon d'apprendre.",
        darijaText: "الذكاء الاصطناعي كيبدل الطريقة باش كنتعلمو."
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are an expert OCR and Moroccan Darija translator. 
      Analyze the provided image(s). 
      1. Extract all the text from the image accurately.
      2. Detect the language (usually French or Arabic).
      3. Translate it perfectly into natural Moroccan Darija.
      4. Provide a short relevant title for this content.

      Return ONLY a JSON object with this structure:
      {
        "title": "...",
        "originalText": "...",
        "darijaText": "..."
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    // Clean JSON response from Gemini
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanedJson);

    res.json(data);
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;

