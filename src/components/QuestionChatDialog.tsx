import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Bot, User, Send, Loader2, MessageCircle, AlertCircle, Wand2 } from "lucide-react";
import { Question } from "../types/Question";
import { ConversationSession, ChatMessage } from "../types/Conversation";
import { conversationApiService } from "../services/conversationApi";

interface QuestionChatDialogProps {
  question: Question;
  isWrongAnswer: boolean;
  trigger?: React.ReactNode;
}

export default function QuestionChatDialog({ 
  question, 
  isWrongAnswer, 
  trigger 
}: QuestionChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    if (session) return; // Already have a session

    setIsLoading(true);
    setError(null);
    
    try {
      // Usar o ID real da questão do MongoDB
      const questionId = question.id;
      console.log('🤖 Abrindo conversa para questão:', questionId);
      
      const newSession = await conversationApiService.openConversation(questionId);
      setSession(newSession);
    } catch (error) {
      console.error('Error opening conversation:', error);
      
               // Verificar o tipo específico do erro
               let errorMessage = 'Não foi possível conectar com a IA.';
               
               if (error instanceof Error) {
                 if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                   errorMessage = '⚠️ Requisição bloqueada. Verifique se há um AdBlocker ativo ou se a API está rodando.';
                 } else if (error.message.includes('Network Error') || error.message.includes('CORS')) {
                   errorMessage = '🌐 Erro de CORS. A API de IA precisa permitir requisições do frontend. Verifique se a API está rodando e configurada corretamente.';
                 } else if (error.message.includes('404')) {
                   errorMessage = '🔍 API não encontrada. Verifique se o endpoint está correto.';
                 } else if (error.message.includes('ERR_FAILED')) {
                   errorMessage = '🔌 Falha na conexão. Verifique se a API de IA está rodando em http://localhost:8000';
                 }
               }
      
      setError(errorMessage);
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
      // The service automatically updates the session with the new messages
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

  const handleTriggerClick = () => {
    setIsOpen(true);
    if (!session) {
      handleOpenConversation();
    }
  };

  const defaultTrigger = isWrongAnswer ? (
    <Button
      size="sm"
      variant="outline"
      className="h-7 w-7 p-0 hover:bg-purple-50 hover:border-purple-300"
      onClick={handleTriggerClick}
    >
      <Wand2 className="w-3 h-3 text-purple-600" />
    </Button>
  ) : (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleTriggerClick}
    >
      <MessageCircle className="w-4 h-4" />
      Saiba mais
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <div onClick={handleTriggerClick}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}
      <DialogContent className="max-w-2xl max-h-[80vh]" aria-describedby="chat-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Chat com IA - {question.title}
            {isWrongAnswer && (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                Resposta Incorreta
              </Badge>
            )}
          </DialogTitle>
          <div id="chat-description" className="sr-only">
            Chat de ajuda com inteligência artificial para esclarecer dúvidas sobre a questão
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[60vh]">
          {/* Question Context */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contexto da Questão</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <div className="space-y-2">
                <div>
                  <strong>Matéria:</strong> {question.subject}
                </div>
                <div>
                  <strong>Ano:</strong> {question.year}
                </div>
                {question.summary && (
                  <div>
                    <strong>Resumo:</strong> {question.summary}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
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
                        ? "Nossa IA pode explicar a resposta correta e tirar suas dúvidas sobre esta questão."
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
                          <div className="whitespace-pre-line">{message.content}</div>
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
                <div className="flex gap-2">
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
              <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <div className="font-medium mb-2">❌ Erro ao conectar com a IA</div>
                <div className="mb-3">{error}</div>
                
                       <div className="text-xs bg-red-100 p-2 rounded">
                         <div className="font-medium mb-1">💡 Como resolver:</div>
                         <ul className="list-disc list-inside space-y-1">
                           <li>Verifique se a API está rodando em <code>http://localhost:8000</code></li>
                           <li>Configure CORS na API de IA para permitir <code>http://localhost:3000</code></li>
                           <li>Desative AdBlockers que podem bloquear a requisição</li>
                           <li>Teste diretamente: <code>{`curl -X POST http://localhost:8000/api/v1/conversation/open -H "Content-Type: application/json" -d '{"question_id":"67f9a81c35cdd73c2d40ebfe","user_id":"test","structured_output":false}'`}</code></li>
                         </ul>
                       </div>
                
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
      </DialogContent>
    </Dialog>
  );
}
