import { useState, useEffect, useRef } from 'react';
import { examApiService, ExamSummary, ExamTotalizers } from '../services/examApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Loader2, 
  TrendingUp,
  ArrowLeft,
  Eye,
  Trash2,
  BarChart3,
  Award,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ExamHistoryProps {
  onViewExam: (examId: string) => void;
  onBack: () => void;
}

const FAKE_USER_ID = '507f1f77bcf86cd799439011';

export default function ExamHistory({ onViewExam, onBack }: ExamHistoryProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalizers, setTotalizers] = useState<ExamTotalizers>({
    total_exams: 0,
    finished_exams: 0,
    in_progress_exams: 0,
    not_started_exams: 0,
    total_questions_answered: 0,
    total_correct_answers: 0,
    total_wrong_answers: 0,
    average_score: 0,
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    total: 0,
    returned: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  // Usar ref para manter o estado durante re-renders
  const dialogStateRef = useRef({ isOpen: false, examId: null as string | null });

  useEffect(() => {
    loadData();
  }, [pagination.skip, statusFilter, dateStart, dateEnd]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Montar filtros
      const options: any = {
        skip: pagination.skip,
        limit: pagination.limit,
      };
      if (statusFilter) options.status = statusFilter;
      if (dateStart) options.created_after = dateStart;
      if (dateEnd) options.created_before = dateEnd;
      // Carregar exames paginados e totalizadores em paralelo
      const [examsResponse, totalizersData] = await Promise.all([
        examApiService.getUserExams(FAKE_USER_ID, options),
        examApiService.getUserTotalizers(FAKE_USER_ID)
      ]);
      setExams(examsResponse.exams);
      setTotalizers(totalizersData);
      setPagination(examsResponse.pagination);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;

    try {
      await examApiService.deleteExam(examToDelete, FAKE_USER_ID);
      // Fechar dialog
      dialogStateRef.current = { isOpen: false, examId: null };
      setDeleteDialogOpen(false);
      setExamToDelete(null);
      // Recarrega a lista e os totalizadores
      await loadData();
    } catch (error) {
  console.error('Erro ao deletar exame:', error);
      alert('Erro ao deletar exame. Por favor, tente novamente.');
    }
  };

  const openDeleteDialog = (examId: string) => {
    dialogStateRef.current = { isOpen: true, examId };
    setTimeout(() => {
      setExamToDelete(examId);
      setDeleteDialogOpen(true);
    }, 0);
  };
  
  // Sincronizar ref com estado após re-render
  useEffect(() => {
    if (dialogStateRef.current.isOpen && !deleteDialogOpen) {
      setDeleteDialogOpen(true);
      setExamToDelete(dialogStateRef.current.examId);
    }
  }, [deleteDialogOpen]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finished':
        return <Badge className="bg-green-500">Finalizado</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">Em Progresso</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-500">Não Iniciado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateScore = (exam: ExamSummary) => {
    if (exam.total_questions === 0) return 0;
    return Math.round((exam.total_correct_answers / exam.total_questions) * 100);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Histórico de Exames
              </h1>
              <p className="text-gray-600">Acompanhe seu desempenho e progresso</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Exames</p>
                    <p className="text-3xl font-bold text-blue-600">{totalizers.total_exams}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Finalizados</p>
                    <p className="text-3xl font-bold text-green-600">{totalizers.finished_exams}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Questões</p>
                    <p className="text-3xl font-bold text-purple-600">{totalizers.total_questions_answered}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Acertos</p>
                    <p className="text-3xl font-bold text-orange-600">{totalizers.total_correct_answers}</p>
                  </div>
                  <Award className="w-10 h-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Média Geral</p>
                    <p className="text-3xl font-bold text-indigo-600">{totalizers.average_score.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-indigo-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exam List */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Seus Exames</CardTitle>
              <CardDescription>
                {pagination.total > 0 
                  ? `Mostrando ${pagination.returned} de ${pagination.total} exames`
                  : 'Nenhum exame encontrado'}
              </CardDescription>
            </div>
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow transition ${showFilters ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => setShowFilters(v => !v)}
              title="Filtrar exames"
            >
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Filtrar</span>
            </button>
          </CardHeader>
          <CardContent>
            {/* Filtros visíveis apenas se showFilters */}
            {showFilters && (
              <>
                {/* Overlay de fundo */}
                <div 
                  className="fixed inset-0 bg-black/20 z-40"
                  onClick={() => setShowFilters(false)}
                />
                
                {/* Panel lateral de filtros */}
                <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                  <div className="flex flex-col h-full">
                    {/* Header do painel */}
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded">
                            <Filter className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-800">Filtros</h3>
                        </div>
                        <button 
                          onClick={() => setShowFilters(false)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo dos filtros */}
                    <div className="flex-1 p-4 space-y-4">
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Todos os status</option>
                          <option value="finished">Finalizado</option>
                          <option value="in_progress">Em Progresso</option>
                          <option value="not_started">Não Iniciado</option>
                        </select>
                      </div>

                      {/* Data Inicial */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                        <input
                          type="date"
                          value={dateStart}
                          onChange={e => setDateStart(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Data Final */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                        <input
                          type="date"
                          value={dateEnd}
                          onChange={e => setDateEnd(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Footer com botões */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setStatusFilter('');
                            setDateStart('');
                            setDateEnd('');
                            setPagination(prev => ({ ...prev, skip: 0 }));
                            loadData();
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Limpar
                        </button>
                        <button
                          onClick={() => {
                            setPagination(prev => ({ ...prev, skip: 0 }));
                            loadData();
                            setShowFilters(false);
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Nenhum exame realizado ainda</p>
                <p className="text-gray-400 text-sm">Comece criando um novo simulado!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-md transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusBadge(exam.status)}
                            {exam.status === 'finished' && (
                              <Badge variant="outline" className="bg-blue-50">
                                {calculateScore(exam)}% de acerto
                              </Badge>
                            )}
                            {exam.status === 'in_progress' && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                {exam.answered_questions} de {exam.total_questions} respondidas
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(exam.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{exam.total_questions} questões</span>
                            </div>

                            {exam.status === 'finished' && (
                              <>
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{exam.total_correct_answers} acertos</span>
                                </div>

                                <div className="flex items-center gap-2 text-red-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{exam.total_wrong_answers} erros</span>
                                </div>
                              </>
                            )}
                            
                            {exam.status === 'in_progress' && (
                              <div className="flex items-center gap-2 text-yellow-600">
                                <Clock className="w-4 h-4" />
                                <span>Em andamento</span>
                              </div>
                            )}
                          </div>

                          {exam.finished_at && (
                            <div className="mt-2 text-xs text-gray-500">
                              Finalizado em: {formatDate(exam.finished_at)}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {exam.status === 'finished' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewExam(exam.id)}
                              className="hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Resultado
                            </Button>
                          )}
                          
                          {exam.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewExam(exam.id)}
                              className="hover:bg-gray-50"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Continuar
                            </Button>
                          )}
                          
                          {exam.status === 'not_started' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewExam(exam.id)}
                              className="hover:bg-gray-50"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Iniciar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(exam.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
                  disabled={pagination.skip === 0}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center px-4 text-sm text-gray-600">
                  Página {Math.floor(pagination.skip / pagination.limit) + 1} de{' '}
                  {Math.ceil(pagination.total / pagination.limit)}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
                  disabled={pagination.skip + pagination.limit >= pagination.total}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {/* Dialog HTML Simples */}
        {deleteDialogOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              dialogStateRef.current = { isOpen: false, examId: null };
              setExamToDelete(null);
              setDeleteDialogOpen(false);
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                Confirmar exclusão
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dialogStateRef.current = { isOpen: false, examId: null };
                    setExamToDelete(null);
                    setDeleteDialogOpen(false);
                  }}
                >
                  Cancelar
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteExam();
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
