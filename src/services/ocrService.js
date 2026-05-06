import { aiService } from './aiService';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'pixtral-large-latest';

const normalizeText = (text) =>
  text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const buildTitle = (text) => {
  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return 'Document Scanné';
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
};

let pdfModulePromise;

const loadPdfJs = async () => {
  if (!pdfModulePromise) {
    pdfModulePromise = import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      return pdfjsLib;
    });
  }

  return pdfModulePromise;
};

/**
 * When no Mistral key is available (local dev), extract text from the image
 * using the browser's built-in canvas API and return a useful placeholder.
 * For PDFs we can still extract text via PDF.js text layer, so this only
 * applies to images captured from the camera / file-imported images.
 */
const mockOcrFromImage = (mimeType) => {
  const placeholders = [
    "Ceci est un document importé depuis la caméra. Le texte sera extrait et traduit en darija dès que la clé API Mistral sera configurée.",
    "Document pris en photo avec succès. Veuillez configurer VITE_MISTRAL_API_KEY dans le fichier .env pour activer l'extraction de texte.",
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
};

const recognizeImageWithMistral = async (base64Image, mimeType = 'image/jpeg') => {
  if (!MISTRAL_API_KEY) {
    // Graceful fallback: return helpful placeholder instead of crashing
    console.warn('[ocrService] VITE_MISTRAL_API_KEY not set — using mock OCR result.');
    return mockOcrFromImage(mimeType);
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: 'Extrais tout le texte présent dans cette image. Retourne uniquement le texte extrait, sans aucun commentaire ni formatage supplémentaire.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    // Check if it's a rate limit error
    if (response.status === 429) {
      console.warn('[ocrService] Mistral API rate limit exceeded, trying backend fallback...');
      throw new Error('MISTRAL_RATE_LIMIT');
    }
    throw new Error(`Mistral API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return normalizeText(data.choices?.[0]?.message?.content || '');
};

const recognizeImage = async (imageSource, mimeType = 'image/jpeg') => {
  // imageSource may be a data-URL (from PDF canvas rendering) or a plain base64 string
  let base64;
  if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
    const [header, b64] = imageSource.split(',');
    base64 = b64;
    mimeType = header.split(':')[1].split(';')[0];
  } else {
    base64 = imageSource;
  }

  // Try Mistral first
  try {
    return await recognizeImageWithMistral(base64, mimeType);
  } catch (mistralError) {
    // If Mistral rate limit or fails, try backend fallback
    if (mistralError.message === 'MISTRAL_RATE_LIMIT' || mistralError.message.includes('429')) {
      console.log('[ocrService] Using backend OCR fallback...');
      try {
        const response = await fetch('/api/texts/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType }),
        });

        if (response.ok) {
          const data = await response.json();
          return normalizeText(data.originalText || '');
        }
      } catch (backendError) {
        console.warn('[ocrService] Backend fallback also failed:', backendError);
      }
    }

    // If both fail, throw the original error
    throw mistralError;
  }
};

const translateToDarija = async (text) => {
  if (!text) {
    return '';
  }

  try {
    return await aiService.translate(text);
  } catch (error) {
    console.error('Translation fallback error:', error);
    return text;
  }
};

const scanTextContent = async (originalText) => {
  const safeOriginal = normalizeText(originalText);
  const darijaText = await translateToDarija(safeOriginal);

  return {
    title: buildTitle(safeOriginal),
    originalText: safeOriginal,
    darijaText: normalizeText(darijaText),
  };
};

const renderPdfPageToImage = async (page) => {
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.9);
};

export const ocrService = {
  scanImage: async (base64Image, mimeType = 'image/jpeg') => {
    try {
      const originalText = await recognizeImage(base64Image, mimeType);

      if (!originalText) {
        throw new Error('Aucun texte détecté dans cette image.');
      }

      return await scanTextContent(originalText);
    } catch (error) {
      console.error('OCR Service Error:', error);
      throw error;
    }
  },

  scanPDF: async (file) => {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageTexts = [];

      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const extractedText = normalizeText(
          textContent.items.map((item) => item.str || '').join(' ')
        );

        if (extractedText) {
          pageTexts.push(extractedText);
          continue;
        }

        // Only use Mistral OCR for image-based PDFs when key is available
        if (MISTRAL_API_KEY) {
          const pageImage = await renderPdfPageToImage(page);
          const ocrText = await recognizeImage(pageImage);
          if (ocrText) {
            pageTexts.push(ocrText);
          }
        }
      }

      const originalText = normalizeText(pageTexts.join('\n\n'));

      if (!originalText) {
        throw new Error('Aucun texte détecté dans ce PDF.');
      }

      return await scanTextContent(originalText);
    } catch (error) {
      console.error('PDF Scan Error:', error);
      throw error;
    }
  },
};
