import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bot, User, Send, MessageCircle, AlertCircle, X } from "lucide-react";
import { Question } from "../types/Question";
import { ConversationSession } from "../types/Conversation";
import { conversationApiService } from "../services/conversationApi";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface SimpleChatDialogProps {
  question: Question;
  isWrongAnswer: boolean;
  onClose: () => void;
}

export default function SimpleChatDialog({ 
  question, 
  isWrongAnswer,
  onClose
}: SimpleChatDialogProps) {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const questionId = question.id;
      const existingSessions = conversationApiService.getSessionsByQuestion(questionId);
      
      if (existingSessions.length > 0) {
        const existingSession = existingSessions.find(s => s.isActive) || existingSessions[0];
        setSession(existingSession);
      } else {
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

  // Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    if (session && session.messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [session?.messages.length]);

  // Abre a conversa quando o componente é montado
  useEffect(() => {
    setSession(null);
    handleOpenConversation();
  }, [question.id]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Chat Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-32">
        <div 
          className="bg-white rounded-3xl shadow-2xl border-t-4 border-blue-500 flex flex-col w-full max-w-4xl"
          style={{ 
            height: '80vh',
            maxHeight: '600px',
            minHeight: '500px'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Chat com IA
                {isWrongAnswer && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Incorreta
                  </Badge>
                )}
              </h2>
              <p className="text-sm text-gray-600 truncate max-w-[300px]">
                {question.title} • {question.subject} • {question.year}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!session ? (
          <div className="flex-1 flex items-center justify-center p-8">
            {isLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Iniciando conversa com a IA...</p>
              </div>
            ) : (
              <div className="text-center max-w-md">
                <Bot className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-medium mb-3">
                  {isWrongAnswer ? "Precisa de ajuda?" : "Quer saber mais?"}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {isWrongAnswer 
                    ? "Nossa IA pode explicar a resposta correta e tirar suas dúvidas sobre esta questão."
                    : "Nossa IA pode fornecer explicações adicionais e esclarecer conceitos desta questão."
                  }
                </p>
                <Button onClick={handleOpenConversation} disabled={isLoading} className="px-6">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Iniciar Conversa
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
              style={{
                scrollBehavior: 'smooth',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar da IA (esquerda) */}
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  
                  {/* Mensagem */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-700 text-black rounded-br-md shadow-lg border-2 border-blue-800 font-medium'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                    }`}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <div className="simple-chat-message">
                        <MarkdownRenderer 
                          content={message.content}
                          className="text-gray-800"
                        />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-black">
                        {message.content}
                      </div>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>

                  {/* Avatar do usuário (direita) */}
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Indicador de digitação */}
              {isSending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-600 text-sm">IA está digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4 shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua dúvida sobre a questão..."
                    disabled={isSending}
                    className="w-full rounded-2xl border-2 border-gray-200 focus:border-blue-500 px-4 py-3 resize-none outline-none transition-colors"
                    rows={1}
                    style={{ 
                      minHeight: '44px',
                      maxHeight: '120px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!currentMessage.trim() || isSending}
                  className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erro ao conectar com a IA</span>
            </div>
            <p className="text-sm mb-3">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                handleOpenConversation();
              }}
              size="sm" 
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-50"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
        </div>
      </div>
    </>
  );
}