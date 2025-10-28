import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para gerenciar estados que persistem no localStorage
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const isInitialized = useRef(false);
  
  // Função para obter valor do localStorage
  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // Estado inicial com valor do localStorage ou valor padrão
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    const stored = getStoredValue();
    isInitialized.current = true;
    return stored;
  });

  // Função para atualizar tanto o estado quanto o localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Permite funções de atualização como setState normal
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Evita updates desnecessários
      if (JSON.stringify(valueToStore) === JSON.stringify(storedValue)) {
        return;
      }
      
      // Salva no estado
      setStoredValue(valueToStore);
      
      // Salva no localStorage
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sincroniza com mudanças externas no localStorage (outras abas, etc.)
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook para limpar todos os dados persistidos da aplicação
 */
export function useClearPersistedData() {
  return useCallback(() => {
    const keysToRemove = [
      'genem-app-state',
      'genem-current-simulado',
      'genem-simulado-config',
      'genem-exam-details',
      'genem-exam-id'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
      }
    });
  }, []);
}