import { useState } from "react";
import SimuladoBuilder, { SimuladoConfig } from "./components/SimuladoBuilder";
import SimuladoViewer from "./components/SimuladoViewer";
import SimuladoResults from "./components/SimuladoResults";
import { Question } from "./types/Question";
import { simuladoService } from "./services/simuladoService";

type AppState = 'builder' | 'simulado' | 'results';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('builder');
  const [currentSimulado, setCurrentSimulado] = useState<Question[]>([]);
  const [simuladoConfig, setSimuladoConfig] = useState<SimuladoConfig | null>(null);
  const [simuladoAnswers, setSimuladoAnswers] = useState<Record<string, number>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateSimulado = async (config: SimuladoConfig) => {
    setIsGenerating(true);
    try {
      // Use real data from database
      const questions = await simuladoService.generateSimulado(config);
      setCurrentSimulado(questions);
      setSimuladoConfig(config);
      setCurrentState('simulado');
    } catch (error) {
      console.error('Error generating simulado:', error);
      // Could show error message to user here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishSimulado = (answers: Record<string, number>, timeSpent: number) => {
    setSimuladoAnswers(answers);
    setTimeSpent(timeSpent);
    setCurrentState('results');
  };

  const handleRestartSimulado = () => {
    setSimuladoAnswers({});
    setTimeSpent(0);
    setCurrentState('simulado');
  };

  const handleNewSimulado = () => {
    setCurrentSimulado([]);
    setSimuladoConfig(null);
    setSimuladoAnswers({});
    setTimeSpent(0);
    setCurrentState('builder');
  };

  const handleBackToBuilder = () => {
    setCurrentState('builder');
  };

  if (currentState === 'builder') {
    return (
      <SimuladoBuilder 
        onGenerateSimulado={handleGenerateSimulado}
        isGenerating={isGenerating}
      />
    );
  }

  if (currentState === 'simulado' && simuladoConfig) {
    return (
      <SimuladoViewer
        questions={currentSimulado}
        timeLimit={simuladoConfig.timeLimit}
        onFinish={handleFinishSimulado}
        onBack={handleBackToBuilder}
      />
    );
  }

  if (currentState === 'results') {
    return (
      <SimuladoResults
        questions={currentSimulado}
        answers={simuladoAnswers}
        timeSpent={timeSpent}
        onRestart={handleRestartSimulado}
        onNewSimulado={handleNewSimulado}
      />
    );
  }

  return null;
}