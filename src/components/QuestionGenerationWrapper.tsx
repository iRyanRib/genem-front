import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingScreen } from './LoadingScreen';
import QuestionViewer from './QuestionViewer';
import { generatedQuestionsApiService, GeneratedQuestion } from '../services/generatedQuestionsApi';

interface QuestionGenerationWrapperProps {
  onBack: () => void;
}

export default function QuestionGenerationWrapper({ onBack }: QuestionGenerationWrapperProps) {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) {
      setError('ID da questão não fornecido');
      setIsGenerating(false);
      return;
    }

    const generateQuestion = async () => {
      try {
        setIsGenerating(true);
        setError(null);
        
        const generated = await generatedQuestionsApiService.generateQuestion(questionId);
        console.log('Questão gerada recebida:', generated);
        setGeneratedQuestion(generated);
      } catch (error) {
        console.error('Erro ao gerar questão:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido ao gerar questão');
      } finally {
        setIsGenerating(false);
      }
    };

    generateQuestion();
  }, [questionId]);

  const handleGenerateAnother = async () => {
    if (!questionId) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const generated = await generatedQuestionsApiService.generateQuestion(questionId);
      console.log('Nova questão gerada:', generated);
      setGeneratedQuestion(generated);
    } catch (error) {
      console.error('Erro ao gerar nova questão:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao gerar questão');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <LoadingScreen 
        message="Gerando nova questão com IA... Isso pode levar alguns segundos..."
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Erro na Geração
            </h2>
            <p className="text-red-600 mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => questionId && handleGenerateAnother()}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!generatedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Questão Não Encontrada
            </h2>
            <p className="text-yellow-600 mb-4">
              Não foi possível gerar a questão solicitada.
            </p>
            <button
              onClick={onBack}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionViewer
      question={generatedQuestion}
      onBack={onBack}
      onGenerateAnother={handleGenerateAnother}
    />
  );
}