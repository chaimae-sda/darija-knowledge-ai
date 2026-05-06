import { apiClient } from './src/services/apiService.js';
apiClient.getQuizQuestions('test').then(console.log).catch(console.error);
