let currentAudio = null;

export const audioService = {
  speak: async (text, lang = 'ar-SA', rate = 1.0) => {
    return new Promise(async (resolve, reject) => {
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
      
      // Try Gemini TTS first
      if (GOOGLE_API_KEY) {
        try {
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }

          const models = ['gemini-flash-2.5-tts-preview', 'gemini-2.0-flash'];
          for (const modelName of models) {
            try {
              const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GOOGLE_API_KEY}`;
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                })
              });

              if (response.ok) {
                const data = await response.json();
                const parts = data?.candidates?.[0]?.content?.parts || [];
                const audioPart = parts.find(p => p.inlineData && p.inlineData.data);
                const audioBase64 = audioPart?.inlineData?.data;

                if (audioBase64) {
                  const audioBlob = base64PcmToWavBlob(audioBase64, 24000);
                  const url = URL.createObjectURL(audioBlob);
                  
                  currentAudio = new Audio(url);
                  currentAudio.playbackRate = rate;
                  currentAudio.onended = () => {
                    URL.revokeObjectURL(url);
                    resolve();
                  };
                  currentAudio.onerror = (e) => {
                    console.error('Audio object error:', e);
                  };
                  await currentAudio.play();
                  return; // Success!
                }
              }
            } catch (e) {
              console.warn(`Gemini TTS attempt with ${modelName} failed`, e);
            }
          }
        } catch (error) {
          console.error('Gemini TTS major failure:', error);
        }
      }

      // FALLBACK: Use Browser SpeechSynthesis if Gemini fails or is not configured
      console.log('Falling back to browser SpeechSynthesis');
      try {
        if (!window.speechSynthesis) {
          throw new Error('TTS not supported');
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        reject(err);
      }
    });
  },

  stop: () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};

function base64PcmToWavBlob(base64, sampleRate) {
  try {
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    const binaryString = window.atob(normalized);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    view.setUint32(0, 0x52494646, false); 
    view.setUint32(4, 36 + len, true);    
    view.setUint32(8, 0x57415645, false); 
    view.setUint32(12, 0x666d7420, false); 
    view.setUint32(16, 16, true);          
    view.setUint16(20, 1, true);           
    view.setUint16(22, 1, true);           
    view.setUint32(24, sampleRate, true);  
    view.setUint32(28, sampleRate * 2, true); 
    view.setUint16(32, 2, true);           
    view.setUint16(34, 16, true);          
    view.setUint32(36, 0x64617461, false); 
    view.setUint32(40, len, true);         

    return new Blob([wavHeader, bytes], { type: 'audio/wav' });
  } catch (e) {
    console.error('PCM to WAV conversion failed', e);
    return new Blob([], { type: 'audio/wav' });
  }
}
