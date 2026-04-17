const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const ATLASIA_MODEL = 'atlasia/Terjman-Ultra';
const HF_INFERENCE_URL = `https://api-inference.huggingface.co/models/${ATLASIA_MODEL}`;

const DEFAULT_MODEL_WAIT_SECONDS = 20;
const MAX_MODEL_WAIT_MS = 30000;

// Strip Mistral special tokens from user content to prevent prompt injection.
const sanitizeForPrompt = (text) =>
  text.replace(/<s>|<\/s>|\[INST\]|\[\/INST\]/gi, '');

// Terjman-Ultra is a Mistral-based instruction-following model.
// It requires the standard [INST] prompt format for translation.
const buildTranslationPrompt = (text) =>
  `<s>[INST] Translate the following text to Moroccan Darija:\n${sanitizeForPrompt(text)}\n[/INST]`;

const normalizeAtlasiaResponse = (data) => {
  // Translation pipeline models (MarianMT) return translation_text
  if (Array.isArray(data) && data[0]?.translation_text) {
    return data[0].translation_text.trim();
  }
  // Text-generation models (Mistral-based Terjman-Ultra) return generated_text
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text.trim();
  }
  if (typeof data === 'string') {
    return data.trim();
  }
  return null;
};

const translateChunk = async (chunk, headers, retries = 2) => {
  const response = await fetch(HF_INFERENCE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: buildTranslationPrompt(chunk.trim()),
      parameters: {
        max_new_tokens: 512,
        return_full_text: false,
      },
    }),
  });

  // HuggingFace returns 503 while the model is loading (cold start).
  // Wait for the estimated time then retry.
  if (response.status === 503 && retries > 0) {
    const payload = await response.json().catch(() => ({}));
    const waitMs = Math.min((payload.estimated_time || DEFAULT_MODEL_WAIT_SECONDS) * 1000, MAX_MODEL_WAIT_MS);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return translateChunk(chunk, headers, retries - 1);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Atlasia API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const translated = normalizeAtlasiaResponse(data);
  if (!translated) {
    throw new Error('Empty translation response from Atlasia');
  }

  return translated;
};

export const aiService = {
  translate: async (text) => {
    if (!text || text.trim().length === 0) return '';

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (HF_API_KEY) {
        headers['Authorization'] = `Bearer ${HF_API_KEY}`;
      }

      // Chunk to stay within model input limits
      const maxChars = 400;
      const chunks = text.match(new RegExp(`.{1,${maxChars}}(\\s|$)`, 'g')) || [text];

      const translatedChunks = await Promise.all(
        chunks.map((chunk) => translateChunk(chunk, headers))
      );

      return translatedChunks.join(' ');
    } catch (error) {
      console.error('Atlasia translation error:', error);
      return text;
    }
  },
};
