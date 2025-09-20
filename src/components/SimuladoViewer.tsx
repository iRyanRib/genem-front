import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Flag } from "lucide-react";
import { Question } from "../types/Question";

interface SimuladoViewerProps {
  questions: Question[];
  timeLimit: number;
  onFinish: (answers: Record<string, number>, timeSpent: number) => void;
  onBack: () => void;
}

export default function SimuladoViewer({ questions, timeLimit, onFinish, onBack }: SimuladoViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

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

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answerIndex
    }));
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

  const handleFinish = () => {
    const timeSpent = (timeLimit * 60) - timeLeft;
    onFinish(answers, timeSpent);
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
                <Badge variant="outline">
                  {question.difficulty}
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
              <Button onClick={handleFinish} className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Finalizar Simulado
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
      </div>
    </div>
  );
}