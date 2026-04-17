export const quizService = {
  /**
   * Generates a quiz from scanned Darija text
   * Extracts keywords to build context-aware questions
   */
  generateFromText: (text) => {
    if (!text || text.length < 20) return null;

    const words = text.split(/\s+/).filter(w => w.length > 4);
    const keywords = [...new Set(words)]; // Unique words
    
    // Fallback if text is too short or weird
    if (keywords.length < 5) return null;

    // Pick 3 interesting keywords for distractors
    const mainTopic = keywords[0];
    const secondaryTopic = keywords[Math.floor(keywords.length / 2)];
    
    const questions = [
      {
        id: 1,
        question: "هاد النص كيهضر بزاف على:",
        options: [
           mainTopic,
           "اللعب فالزنقة",
           "النعاس بكري"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "شنو هي الكلمة اللي كاينة فهاد النص؟",
        options: [
           "الطيارة",
           secondaryTopic,
           "البحر"
        ],
        correct: 1
      },
      {
        id: 3,
        question: "واش هاد النص مفيد للتعلم؟",
        options: [
           "لا، غير تفلية",
           "إيه، فيه معلومات",
           "ما عرفتش"
        ],
        correct: 1
      }
    ];

    return {
      title: "Quiz Intelligent",
      desc: "بناءً على داكشي اللي سكانيتي",
      questions
    };
  }
};
