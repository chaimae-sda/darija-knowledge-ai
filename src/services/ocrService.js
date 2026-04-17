import { aiService } from './aiService';

const OCR_LANGUAGES = 'fra+ara+eng';

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
    return 'Document Scanne';
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
};

let tesseractModulePromise;
let pdfModulePromise;

const loadTesseract = async () => {
  if (!tesseractModulePromise) {
    tesseractModulePromise = import('tesseract.js');
  }

  const module = await tesseractModulePromise;
  return module.default;
};

const loadPdfJs = async () => {
  if (!pdfModulePromise) {
    pdfModulePromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjsLib, workerModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
      return pdfjsLib;
    });
  }

  return pdfModulePromise;
};

const recognizeImage = async (imageSource) => {
  const Tesseract = await loadTesseract();
  const result = await Tesseract.recognize(imageSource, OCR_LANGUAGES, {
    logger: () => {},
  });

  return normalizeText(result.data.text || '');
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
      const imageUrl = `data:${mimeType};base64,${base64Image}`;
      const originalText = await recognizeImage(imageUrl);

      if (!originalText) {
        throw new Error('Aucun texte detecte dans cette image.');
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

        const pageImage = await renderPdfPageToImage(page);
        const ocrText = await recognizeImage(pageImage);
        if (ocrText) {
          pageTexts.push(ocrText);
        }
      }

      const originalText = normalizeText(pageTexts.join('\n\n'));

      if (!originalText) {
        throw new Error('Aucun texte detecte dans ce PDF.');
      }

      return await scanTextContent(originalText);
    } catch (error) {
      console.error('PDF Scan Error:', error);
      throw error;
    }
  },
};
