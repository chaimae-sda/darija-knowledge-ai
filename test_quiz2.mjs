import { apiClient } from './src/services/apiService.js';
import * as apiService from './src/services/apiService.js';

global.localStorage = {
  getItem: () => 'fake_token',
  setItem: () => {},
};

const text = {
  _id: 'test_id',
  title: 'Test',
  originalText: 'Ceci est un texte de test avec beaucoup de mots pour s\'assurer qu\'il est assez long pour générer des concepts. Il faut que les mots soient nombreux.',
  darijaText: 'هذا نص تجريبي بكلمات كثيرة للتأكد من أنه طويل بما يكفي لإنشاء مفاهيم. لازم تكون الكلمات كثيرة.'
};

// We want to test generateQuestionsFromText, but it's not exported.
// Let's modify the code slightly using regex or just call it if it was exported.
// Actually, apiClient.getQuizQuestions calls generateSmartQuestionsForText.
// Let's mock supabaseRestRequest to return our text.
// Or we can just import generateQuestionsFromText using fs and eval...
