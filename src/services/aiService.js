const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const MISTRAL_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MY_MEMORY_API = 'https://api.mymemory.translated.net/get';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Darija Heuristic Layer
 */
const darijaDictionary = {
  ماذا: 'شنو', علاش: 'علاش', كيف: 'كيفاش', فين: 'فين', فوكاش: 'فوكاش', شكون: 'شكون',
  الآن: 'دابا', اليوم: 'ليوم', غدا: 'غدا', أمس: 'البارح', جيد: 'مزيان', كثير: 'بزاف', قليل: 'شويا', نعم: 'آه', لا: 'لا',
  أريد: 'بغيت', أعرف: 'عارف', أفعل: 'كانصاوب', أذهب: 'غادي', أكل: 'كاناكل', شرب: 'شرب', رأيت: 'شفت', قلت: 'قلت',
};

const refineToDarija = (text) => {
  let refined = text;
  Object.keys(darijaDictionary).forEach((classic) => {
    const regex = new RegExp(`\\b${classic}\\b`, 'g');
    refined = refined.replace(regex, darijaDictionary[classic]);
  });
  refined = refined.replace(/ي([أ-ي]{2,})/g, 'كي$1');
  refined = refined.replace(/أت([أ-ي]{2,})/g, 'كانت$1');
  refined = refined.replace(/ة\b/g, 'ا');
  refined = refined.replace(/لم /g, 'ما ');
  return refined;
};

export const aiService = {
  translate: async (text, targetLang = 'darija') => {
    if (!text || text.trim().length === 0) return '';
    if (targetLang === 'fr') return text;

    if (GOOGLE_API_KEY) {
      const models = ['gemini-1.5-flash', 'gemini-2.0-flash'];
      for (const modelName of models) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GOOGLE_API_KEY}`;
          const langName = targetLang === 'darija' ? 'Moroccan Darija (Arabic script)' : (targetLang === 'en' ? 'English' : 'French');
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Translate the following text to ${langName}. Provide ONLY the translation:\n\n${text}` }] }],
              generationConfig: { temperature: 0.2 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (translated) return translated.trim();
          }
        } catch (e) { console.warn(`Gemini translation failed`, e); }
      }
    }

    if (targetLang === 'darija' && MISTRAL_KEY) {
      try {
        const response = await fetch(MISTRAL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MISTRAL_KEY}` },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: `Traduisez le texte français suivant en Darija authentique (caractères arabes). Uniquement la traduction:\n\n${text}` }],
            temperature: 0.3,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          return data.choices?.[0]?.message?.content?.trim();
        }
      } catch (e) {}
    }

    try {
      const targetCode = targetLang === 'en' ? 'en' : 'ar';
      const url = `${MY_MEMORY_API}?q=${encodeURIComponent(text.slice(0, 500))}&langpair=fr|${targetCode}`;
      const response = await fetch(url);
      const data = await response.json();
      let result = data?.responseData?.translatedText?.trim() || text;
      return targetLang === 'darija' ? refineToDarija(result) : result;
    } catch (e) { return text; }
  },

  summarize: async (text) => {
    const prompt = `Résumez le texte suivant de manière simple et pédagogique en 2-3 paragraphes. Utilisez un langage accessible pour les apprenants. Texte: ${text.slice(0, 5000)}`;

    if (GOOGLE_API_KEY) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4 } })
        });
        if (response.ok) {
          const data = await response.json();
          return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        }
      } catch (e) {
        console.error('Summarize error:', e);
      }
    }
    return "Désolé, je n'ai pas pu générer de résumé.";
  },

  generateQuiz: async (textTitle, fullText) => {
    const prompt = `Créez 5 questions de compréhension sur "${textTitle}". Retournez UNIQUEMENT un JSON valide avec cette structure:
{
  "questions": [
    {
      "question": "Question texte",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}
Texte: ${fullText.slice(0, 3000)}`;

    if (GOOGLE_API_KEY) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4 }
          })
        });
        if (response.ok) {
          const data = await response.json();
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            try {
              const parsed = JSON.parse(responseText.replace(/```json|```/gi, '').trim());
              return parsed.questions || [];
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              return [];
            }
          }
        }
      } catch (e) {
        console.error('Quiz generation error:', e);
      }
    }
    return [];
  },
};
