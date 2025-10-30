import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { Question } from '../types/Question';
import { ExamDetails } from '../services/examApi';
import { SimuladoConfig } from '../components/SimuladoBuilder';

export type AppState = 'builder' | 'simulado' | 'results' | 'history' | 'viewHistoryExam' | 'profile';

interface AppContextType {
  // Estado da aplicação
  currentState: AppState;
  setCurrentState: (state: AppState) => void;
  
  // Dados do simulado atual
  currentSimulado: Question[];
  setCurrentSimulado: (questions: Question[]) => void;
  
  // Configuração do simulado
  simuladoConfig: SimuladoConfig | null;
  setSimuladoConfig: (config: SimuladoConfig | null) => void;
  
  // Detalhes do exame
  examDetails: ExamDetails | null;
  setExamDetails: (details: ExamDetails | null) => void;
  
  // ID do exame
  examId: string;
  setExamId: (id: string) => void;
  
  // Estado de carregamento (NÃO persistido)
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  
  // Função para resetar todo o estado
  resetAppState: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Limpar qualquer estado de loading que possa ter ficado no localStorage
  React.useEffect(() => {
    try {
      localStorage.removeItem('genem-is-generating');
    } catch (error) {
      console.warn('Error cleaning up old localStorage keys:', error);
    }
  }, []);

  // Estados persistentes
  const [currentState, setCurrentState] = usePersistedState<AppState>('genem-app-state', 'builder');
  const [currentSimulado, setCurrentSimulado] = usePersistedState<Question[]>('genem-current-simulado', []);
  const [simuladoConfig, setSimuladoConfig] = usePersistedState<SimuladoConfig | null>('genem-simulado-config', null);
  const [examDetails, setExamDetails] = usePersistedState<ExamDetails | null>('genem-exam-details', null);
  const [examId, setExamId] = usePersistedState<string>('genem-exam-id', '');
  
  // Estado de loading NÃO persistido (sempre inicia como false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Função para resetar todo o estado usando useCallback para evitar re-renderizações
  const resetAppState = useCallback(() => {
    setCurrentState('builder');
    setCurrentSimulado([]);
    setSimuladoConfig(null);
    setExamDetails(null);
    setExamId('');
    setIsGenerating(false);
  }, [setCurrentState, setCurrentSimulado, setSimuladoConfig, setExamDetails, setExamId]);

  // Memoizar o value do contexto para evitar re-renderizações desnecessárias
  const value = React.useMemo((): AppContextType => ({
    currentState,
    setCurrentState,
    currentSimulado,
    setCurrentSimulado,
    simuladoConfig,
    setSimuladoConfig,
    examDetails,
    setExamDetails,
    examId,
    setExamId,
    isGenerating,
    setIsGenerating,
    resetAppState,
  }), [
    currentState,
    setCurrentState,
    currentSimulado,
    setCurrentSimulado,
    simuladoConfig,
    setSimuladoConfig,
    examDetails,
    setExamDetails,
    examId,
    setExamId,
    isGenerating,
    setIsGenerating,
    resetAppState,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}