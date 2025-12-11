/**
 * ==========================================
 * COMPONENTE: TABELA-HISTORICO
 * ==========================================
 * Tabela principal de histórico de relatórios com estatísticas e filtros
 */

import { useState } from 'react'
import {
  FileText,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  HardDrive,
  FileStack,
  Briefcase,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { FiltroHistorico } from './filtro-historico'
import { CardRelatorio } from './card-relatorio'
import {
  useHistoricoRelatorios,
  useEstatisticasHistorico,
  useExcluirRelatorio,
  useLimparHistorico,
  useBaixarDoHistorico,
} from '../../hooks/use-historico-relatorios'
import type { FiltrosHistorico } from '../../types/historico'

// ========== TIPOS ==========

interface TabelaHistoricoProps {
  onVisualizarRelatorio?: (id: string) => void
}

// ========== COMPONENTE ==========

export const TabelaHistorico = ({ onVisualizarRelatorio }: TabelaHistoricoProps) => {
  // ========== ESTADO ==========

  const [filtros, setFiltros] = useState<FiltrosHistorico>({})
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null)
  const [mostrarDialogLimpar, setMostrarDialogLimpar] = useState(false)
  const [modoVisualizacao, setModoVisualizacao] = useState<'tabela' | 'cards'>('tabela')

  // ========== QUERIES E MUTATIONS ==========

  const { data: relatorios = [], isLoading, isError, error } = useHistoricoRelatorios(filtros)
  const { data: estatisticas } = useEstatisticasHistorico()

  const { mutate: excluir, isPending: excluindo } = useExcluirRelatorio({
    onSuccess: () => {
      setIdParaExcluir(null)
    },
  })

  const { mutate: limpar, isPending: limpando } = useLimparHistorico({
    onSuccess: () => {
      setMostrarDialogLimpar(false)
    },
  })

  const { mutate: baixar, isPending: baixando } = useBaixarDoHistorico()

  // ========== HANDLERS ==========

  const handleBaixar = (id: string) => {
    baixar(id)
  }

  const handleVisualizar = (id: string) => {
    if (onVisualizarRelatorio) {
      onVisualizarRelatorio(id)
    }
  }

  const handleExcluir = (id: string) => {
    setIdParaExcluir(id)
  }

  const confirmarExclusao = () => {
    if (idParaExcluir) {
      excluir(idParaExcluir)
    }
  }

  const handleLimparHistorico = () => {
    setMostrarDialogLimpar(true)
  }

  const confirmarLimparHistorico = () => {
    limpar()
  }

  // ========== RENDER HELPERS ==========

  const renderEstatisticas = () => {
    if (!estatisticas) return null

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            <FileStack className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalRelatorios}</div>
            <p className="text-muted-foreground text-xs">
              {estatisticas.porTipo?.length || 0}{' '}
              {(estatisticas.porTipo?.length || 0) === 1 ? 'tipo diferente' : 'tipos diferentes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalContratos}</div>
            <p className="text-muted-foreground text-xs">Incluídos nos relatórios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            <HardDrive className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.tamanhoTotalFormatado}</div>
            <p className="text-muted-foreground text-xs">Armazenamento utilizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Relatório</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.ultimaGeracao
                ? new Date(estatisticas.ultimaGeracao).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                : '-'}
            </div>
            <p className="text-muted-foreground text-xs">
              {estatisticas.ultimaGeracao
                ? new Date(estatisticas.ultimaGeracao).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                  })
                : 'Nenhum relatório'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderLoading = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div className="text-center">
        <FileText className="text-muted-foreground mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum relatório encontrado</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          {filtros.termoPesquisa || filtros.tipo?.length
            ? 'Tente ajustar os filtros'
            : 'Gere seu primeiro relatório na aba "Gerar"'}
        </p>
      </div>
    </div>
  )

  const renderTabela = () => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Arquivo</TableHead>
            <TableHead>Data de Geração</TableHead>
            <TableHead className="text-center">Contratos</TableHead>
            <TableHead className="text-right">Tamanho</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relatorios.map((relatorio) => (
            <TableRow key={relatorio.id}>
              <TableCell>
                <Badge variant="secondary" className="whitespace-nowrap">
                  {relatorio.tipoNome}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{relatorio.nomeArquivo}</TableCell>
              <TableCell>{relatorio.dataGeracaoFormatada}</TableCell>
              <TableCell className="text-center">{relatorio.quantidadeContratos}</TableCell>
              <TableCell className="text-right">{relatorio.tamanhoFormatado}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBaixar(relatorio.id)}
                    disabled={baixando}
                    title="Baixar relatório"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {onVisualizarRelatorio && relatorio.podeReabrir && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVisualizar(relatorio.id)}
                      title="Visualizar relatório"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExcluir(relatorio.id)}
                    disabled={excluindo}
                    className="text-destructive hover:text-destructive"
                    title="Excluir relatório"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderCards = () => (
    <div className="space-y-3">
      {relatorios.map((relatorio) => (
        <CardRelatorio
          key={relatorio.id}
          relatorio={relatorio}
          onBaixar={handleBaixar}
          onVisualizar={onVisualizarRelatorio ? handleVisualizar : undefined}
          onExcluir={handleExcluir}
          desabilitado={baixando || excluindo}
        />
      ))}
    </div>
  )

  // ========== RENDER PRINCIPAL ==========

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {renderEstatisticas()}

      {/* Filtros */}
      <FiltroHistorico
        filtros={filtros}
        onFiltrosChange={setFiltros}
        totalResultados={relatorios.length}
      />

      {/* Controles */}
      {relatorios.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={modoVisualizacao === 'tabela' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModoVisualizacao('tabela')}
              className="hidden sm:flex"
            >
              Tabela
            </Button>
            <Button
              variant={modoVisualizacao === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModoVisualizacao('cards')}
              className="hidden sm:flex"
            >
              Cards
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLimparHistorico}
            disabled={limpando || relatorios.length === 0}
          >
            {limpando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
              </>
            )}
          </Button>
        </div>
      )}

      {/* Conteúdo */}
      {isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar histórico: {error?.message || 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        renderLoading()
      ) : relatorios.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <div className="hidden sm:block">
            {modoVisualizacao === 'tabela' ? renderTabela() : renderCards()}
          </div>
          <div className="sm:hidden">{renderCards()}</div>
        </>
      )}

      {/* Dialog de exclusão */}
      <AlertDialog open={!!idParaExcluir} onOpenChange={() => setIdParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} disabled={excluindo}>
              {excluindo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de limpar histórico */}
      <AlertDialog open={mostrarDialogLimpar} onOpenChange={setMostrarDialogLimpar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Todo o Histórico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir TODOS os relatórios salvos? Esta ação não pode ser
              desfeita e removerá {estatisticas?.totalRelatorios || 0}{' '}
              {estatisticas?.totalRelatorios === 1 ? 'relatório' : 'relatórios'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={limpando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarLimparHistorico} disabled={limpando}>
              {limpando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Limpando...
                </>
              ) : (
                'Limpar Tudo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
