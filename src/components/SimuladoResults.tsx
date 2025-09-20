import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle, XCircle, Clock, RotateCcw, Home, Wand2 } from "lucide-react";
import { Question } from "../types/Question";
import QuestionChatDialog from "./QuestionChatDialog";


interface SimuladoResultsProps {
  questions: Question[];
  answers: Record<string, number>;
  timeSpent: number;
  onRestart: () => void;
  onNewSimulado: () => void;
}

export default function SimuladoResults({ 
  questions, 
  answers, 
  timeSpent, 
  onRestart, 
  onNewSimulado 
}: SimuladoResultsProps) {
  
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

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
  const subjectStats = questions.reduce((acc, question) => {
    const subject = question.subject;
    if (!acc[subject]) {
      acc[subject] = { total: 0, correct: 0 };
    }
    acc[subject].total++;
    if (answers[question.id] === question.correctAnswer) {
      acc[subject].correct++;
    }
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);



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
                <div className="text-2xl text-red-600">{answeredQuestions - correctAnswers}</div>
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
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                const wasAnswered = userAnswer !== undefined;
                const isIncorrect = wasAnswered && !isCorrect;
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
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
                            <QuestionChatDialog 
                              question={question}
                              isWrongAnswer={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {wasAnswered && (
                        <div className="flex gap-4">
                          <span>
                            Sua resposta: {String.fromCharCode(65 + userAnswer)}
                          </span>
                          <span>
                            Resposta correta: {String.fromCharCode(65 + question.correctAnswer)}
                          </span>
                        </div>
                      )}
                      {!wasAnswered && (
                        <span>
                          Resposta correta: {String.fromCharCode(65 + question.correctAnswer)}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Refazer Simulado
          </Button>
          <Button onClick={onNewSimulado} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Novo Simulado
          </Button>
        </div>
      </div>
    </div>
  );
}