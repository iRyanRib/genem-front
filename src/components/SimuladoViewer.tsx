import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Flag } from "lucide-react";
import { Question } from "../types/Question";
import { examApiService, ExamDetails } from "../services/examApi";

interface SimuladoViewerProps {
  questions: Question[];
  timeLimit: number;
  examId: string; // ID do exame para chamar as APIs
  onFinish: (examDetails: ExamDetails) => void; // Mudança: agora recebe ExamDetails
  onBack: () => void;
}

export default function SimuladoViewer({ questions, timeLimit, examId, onFinish, onBack }: SimuladoViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);

  // Carregar respostas já salvas ao montar o componente
  useEffect(() => {
    const loadSavedAnswers = async () => {
      try {
        const examDetails = await examApiService.getExamDetails(examId);
        
        // Mapear as respostas salvas para o formato do estado local
        const savedAnswers: Record<string, number> = {};
        const letterToIndex: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
        
        examDetails.questions.forEach((q) => {
          if (q.user_answer) {
            savedAnswers[q.question_id] = letterToIndex[q.user_answer] || 0;
          }
        });
        
        setAnswers(savedAnswers);
        console.log(`Carregadas ${Object.keys(savedAnswers).length} respostas já salvas`);
      } catch (error) {
        console.error('Erro ao carregar respostas salvas:', error);
        // Se der erro, continuar sem as respostas salvas
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadSavedAnswers();
  }, [examId]);

  // Verificar se há questões disponíveis
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                ⚠️ Nenhuma Questão Disponível
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Não foi possível carregar as questões do simulado.</p>
              <p className="text-sm text-gray-600">
                Isso pode acontecer se o banco de dados estiver vazio ou se houver problemas de conectividade.
              </p>
              <Button onClick={onBack} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Configuração
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Load answer for current question
    if (answers[questions[currentQuestion]?.id] !== undefined) {
      setSelectedAnswer(answers[questions[currentQuestion].id]);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestion, answers, questions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: answerIndex
    };
    setAnswers(newAnswers);

    // Chamar API para salvar a resposta
    try {
      const letterMap = ['A', 'B', 'C', 'D', 'E'];
      const answerLetter = letterMap[answerIndex];
      
      await examApiService.updateAnswer(examId, {
        question_id: questions[currentQuestion].id,
        user_answer: answerLetter
      });
      
      console.log(`Resposta salva: Questão ${questions[currentQuestion].id} = ${answerLetter}`);
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      // Não bloquear a UI por erro de rede, mas mostrar no console
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Finalizar o exame
      await examApiService.finalizeExam(examId);
      console.log('Exame finalizado com sucesso');
      
      // Buscar os detalhes do exame com gabarito
      const examDetails = await examApiService.getExamDetails(examId);
      console.log('Detalhes do exame obtidos:', examDetails);
      
      // Passar os detalhes para a tela de resultados
      onFinish(examDetails);
    } catch (error) {
      console.error('Erro ao finalizar exame:', error);
      alert('Erro ao finalizar o exame. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (!questions.length) return null;

  const question = questions[currentQuestion];
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
        {/* Loading State */}
        {isLoadingAnswers ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Clock className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-lg text-gray-600">Carregando exame...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  {answeredQuestions}/{questions.length} respondidas
                </div>
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Clock className="w-5 h-5 text-red-500" />
                  <span className={timeLeft < 300 ? "text-red-500" : "text-gray-700"}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Questão {currentQuestion + 1}
              </CardTitle>
              <div className="flex gap-2">
                <Badge 
                  variant="secondary" 
                  className={subjectColors[question.subject] || "bg-gray-100 text-gray-800"}
                >
                  {question.subject.charAt(0).toUpperCase() + question.subject.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {question.statement}
              </p>
            </div>

            <RadioGroup 
              value={selectedAnswer?.toString() || ""} 
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {question.alternatives.map((alternative, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`alt-${index}`} />
                  <Label 
                    htmlFor={`alt-${index}`} 
                    className="flex-1 cursor-pointer leading-relaxed"
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {alternative}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentQuestion === questions.length - 1 ? (
              <Button 
                onClick={handleFinish} 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                {isSubmitting ? 'Finalizando...' : 'Finalizar Simulado'}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Próxima
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h3 className="text-sm mb-3 text-gray-600">Navegação rápida:</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "default" : answers[questions[index].id] !== undefined ? "secondary" : "outline"}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}