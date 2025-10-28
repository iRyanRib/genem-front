import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Bot, User, Send, Loader2, MessageCircle, AlertCircle, Wand2, X } from "lucide-react";
import { Question } from "../types/Question";
import { ConversationSession } from "../types/Conversation";
import { conversationApiService } from "../services/conversationApi";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface QuestionChatDialogProps {
  question: Question;
  isWrongAnswer: boolean;
  onClose: () => void;
}

export default function QuestionChatDialog({ 
  question, 
  isWrongAnswer,
  onClose
}: QuestionChatDialogProps) {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (session && session.messages.length > 0) {
      scrollToBottom();
    }
  }, [session?.messages]);

  const handleOpenConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const questionId = question.id;
      console.log('🤖 Verificando conversa para questão:', questionId);
      
      const existingSessions = conversationApiService.getSessionsByQuestion(questionId);
      
      if (existingSessions.length > 0) {
        const existingSession = existingSessions.find(s => s.isActive) || existingSessions[0];
        console.log('♻️ Reutilizando conversa existente:', existingSession.sessionId);
        setSession(existingSession);
      } else {
        console.log('🆕 Criando nova conversa para questão:', questionId);
        const newSession = await conversationApiService.openConversation(questionId);
        setSession(newSession);
      }
    } catch (error) {
      console.error('Error opening conversation:', error);
      setError('Não foi possível conectar com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !session || isSending) return;

    const messageToSend = currentMessage.trim();
    setCurrentMessage('');
    setIsSending(true);
    setError(null);

    try {
      await conversationApiService.sendMessage(session.sessionId, messageToSend);
      const updatedSession = conversationApiService.getSession(session.sessionId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  // Abre a conversa quando o componente é montado OU quando a questão muda
  useEffect(() => {
    console.log('🎯 Chat aberto/questão mudou - verificando sessão');
    
    // Sempre criar nova sessão quando a questão mudar
    console.log('🆕 Nova questão detectada - criando nova sessão');
    setSession(null); // Limpar sessão anterior
    handleOpenConversation();
  }, [question.id]); // Executar quando a questão mudar

  const handleCloseDialog = () => {
    console.log('❌ Fechando modal - chamando onClose');
    onClose();
  };

  console.log('🎨 QuestionChatDialog renderizado - Questão ID:', question.id);
  console.log('🎨 Usando position relative para empurrar conteúdo');

  return (
    <>
      {/* Backdrop/Overlay - Mantém fixed para cobrir toda a tela */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={handleCloseDialog}
      />
      
          {/* Chat Panel - Position RELATIVE com margin-top inline */}
          <div 
            className="relative z-50 bg-white flex flex-col"
            style={{ 
              marginTop: '25px',  // Espaçamento superior de 120px
              marginBottom: '8px', // Espaçamento inferior de 80px
              height: '85vh',
              minHeight: '600px',
              maxHeight: 'calc(100vh - 200px)',
              border: '6px solid #3b82f6', // Borda azul
              borderRadius: '30px 30px 0 0',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.3)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ 
                background: 'linear-gradient(to right, #eff6ff, #faf5ff)',
                borderRadius: '24px 24px 0 0'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Chat com IA
                    {isWrongAnswer && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Incorreta
                      </Badge>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {question.title} • {question.subject} • {question.year}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDialog}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Fechar</span>
              </button>
            </div>

            {/* Content Container - Remove max-width restriction */}
            <div className="flex-1 overflow-hidden p-4 bg-gray-50">
              <div className="w-full h-full flex flex-col gap-4 px-4">
                {!session ? (
                  <div className="flex-1 flex items-center justify-center">
                    {isLoading ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="text-gray-600">Iniciando conversa com a IA...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Bot className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                        <h3 className="text-lg font-medium mb-2">
                          {isWrongAnswer ? "Precisa de ajuda?" : "Quer saber mais?"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {isWrongAnswer 
                            ? "Nossa IA pode explicar a resposta correta e tirar suas dúvidas."
                            : "Nossa IA pode fornecer explicações adicionais sobre esta questão."
                          }
                        </p>
                        <Button onClick={handleOpenConversation} disabled={isLoading}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Iniciar Conversa
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-4 pr-4">
                        {session.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {message.role === 'assistant' ? (
                                <MarkdownRenderer 
                                  content={message.content}
                                  className="text-gray-800"
                                />
                              ) : (
                                <div className="whitespace-pre-line">{message.content}</div>
                              )}
                              <div
                                className={`text-xs mt-1 ${
                                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </div>
                            </div>

                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                        {isSending && (
                          <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-gray-600">IA está digitando...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex gap-2 shrink-0">
                      <Input
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua dúvida..."
                        disabled={isSending}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!currentMessage.trim() || isSending}
                        size="sm"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm shrink-0">
                    <div className="font-medium mb-2">❌ Erro ao conectar com a IA</div>
                    <div className="mb-3">{error}</div>
                    <Button 
                      onClick={() => {
                        setError(null);
                        handleOpenConversation();
                      }}
                      size="sm" 
                      className="mt-3"
                    >
                      🔄 Tentar Novamente
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
    </>
  );
}
