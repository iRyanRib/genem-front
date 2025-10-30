import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react';
import { GeneratedQuestion } from '../services/generatedQuestionsApi';
import { MarkdownRenderer } from './MarkdownRenderer';

interface QuestionViewerProps {
  question: GeneratedQuestion;
  onBack: () => void;
  onGenerateAnother?: () => void;
}

export default function QuestionViewer({ question, onBack, onGenerateAnother }: QuestionViewerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (letter: string | undefined) => {
    if (hasAnswered || !letter) return;
    
    setSelectedAnswer(letter);
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const handleRestart = () => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setShowExplanation(false);
  };

  const isCorrect = selectedAnswer === question.correctAlternative;

  const subjectColors: Record<string, string> = {
    matematica: "bg-blue-100 text-blue-800",
    portugues: "bg-green-100 text-green-800",
    historia: "bg-yellow-100 text-yellow-800",
    geografia: "bg-purple-100 text-purple-800",
    biologia: "bg-emerald-100 text-emerald-800",
    quimica: "bg-orange-100 text-orange-800",
    fisica: "bg-red-100 text-red-800",
    filosofia: "bg-indigo-100 text-indigo-800",
    sociologia: "bg-pink-100 text-pink-800",
    ingles: "bg-cyan-100 text-cyan-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={subjectColors[question.subject || 'geral'] || "bg-gray-100 text-gray-800"}
            >
              {question.subject ? (question.subject.charAt(0).toUpperCase() + question.subject.slice(1)) : 'Geral'}
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              <Lightbulb className="w-3 h-3 mr-1" />
              Questão Gerada por IA
            </Badge>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Questão Gerada - {question.discipline || 'Disciplina'} ({question.year || 'Ano não informado'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Context */}
              <div>
                <MarkdownRenderer 
                  content={question.context}
                  className="text-gray-700 leading-relaxed"
                />
              </div>

              {/* Alternatives Introduction */}
              {question.alternativesIntroduction && (
                <div>
                  <MarkdownRenderer 
                    content={question.alternativesIntroduction}
                    className="text-gray-700 font-medium"
                  />
                </div>
              )}

              {/* Alternatives */}
              <div className="space-y-3">
                {question.alternatives && question.alternatives.length > 0 ? (
                  question.alternatives.map((alternative, index) => {
                    const isSelected = selectedAnswer === alternative.letter;
                    const isCorrectAnswer = alternative.letter === question.correctAlternative;
                    
                    let cardClass = "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md";
                    
                    if (!hasAnswered) {
                      cardClass += " border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                    } else {
                      if (isCorrectAnswer) {
                        cardClass += " border-green-300 bg-green-50";
                      } else if (isSelected && !isCorrectAnswer) {
                        cardClass += " border-red-300 bg-red-50";
                      } else {
                        cardClass += " border-gray-200 bg-gray-50";
                      }
                    }

                    return (
                      <div
                        key={alternative.letter || index}
                        className={cardClass}
                        onClick={() => handleAnswerSelect(alternative.letter || String.fromCharCode(65 + index))}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-700">
                            {alternative.letter ? alternative.letter.toUpperCase() : String.fromCharCode(65 + index)}
                          </div>
                          
                          <div className="flex-1">
                            {alternative.text ? (
                              <MarkdownRenderer 
                                content={alternative.text}
                                className="text-gray-700"
                              />
                            ) : alternative.base64File ? (
                              <div>
                                <img 
                                  src={`data:image/${(() => {
                                    let imageType = 'png';
                                    if (alternative.base64File!.startsWith('/9j/')) imageType = 'jpeg';
                                    else if (alternative.base64File!.startsWith('iVBORw0KGgo')) imageType = 'png';
                                    else if (alternative.base64File!.startsWith('R0lGOD')) imageType = 'gif';
                                    else if (alternative.base64File!.startsWith('UklGR')) imageType = 'webp';
                                    return imageType;
                                  })()};base64,${alternative.base64File}`}
                                  alt={`Alternativa ${alternative.letter || String.fromCharCode(65 + index)}`}
                                  className="max-w-full h-auto rounded-lg shadow-sm"
                                  style={{ maxHeight: '300px' }}
                                />
                              </div>
                            ) : (
                              <span className="text-gray-500">Alternativa sem conteúdo</span>
                            )}
                          </div>
                          
                          {hasAnswered && (
                            <div className="flex-shrink-0">
                              {isCorrectAnswer ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : isSelected ? (
                                <XCircle className="w-6 h-6 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma alternativa encontrada
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {hasAnswered && (
          <Card className={`mb-6 ${isCorrect ? 'border-green-300' : 'border-red-300'}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-4xl mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? (
                    <CheckCircle className="w-16 h-16 mx-auto" />
                  ) : (
                    <XCircle className="w-16 h-16 mx-auto" />
                  )}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Parabéns! Você acertou!' : 'Que pena! Você errou.'}
                </h3>
                <p className="text-gray-600">
                  {isCorrect 
                    ? 'Continue praticando para manter o bom desempenho!'
                    : `A resposta correta era: ${question.correctAlternative ? question.correctAlternative.toUpperCase() : 'Não informada'}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {hasAnswered && (
            <Button 
              onClick={handleRestart}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          
          {onGenerateAnother && (
            <Button 
              onClick={onGenerateAnother}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Gerar Outra Questão
            </Button>
          )}
        </div>

        {/* Question Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Questão gerada por IA baseada em uma questão do ENEM
          </p>
          <p>
            Data de criação: {new Date(question.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}