import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
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
    const path = location.pathname;
    let newState = currentState;
    
    if (path === '/builder') newState = 'builder';
    else if (path === '/simulado') newState = 'simulado';
    else if (path === '/results') newState = 'results';
    else if (path === '/history') newState = 'history';
    else if (path.startsWith('/history/')) newState = 'viewHistoryExam';
    
    if (newState !== currentState) {
      setCurrentState(newState);
    }
    
    // Pequeno delay para evitar flickering
    const timer = setTimeout(() => setIsInitializing(false), 100);
    return () => clearTimeout(timer);
  }, []); // Apenas no mount

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
      const FAKE_USER_ID = '507f1f77bcf86cd799439011';
      const examForUser = await examApiService.getExam(examId, FAKE_USER_ID);
      
      if (examForUser.status === 'finished') {
        const examDetails = await examApiService.getExamDetails(examId, FAKE_USER_ID);
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

  const handleReplicateSimulado = async (existingExamId: string) => {
    setIsGenerating(true);
    try {
      const result = await simuladoService.replicateExam(existingExamId, examDetails?.total_questions || 25);
      setCurrentSimulado(result.questions);
      setExamId(result.examId);
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
          <SimuladoBuilder 
            onGenerateSimulado={handleGenerateSimulado}
            isGenerating={isGenerating}
            onViewHistory={handleViewHistory}
          />
        } 
      />
      
      <Route 
        path="/simulado" 
        element={
          simuladoConfig && examId ? (
            <SimuladoViewer
              questions={currentSimulado}
              timeLimit={simuladoConfig.timeLimit}
              examId={examId}
              onFinish={handleFinishSimulado}
              onBack={handleBackToBuilder}
            />
          ) : (
            <Navigate to="/builder" replace />
          )
        } 
      />
      
      <Route 
        path="/results" 
        element={
          examDetails ? (
            <SimuladoResults
              examDetails={examDetails}
              questions={currentSimulado}
              onRestart={handleRestartSimulado}
              onNewSimulado={handleNewSimulado}
              onReplicate={handleReplicateSimulado}
            />
          ) : (
            <Navigate to="/builder" replace />
          )
        } 
      />
      
      <Route 
        path="/history" 
        element={
          <ExamHistory
            onViewExam={handleViewHistoryExam}
            onBack={handleBackFromHistory}
          />
        } 
      />
      
      <Route 
        path="/history/:examId" 
        element={
          examDetails ? (
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
          )
        } 
      />
      
      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<Navigate to="/builder" replace />} />
    </Routes>
  );
}