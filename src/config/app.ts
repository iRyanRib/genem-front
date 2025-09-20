// Configurações da aplicação
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== 'false', // Default to true, set to false to use real API
  
  // AI Conversation API
  aiApiUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/v1',
  
  // MongoDB Connection (for reference - not used in frontend)
  mongoConnectionString: '',
  mongoDatabase: 'genem'
};
