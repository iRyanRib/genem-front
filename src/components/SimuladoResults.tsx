import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle, XCircle, Clock, RotateCcw, Home, Wand2, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Question, MongoQuestion } from "../types/Question";
import { ExamDetails } from "../services/examApi";
import { questionsApiService } from "../services/questionsApi";
import QuestionChatDialog from "./QuestionChatDialog";

interface SimuladoResultsProps {
  examDetails: ExamDetails; // Mudança: agora recebe ExamDetails ao invés de questions/answers separados
  questions: Question[]; // Mantido para compatibilidade com QuestionChatDialog
  onRestart: () => void;
  onNewSimulado: () => void;
  onReplicate: (existingExamId: string) => Promise<void>;
  onBack?: () => void;
}

export default function SimuladoResults({ 
  examDetails,
  questions,
  onRestart, 
  onNewSimulado,
  onReplicate,
  onBack
}: SimuladoResultsProps) {
  const [isReplicating, setIsReplicating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [questionDetails, setQuestionDetails] = useState<Record<string, MongoQuestion>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [selectedQuestionForChat, setSelectedQuestionForChat] = useState<Question | null>(null);
  
  const totalQuestions = examDetails.total_questions;
  const correctAnswers = examDetails.total_correct_answers;
  const wrongAnswers = examDetails.total_wrong_answers;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Calcular tempo gasto (mock - pode ser adicionado ao ExamDetails no futuro)
  const timeSpent = 3600; // 1 hora como exemplo
  
  // Converter questões do exame para estrutura compatível com o resultado
  const answeredQuestions = examDetails.questions.length;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min ${remainingSeconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excelente! Você está muito bem preparado!";
    if (score >= 80) return "Muito bom! Continue assim!";
    if (score >= 70) return "Bom desempenho! Você está no caminho certo!";
    if (score >= 60) return "Razoável. Continue estudando para melhorar!";
    return "É importante revisar os conteúdos e praticar mais!";
  };

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

  // Calculate performance by subject
  // Calcular estatísticas por matéria baseado nos detalhes do exame
  const subjectStats = questions.reduce((acc, question) => {
    const subject = question.subject;
    if (!acc[subject]) {
      acc[subject] = { total: 0, correct: 0 };
    }
    acc[subject].total++;
    
    // Buscar a resposta desta questão no examDetails
    const examQuestion = examDetails.questions.find(eq => eq.question_id === question.id);
    if (examQuestion && examQuestion.is_correct) {
      acc[subject].correct++;
    }
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  const handleQuestionClick = async (questionId: string) => {
    const isExpanded = expandedQuestions.has(questionId);
    
    if (isExpanded) {
      // Fechar questão
      const newExpanded = new Set(expandedQuestions);
      newExpanded.delete(questionId);
      setExpandedQuestions(newExpanded);
    } else {
      // Expandir questão
      const newExpanded = new Set(expandedQuestions);
      newExpanded.add(questionId);
      setExpandedQuestions(newExpanded);
      
      // Carregar detalhes se ainda não carregados
      if (!questionDetails[questionId]) {
        const newLoading = new Set(loadingDetails);
        newLoading.add(questionId);
        setLoadingDetails(newLoading);
        
        try {
          const details = await questionsApiService.getQuestionById(questionId);
          if (details) {
            setQuestionDetails(prev => ({
              ...prev,
              [questionId]: details
            }));
          }
        } catch (error) {
          console.error('Erro ao carregar detalhes da questão:', error);
        } finally {
          const newLoading = new Set(loadingDetails);
          newLoading.delete(questionId);
          setLoadingDetails(newLoading);
        }
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2 text-gray-800">Resultado do Simulado</h1>
          <p className="text-gray-600">Confira seu desempenho e continue evoluindo!</p>
        </div>

        {/* Overall Score */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sua Pontuação</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-6xl mb-4 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-lg text-gray-600 mb-4">
              {getScoreMessage(score)}
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-500">Corretas</div>
              </div>
              <div>
                <div className="text-2xl text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-gray-500">Incorretas</div>
              </div>
              <div>
                <div className="text-2xl text-gray-600">{totalQuestions - answeredQuestions}</div>
                <div className="text-sm text-gray-500">Não respondidas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Tempo e Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Tempo gasto:</span>
                    <span className="font-medium">{formatTime(timeSpent)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Progresso:</span>
                    <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                  </div>
                  <Progress value={(answeredQuestions / totalQuestions) * 100} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Taxa de acerto:</span>
                    <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <Progress value={score} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Matéria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(subjectStats).map(([subject, stats]) => {
                  const subjectScore = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={subject} className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={subjectColors[subject] || "bg-gray-100 text-gray-800"}
                      >
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {stats.correct}/{stats.total}
                        </span>
                        <span className={`font-medium ${getScoreColor(subjectScore)}`}>
                          {subjectScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Revisão das Questões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => {
                // Buscar a resposta desta questão no examDetails
                const examQuestion = examDetails.questions.find(eq => eq.question_id === question.id);
                const isCorrect = examQuestion?.is_correct || false;
                const wasAnswered = examQuestion?.user_answer !== undefined;
                const isExpanded = expandedQuestions.has(question.id);
                const questionDetail = questionDetails[question.id];
                const isLoading = loadingDetails.has(question.id);
                
                return (
                  <div key={question.id} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleQuestionClick(question.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Questão {index + 1}</span>
                          <Badge 
                            variant="secondary" 
                            className={subjectColors[question.subject] || "bg-gray-100 text-gray-800"}
                          >
                            {question.subject.charAt(0).toUpperCase() + question.subject.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {!wasAnswered ? (
                            <Badge variant="outline" className="text-gray-500">
                              Não respondida
                            </Badge>
                          ) : isCorrect ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Correta
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Incorreta
                              </Badge>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedQuestionForChat(question);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Wand2 className="w-4 h-4 mr-1" />
                                AI
                              </Button>
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {wasAnswered && (
                          <div className="flex gap-4">
                            <span>
                              Sua resposta: {examQuestion?.user_answer || 'N/A'}
                            </span>
                            <span>
                              Resposta correta: {examQuestion?.correct_answer || 'N/A'}
                            </span>
                          </div>
                        )}
                        {!wasAnswered && (
                          <span>
                            Resposta correta: {examQuestion?.correct_answer || 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Detalhes expandidos da questão */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        {isLoading ? (
                          <div className="text-center py-4">
                            <span className="text-gray-500">Carregando detalhes...</span>
                          </div>
                        ) : questionDetail ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Enunciado:</h4>
                              <p className="text-gray-700 whitespace-pre-line">{questionDetail.context}</p>
                            </div>
                            
                            {questionDetail.alternativesIntroduction && (
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Alternativas:</h4>
                                <p className="text-gray-700 mb-2">{questionDetail.alternativesIntroduction}</p>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              {questionDetail.alternatives && Array.isArray(questionDetail.alternatives) && questionDetail.alternatives.map((alt: any, altIndex: number) => (
                                <div 
                                  key={altIndex} 
                                  className={`p-3 rounded border ${
                                    alt.letter === examQuestion?.correct_answer 
                                      ? 'bg-green-50 border-green-200' 
                                      : alt.letter === examQuestion?.user_answer && !isCorrect
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700">
                                      {alt.letter})
                                    </span>
                                    <span className="text-gray-700">{alt.text}</span>
                                    {alt.letter === examQuestion?.correct_answer && (
                                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                                    )}
                                    {alt.letter === examQuestion?.user_answer && !isCorrect && (
                                      <XCircle className="w-4 h-4 text-red-600 ml-auto flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="text-xs text-gray-500 pt-2 border-t">
                              Ano: {questionDetail.year} | Disciplina: {questionDetail.discipline}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="text-red-500">Erro ao carregar detalhes da questão</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Voltar ao Histórico
            </Button>
          )}
          <Button 
            onClick={async () => {
              setIsReplicating(true);
              try {
                await onReplicate(examDetails.id);
              } catch (e) {
                console.error('Erro ao refazer simulado:', e);
                alert('Erro ao refazer simulado. Tente novamente.');
              } finally {
                setIsReplicating(false);
              }
            }}
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isReplicating}
          >
            <RotateCcw className="w-4 h-4" />
            {isReplicating ? 'Refazendo...' : 'Refazer Simulado'}
          </Button>
          <Button onClick={onNewSimulado} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Novo Simulado
          </Button>
        </div>
      </div>
      
      {/* Chat Dialog desacoplado - FORA da div com max-w para ocupar toda a largura */}
      {selectedQuestionForChat && (
        <QuestionChatDialog 
          question={selectedQuestionForChat}
          isWrongAnswer={true}
          onClose={() => setSelectedQuestionForChat(null)}
        />
      )}
    </div>
  );
}