import { config } from '../config/app';

export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
}

const API_BASE_URL = config.apiUrl;

// Função para obter o token do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Função para salvar o token no localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

// Função para remover o token do localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('access_token');
};

// Função para criar headers com autenticação
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Registrar novo usuário
export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao registrar usuário');
  }

  return response.json();
};

// Login do usuário
export const loginUser = async (credentials: LoginCredentials): Promise<Token> => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/users/login/access-token`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Email ou senha incorretos');
  }

  const token = await response.json();
  setAuthToken(token.access_token);
  return token;
};

// Logout do usuário
export const logoutUser = (): void => {
  removeAuthToken();
};

// Obter dados do usuário atual
export const getCurrentUser = async (): Promise<User> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      throw new Error('Token expirado');
    }
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao obter dados do usuário');
  }

  return response.json();
};

// Atualizar dados do usuário atual
export const updateCurrentUser = async (userData: UpdateUserData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar usuário');
  }

  return response.json();
};

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// Exportar funções utilitárias
export { getAuthToken, setAuthToken, removeAuthToken, getAuthHeaders };