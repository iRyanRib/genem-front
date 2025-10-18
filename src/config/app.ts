// Configurações da aplicação
export const config = {
  // API Configuration - Conectando com a API local do backend
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true', // Default to false to use real API
  
  // AI Conversation API (mantida para compatibilidade)
  aiApiUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/v1',
  
  // MongoDB Connection (for reference - not used in frontend)
  mongoConnectionString: '',
  mongoDatabase: 'genem'
};
