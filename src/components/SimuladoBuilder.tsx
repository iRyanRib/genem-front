import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { BookOpen, Brain, Clock, Target, Loader2 } from "lucide-react";
import { simuladoService } from "../services/simuladoService";

interface SimuladoBuilderProps {
  onGenerateSimulado: (config: SimuladoConfig) => void;
  isGenerating?: boolean;
}

export interface SimuladoConfig {
  description: string;
  subjects: string[];
  difficulty: string;
  questionsPerSubject: number;
  timeLimit: number;
}

const defaultSubjects = [
  { id: "Matemática", name: "Matemática", color: "bg-blue-100 text-blue-800" },
  { id: "Ciências da Natureza", name: "Ciências da Natureza", color: "bg-green-100 text-green-800" },
  { id: "Ciências Humanas", name: "Ciências Humanas", color: "bg-yellow-100 text-yellow-800" },
  { id: "Linguagens", name: "Linguagens", color: "bg-purple-100 text-purple-800" },
];

export default function SimuladoBuilder({ onGenerateSimulado, isGenerating = false }: SimuladoBuilderProps) {
  const [description, setDescription] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("medio");
  const [questionsPerSubject, setQuestionsPerSubject] = useState(5);
  const [timeLimit, setTimeLimit] = useState(60);
  const [availableSubjects, setAvailableSubjects] = useState(defaultSubjects);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Load available subjects from database
  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const subjects = await simuladoService.getAvailableSubjects();
        const subjectsWithColors = subjects.map((subject, index) => ({
          id: subject,
          name: subject,
          color: defaultSubjects[index % defaultSubjects.length]?.color || "bg-gray-100 text-gray-800"
        }));
        setAvailableSubjects(subjectsWithColors);
      } catch (error) {
        console.error('Error loading subjects:', error);
        // Keep default subjects if error
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, []);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleGenerate = () => {
    onGenerateSimulado({
      description,
      subjects: selectedSubjects,
      difficulty,
      questionsPerSubject,
      timeLimit
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2 text-gray-800">EnemIA Simulados</h1>
          <p className="text-gray-600">Crie simulados personalizados com inteligência artificial</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Descrição do Simulado
            </CardTitle>
            <CardDescription>
              Descreva os tópicos, assuntos específicos ou tipos de questões que você gostaria de praticar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Quero praticar equações do segundo grau, funções logarítmicas, problemas de geometria espacial, interpretação de texto com foco em literatura brasileira..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Matérias
              </CardTitle>
              <CardDescription>
                Selecione as matérias que deseja incluir no simulado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubjects ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Carregando matérias...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                      />
                      <Label
                        htmlFor={subject.id}
                        className="cursor-pointer flex-1"
                      >
                        <Badge variant="secondary" className={subject.color}>
                          {subject.name}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Configurações
              </CardTitle>
              <CardDescription>
                Ajuste a dificuldade e formato do simulado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questionsPerSubject">Questões por Matéria</Label>
                <Input
                  id="questionsPerSubject"
                  type="number"
                  min="1"
                  max="20"
                  value={questionsPerSubject}
                  onChange={(e) => setQuestionsPerSubject(parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total: {selectedSubjects.length * questionsPerSubject} questões
                </p>
              </div>

              <div>
                <Label htmlFor="timeLimit">Tempo Limite (minutos)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="15"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleGenerate}
              className="w-full h-12"
              disabled={selectedSubjects.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Simulado...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Gerar Simulado com IA
                </>
              )}
            </Button>
            {selectedSubjects.length === 0 && !isGenerating && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Selecione pelo menos uma matéria para gerar o simulado
              </p>
            )}
            {isGenerating && (
              <p className="text-sm text-blue-600 text-center mt-2">
                Buscando questões no banco de dados...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}