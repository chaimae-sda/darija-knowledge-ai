const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const PRIMARY_MODEL = 'atlasia/Terjman-Ultra-v2.0';
const FALLBACK_MODEL = 'atlasia/Terjman-Large';
const HF_INFERENCE_BASE = 'https://api-inference.huggingface.co/models';

const DEFAULT_MODEL_WAIT_SECONDS = 20;
const MAX_MODEL_WAIT_MS = 30000;

const extractTranslation = (data) => {
  // Translation pipeline models return an array with translation_text or generated_text
  if (Array.isArray(data)) {
    const item = data[0];
    if (item?.translation_text) return item.translation_text.trim();
    if (item?.generated_text) return item.generated_text.trim();
  }
  if (typeof data === 'string') return data.trim();
  return null;
};

class TranslationApiError extends Error {
  constructor(status, model, body) {
    super(`Atlasia API error ${status} (${model}): ${body}`);
    this.status = status;
  }
}

const translateChunkWithModel = async (chunk, headers, model, retries = 2) => {
  const url = `${HF_INFERENCE_BASE}/${model}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: chunk.trim(),
    }),
  });

  // HuggingFace returns 503 while the model is loading (cold start).
  // Wait for the estimated time then retry.
  if (response.status === 503 && retries > 0) {
    const payload = await response.json().catch(() => ({}));
    const waitMs = Math.min((payload.estimated_time || DEFAULT_MODEL_WAIT_SECONDS) * 1000, MAX_MODEL_WAIT_MS);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return translateChunkWithModel(chunk, headers, model, retries - 1);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new TranslationApiError(response.status, model, errText);
  }

  const data = await response.json();
  const result = extractTranslation(data);
  if (result !== null) return result;

  throw new Error(`Empty or unexpected translation response from ${model}`);
};

const translateChunk = async (chunk, headers) => {
  try {
    return await translateChunkWithModel(chunk, headers, PRIMARY_MODEL);
  } catch (primaryError) {
    // If the primary model is gated (401/403), fall back to the publicly accessible model.
    if (primaryError instanceof TranslationApiError && (primaryError.status === 401 || primaryError.status === 403)) {
      console.warn('Primary Atlasia model unavailable, falling back to Terjman-Large:', primaryError.message);
      return translateChunkWithModel(chunk, headers, FALLBACK_MODEL);
    }
    throw primaryError;
  }
};

export const aiService = {
  translate: async (text) => {
    if (!text || text.trim().length === 0) return '';

    if (!HF_API_KEY) {
      console.error('Translation unavailable: VITE_HF_API_KEY is not configured.');
      return text;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_API_KEY}`,
      };

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
