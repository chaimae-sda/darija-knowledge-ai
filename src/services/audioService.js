export const audioService = {
  getVoices: () =>
    new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    }),

  speak: async (text, lang = 'ar-SA', rate = 0.9) =>
    new Promise(async (resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('TTS non supporte sur ce navigateur.'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = await audioService.getVoices();
      const voice =
        voices.find((item) => item.lang.startsWith(lang)) ||
        voices.find((item) => item.lang.startsWith('ar')) ||
        voices[0];

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      window.speechSynthesis.speak(utterance);
    }),

  stop: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
};
