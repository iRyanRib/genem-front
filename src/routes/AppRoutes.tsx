import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserProfile } from '../components/UserProfile';
import SimuladoBuilder from '../components/SimuladoBuilder';
import SimuladoViewer from '../components/SimuladoViewer';
import SimuladoResults from '../components/SimuladoResults';
import ExamHistory from '../components/ExamHistory';
import { LoadingScreen } from '../components/LoadingScreen';
import { simuladoService } from '../services/simuladoService';
import { examApiService } from '../services/examApi';

export function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasRedirectedAfterLogin, setHasRedirectedAfterLogin] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const {
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
    resetAppState
  } = useAppContext();

  // Sincronizar estado com a URL atual APENAS no mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsInitializing(false);
      setHasRedirectedAfterLogin(false);
      return;
    }

    const path = location.pathname;
    
    // Redirecionar para home apenas no primeiro acesso após login
    // e sempre resetar o estado para 'builder' após login
    if (!hasRedirectedAfterLogin) {
      // Sempre forçar para builder após login, independente da URL
      setCurrentState('builder');
      if (path === '/' || path === '/login' || path === '/register' || path === '/profile') {
        navigate('/builder', { replace: true });
        setHasRedirectedAfterLogin(true);
        setIsInitializing(false);
        return;
      }
      setHasRedirectedAfterLogin(true);
    }
    
    let newState = currentState;
    
    if (path === '/builder') newState = 'builder';
    else if (path === '/simulado') newState = 'simulado';
    else if (path === '/results') newState = 'results';
    else if (path === '/history') newState = 'history';
    else if (path === '/profile') newState = 'profile';
    else if (path.startsWith('/history/')) newState = 'viewHistoryExam';
    
    if (newState !== currentState) {
      setCurrentState(newState);
    }
    
    // Pequeno delay para evitar flickering
    const timer = setTimeout(() => setIsInitializing(false), 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, hasRedirectedAfterLogin]); // Reexecutar quando autenticação mudar

  // Função auxiliar para navegar E atualizar estado atomicamente
  const navigateToState = (state: string, path: string) => {
    setCurrentState(state as any);
    navigate(path);
  };

  // Handlers simplificados - apenas navegam, não setam estado duplicado
  const handleViewHistory = () => {
    navigateToState('history', '/history');
  };

  const handleBackFromHistory = () => {
    navigateToState('builder', '/builder');
  };

  const handleViewHistoryExam = async (examId: string) => {
    try {
      const examForUser = await examApiService.getExam(examId);
      
      if (examForUser.status === 'finished') {
        const examDetails = await examApiService.getExamDetails(examId);
        const { convertExamQuestionToQuestion } = await import('../types/Question');
        
        const questions = [];
        for (const examQuestion of examDetails.questions || []) {
          const questionData = examForUser.questions.find(q => q.id === examQuestion.question_id);
          if (questionData) {
            try {
              const converted = convertExamQuestionToQuestion(questionData, questions.length);
              questions.push(converted);
            } catch (error) {
              console.warn(`Erro ao converter questão ${questionData.id}:`, error);
            }
          }
        }
        
        setExamDetails(examDetails);
        setExamId(examId);
        setCurrentSimulado(questions);
        navigateToState('viewHistoryExam', `/history/${examId}`);
      } else {
        const { convertExamQuestionToQuestion } = await import('../types/Question');
        const questions = [];
        
        for (const examQuestion of examForUser.questions || []) {
          try {
            const convertedQuestion = convertExamQuestionToQuestion(examQuestion, questions.length);
            questions.push(convertedQuestion);
          } catch (error) {
            console.warn(`Erro ao converter questão ${examQuestion.id}:`, error);
          }
        }
        
        setCurrentSimulado(questions);
        setExamId(examId);
        setSimuladoConfig({
          description: 'Continuando exame anterior',
          totalQuestions: questions.length,
          timeLimit: 60,
          topicIds: []
        });
        navigateToState('simulado', '/simulado');
      }
    } catch (error) {
      console.error('Erro ao visualizar exame do histórico:', error);
      alert('Erro ao carregar o exame. Por favor, tente novamente.');
    }
  };

  const handleBackFromHistoryExamView = () => {
    navigateToState('history', '/history');
  };

  const handleGenerateSimulado = async (config: any) => {
    setIsGenerating(true);
    try {
      const result = await simuladoService.generateSimulado(config);
      setCurrentSimulado(result.questions);
      setExamId(result.examId);
      setSimuladoConfig(config);
      navigateToState('simulado', '/simulado');
    } catch (error) {
      console.error('Error generating simulado:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishSimulado = (examDetails: any) => {
    setExamDetails(examDetails);
    navigateToState('results', '/results');
  };

  const handleRestartSimulado = () => {
    setExamDetails(null);
    navigateToState('simulado', '/simulado');
  };

  const handleNewSimulado = () => {
    resetAppState();
    navigateToState('builder', '/builder');
  };

  const handleBackToBuilder = () => {
    navigateToState('builder', '/builder');
  };

  const handleBackFromProfile = () => {
    navigateToState('builder', '/builder');
  };

  const handleReplicateSimulado = async (existingExamId: string) => {
    setIsGenerating(true);
    try {
      const result = await simuladoService.replicateExam(existingExamId, examDetails?.total_questions || 25);
      setCurrentSimulado(result.questions);
      setExamId(result.examId);
      
      // Configurar simuladoConfig para a replicação
      setSimuladoConfig({
        description: 'Refazendo simulado anterior',
        totalQuestions: result.questions.length,
        timeLimit: 60, // Tempo padrão para replicação
        topicIds: [] // Sem filtros específicos na replicação
      });
      
      navigateToState('simulado', '/simulado');
    } catch (e) {
      console.error('Erro ao replicar simulado:', e);
      throw e;
    } finally {
      setIsGenerating(false);
    }
  };

  // Mostrar loading durante inicialização
  if (isInitializing) {
    return <LoadingScreen message="Inicializando aplicação..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/builder" replace />} />
      
      <Route 
        path="/builder" 
        element={
          <ProtectedRoute>
            <SimuladoBuilder 
              onGenerateSimulado={handleGenerateSimulado}
              isGenerating={isGenerating}
              onViewHistory={handleViewHistory}
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/simulado" 
        element={
          <ProtectedRoute>
            {simuladoConfig && examId ? (
              <SimuladoViewer
                questions={currentSimulado}
                timeLimit={simuladoConfig.timeLimit}
                examId={examId}
                onFinish={handleFinishSimulado}
                onBack={handleBackToBuilder}
              />
            ) : (
              <Navigate to="/builder" replace />
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/results" 
        element={
          <ProtectedRoute>
            {examDetails ? (
              <SimuladoResults
                examDetails={examDetails}
                questions={currentSimulado}
                onRestart={handleRestartSimulado}
                onNewSimulado={handleNewSimulado}
                onReplicate={handleReplicateSimulado}
              />
            ) : (
              <Navigate to="/builder" replace />
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <ExamHistory
              onViewExam={handleViewHistoryExam}
              onBack={handleBackFromHistory}
            />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/history/:examId" 
        element={
          <ProtectedRoute>
            {examDetails ? (
              <SimuladoResults
                examDetails={examDetails}
                questions={currentSimulado}
                onRestart={handleRestartSimulado}
                onNewSimulado={handleNewSimulado}
                onReplicate={handleReplicateSimulado}
                onBack={handleBackFromHistoryExamView}
              />
            ) : (
              <Navigate to="/history" replace />
            )}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile onBack={handleBackFromProfile} />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<Navigate to="/builder" replace />} />
    </Routes>
  );
}