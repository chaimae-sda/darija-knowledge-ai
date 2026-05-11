import { apiClient } from './src/services/apiService.js';
import * as apiService from './src/services/apiService.js';

global.localStorage = {
  getItem: () => 'fake_token',
  setItem: () => {},
};

const text = {
// Fichier supprimé (test quiz)
