import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Brain, Target, Loader2, Clock, FileText, Sparkles, CheckCircle } from "lucide-react";
import TopicCascadeFilter from "./TopicCascadeFilter";
import { Separator } from "./ui/separator";

interface SimuladoBuilderProps {
  onGenerateSimulado: (config: SimuladoConfig) => void;
  isGenerating?: boolean;
}

export interface SimuladoConfig {
  description: string;
  totalQuestions: number;
  timeLimit: number;
  topicIds: string[];
}



export default function SimuladoBuilder({ onGenerateSimulado, isGenerating = false }: SimuladoBuilderProps) {
  const [description, setDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(25);
  const [timeLimit, setTimeLimit] = useState(60);
  const [topicIds, setTopicIds] = useState<string[]>([]);

  const handleGenerate = () => {
    onGenerateSimulado({
      description,
      totalQuestions,
      timeLimit,
      topicIds
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top duration-500">
          <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            EnemIA Simulados
          </h1>
          <p className="text-gray-600 text-lg">
            Crie simulados personalizados com inteligência artificial
          </p>
        </div>

        {/* Descrição do Simulado (Em Desenvolvimento) */}
        <Card className="mb-6 shadow-lg border-orange-200 bg-gradient-to-br from-white to-orange-50/20 animate-in fade-in slide-in-from-left duration-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  Descrição do Simulado
                  <Badge variant="outline" className="ml-2 text-orange-600 border-orange-400 bg-orange-50">
                    Em Desenvolvimento
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Descreva os tópicos ou tipos de questões que você gostaria de praticar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex gap-2 items-start">
                <div className="bg-orange-200 rounded-full p-1 mt-0.5">
                  <FileText className="w-4 h-4 text-orange-700" />
                </div>
                <p className="text-sm text-orange-800">
                  <strong>Nota:</strong> Esta funcionalidade está em desenvolvimento e não afeta a seleção de questões no momento.
                  Use os filtros abaixo para controlar os tópicos do simulado.
                </p>
              </div>
            </div>
            <Textarea
              placeholder="Ex: Quero praticar equações do segundo grau, funções logarítmicas, problemas de geometria espacial, interpretação de texto com foco em literatura brasileira..."
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </CardContent>
        </Card>

        {/* Filtros de Tópicos em Cascata */}
        <div className="mb-6 animate-in fade-in slide-in-from-right duration-500 delay-100">
          <TopicCascadeFilter onTopicsChange={setTopicIds} />
        </div>

        {/* Configurações do Simulado */}
        <Card className="mb-6 shadow-lg border-purple-200 bg-gradient-to-br from-white to-purple-50/20 animate-in fade-in slide-in-from-left duration-500 delay-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Configurações do Simulado</CardTitle>
                <CardDescription className="mt-1">
                  {topicIds.length > 0 
                    ? `Configure seu simulado personalizado com ${topicIds.length} tópico${topicIds.length > 1 ? 's' : ''} selecionado${topicIds.length > 1 ? 's' : ''}`
                    : 'Configure a quantidade de questões e tempo limite para seu simulado'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Indicador de Filtros */}
            {topicIds.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Filtros Ativos</p>
                    <p className="text-sm text-blue-700">
                      As questões serão selecionadas dos {topicIds.length} tópicos filtrados
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                    {topicIds.length} tópico{topicIds.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quantidade de Questões */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <Label htmlFor="totalQuestions" className="text-base font-semibold">
                    Quantidade de Questões
                  </Label>
                </div>
                <Input
                  id="totalQuestions"
                  type="number"
                  min="1"
                  max="100"
                  value={totalQuestions}
                  onChange={(e: any) => setTotalQuestions(parseInt(e.target.value) || 1)}
                  className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Mínimo: 1</span>
                  <span>Máximo: 100</span>
                </div>
                {totalQuestions > 0 && totalQuestions <= 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${(totalQuestions / 100) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Tempo Limite */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <Label htmlFor="timeLimit" className="text-base font-semibold">
                    Tempo Limite (minutos)
                  </Label>
                </div>
                <Input
                  id="timeLimit"
                  type="number"
                  min="15"
                  max="300"
                  value={timeLimit}
                  onChange={(e: any) => setTimeLimit(parseInt(e.target.value) || 15)}
                  className="text-lg h-12 border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Mínimo: 15 min</span>
                  <span>Máximo: 5 horas</span>
                </div>
                {totalQuestions > 0 && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-200">
                    <strong>Sugestão:</strong> ~{Math.ceil(totalQuestions * 3.5)} minutos 
                    <span className="text-xs text-gray-500"> (3-4 min/questão)</span>
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Resumo */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Resumo do Simulado
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                  <p className="text-xs text-gray-600">Questões</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{timeLimit}</p>
                  <p className="text-xs text-gray-600">Minutos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {Math.round((timeLimit / totalQuestions) * 10) / 10}
                  </p>
                  <p className="text-xs text-gray-600">Min/Questão</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{topicIds.length || 'Todos'}</p>
                  <p className="text-xs text-gray-600">Tópicos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Gerar Simulado */}
        <Card className="shadow-xl border-2 border-gradient-to-r from-blue-500 to-indigo-600 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
          <CardContent className="pt-6">
            <Button 
              onClick={handleGenerate}
              className="w-full h-14 text-lg font-semibold !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={totalQuestions < 1 || totalQuestions > 100 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Gerando Simulado...
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6 mr-3" />
                  {topicIds.length > 0 ? 'Gerar Simulado Personalizado' : 'Gerar Simulado Aleatório'}
                </>
              )}
            </Button>
            
            {(totalQuestions < 1 || totalQuestions > 100) && !isGenerating && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center font-medium">
                  ⚠️ A quantidade de questões deve estar entre 1 e 100
                </p>
              </div>
            )}
            
            {isGenerating && (
              <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 text-center font-medium">
                  {topicIds.length > 0 
                    ? `🎯 Criando simulado com ${totalQuestions} questões dos tópicos selecionados...`
                    : `🎲 Criando simulado com ${totalQuestions} questões aleatórias...`
                  }
                </p>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Isso pode levar alguns segundos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}