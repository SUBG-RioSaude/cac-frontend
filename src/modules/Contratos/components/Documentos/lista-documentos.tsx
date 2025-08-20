import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Filter,
  Plus
} from 'lucide-react'

import type { DocumentoContrato, FiltroDocumento, EstatisticaDocumentos } from '@/modules/Contratos/types/documento-contrato'
import { CardDocumento } from './card-documento'
import { FiltroDocumentos } from './filtro-documentos'
import { NovoDocumentoDialog } from './novo-documento-dialog'

interface ListaDocumentosProps {
  documentos: DocumentoContrato[]
  estatisticas: EstatisticaDocumentos
  onStatusChange?: (id: string, status: DocumentoContrato['status']) => void
  onLinkChange?: (id: string, link: string) => void
  onObservacoesChange?: (id: string, observacoes: string) => void
  onAdicionarDocumento?: (documento: Omit<DocumentoContrato, 'id' | 'dataUpload' | 'dataUltimaVerificacao' | 'prioridade'>) => void
  usuarioAtual?: string
  className?: string
}

export function ListaDocumentos({ 
  documentos, 
  estatisticas,
  onStatusChange,
  onLinkChange,
  onObservacoesChange,
  onAdicionarDocumento,
  usuarioAtual = 'Usuário Atual',
  className 
}: ListaDocumentosProps) {
  const [filtro, setFiltro] = useState<FiltroDocumento>({
    categoria: 'todos',
    status: 'todos',
    tipo: 'todos',
    busca: ''
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const documentosFiltrados = useMemo(() => {
    return documentos.filter(doc => {
      // Filtro por categoria
      if (filtro.categoria && filtro.categoria !== 'todos' && doc.categoria !== filtro.categoria) {
        return false
      }

      // Filtro por status
      if (filtro.status && filtro.status !== 'todos' && doc.status !== filtro.status) {
        return false
      }

      // Filtro por tipo
      if (filtro.tipo && filtro.tipo !== 'todos' && doc.tipo.id !== filtro.tipo) {
        return false
      }

      // Filtro por busca
      if (filtro.busca) {
        const busca = filtro.busca.toLowerCase()
        return (
          doc.nome.toLowerCase().includes(busca) ||
          doc.descricao.toLowerCase().includes(busca) ||
          doc.tipo.nome.toLowerCase().includes(busca) ||
          doc.responsavel?.toLowerCase().includes(busca)
        )
      }

      return true
    }).sort((a, b) => {
      // Ordenar por prioridade (obrigatórios primeiro) e depois por status
      if (a.categoria === 'obrigatorio' && b.categoria === 'opcional') return -1
      if (a.categoria === 'opcional' && b.categoria === 'obrigatorio') return 1
      
      // Dentro da mesma categoria, ordenar por prioridade
      return a.prioridade - b.prioridade
    })
  }, [documentos, filtro])

  const obrigatorios = documentosFiltrados.filter(d => d.categoria === 'obrigatorio')
  const opcionais = documentosFiltrados.filter(d => d.categoria === 'opcional')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documentos do Contrato
            </CardTitle>
            
            <div className="flex items-center gap-3">
              {/* Botão Adicionar Documento */}
              {onAdicionarDocumento && (
                <NovoDocumentoDialog 
                  onAdicionarDocumento={onAdicionarDocumento}
                  usuarioAtual={usuarioAtual}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-teal-600 hover:bg-teal-700 text-white border border-teal-600 transition-colors font-medium">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  </motion.div>
                </NovoDocumentoDialog>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors',
                  mostrarFiltros 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                )}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </motion.button>
              
              <Badge variant="outline" className="font-medium">
                {documentosFiltrados.length} de {documentos.length} documentos
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso de Verificação</span>
              <span className="font-medium">{estatisticas.percentualCompleto}%</span>
            </div>
            <Progress value={estatisticas.percentualCompleto} className="h-2" />
          </div>

          {/* Resumo estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">{estatisticas.conferidos}</div>
                <div className="text-muted-foreground">Conferidos</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-600" />
              <div>
                <div className="font-medium">{estatisticas.pendentes}</div>
                <div className="text-muted-foreground">Pendentes</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="font-medium">{estatisticas.comPendencia}</div>
                <div className="text-muted-foreground">Com Pendência</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-medium">{estatisticas.obrigatoriosPendentes}</div>
                <div className="text-muted-foreground">Obrig. Pendentes</div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {estatisticas.obrigatoriosPendentes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <strong>Atenção:</strong> Existem {estatisticas.obrigatoriosPendentes} documento(s) obrigatório(s) pendente(s).
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Filtros */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiltroDocumentos
              filtro={filtro}
              onFiltroChange={setFiltro}
              documentos={documentos}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de documentos obrigatórios */}
      {obrigatorios.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Documentos Obrigatórios</h3>
            <Badge variant="destructive" className="text-xs">
              {obrigatorios.filter(d => d.status !== 'conferido').length} pendentes
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {obrigatorios.map((documento) => (
                <CardDocumento
                  key={documento.id}
                  documento={documento}
                  onStatusChange={onStatusChange}
                  onLinkChange={onLinkChange}
                  onObservacoesChange={onObservacoesChange}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Lista de documentos opcionais */}
      {opcionais.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Documentos Opcionais</h3>
            <Badge variant="outline" className="text-xs">
              {opcionais.length} documentos
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {opcionais.map((documento) => (
                <CardDocumento
                  key={documento.id}
                  documento={documento}
                  onStatusChange={onStatusChange}
                  onLinkChange={onLinkChange}
                  onObservacoesChange={onObservacoesChange}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {documentosFiltrados.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Nenhum documento encontrado
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Tente ajustar os filtros de busca para encontrar documentos.
          </p>
        </motion.div>
      )}
    </div>
  )
}