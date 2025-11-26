import {
  FileText,
  ExternalLink,
  Save,
  Calendar,
  BarChart3,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useMemo, useCallback, useEffect } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DateDisplay } from '@/components/ui/formatters'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { useDocumentos, useUpdateDocumentosMultiplos } from '../../hooks'
import type { DocumentoMultiplo } from '../../types/contrato'

interface TabDocumentosProps {
  contratoId: string
}

// Tipos de documento obrigatórios (1-8 conforme API)
const tiposDeDocumento = [
  {
    tipo: 1,
    nome: 'Termo de Referência/Edital',
    key: 'termo_referencia',
    apiName: 'TermoReferencia',
  },
  { tipo: 2, nome: 'Homologação', key: 'homologacao', apiName: 'Homologacao' },
  {
    tipo: 3,
    nome: 'Ata de Registro de Preços',
    key: 'ata_registro_precos',
    apiName: 'AtaRegistroPrecos',
  },
  {
    tipo: 4,
    nome: 'Garantia Contratual',
    key: 'garantia_contratual',
    apiName: 'GarantiaContratual',
  },
  { tipo: 5, nome: 'Contrato', key: 'contrato', apiName: 'Contrato' },
  {
    tipo: 6,
    nome: 'Publicação PNCP',
    key: 'publicacao_pncp',
    apiName: 'PublicacaoPNCP',
  },
  {
    tipo: 7,
    nome: 'Publicação de Extrato Contratual',
    key: 'publicacao_extrato',
    apiName: 'PublicacaoExtrato',
  },
  { tipo: 8, nome: 'Proposta', key: 'proposta', apiName: 'Proposta' },
]

interface DocumentoLocal {
  tipo: number
  nome: string
  key: string
  apiName: string
  selecionado: boolean
  urlDocumento: string
  observacoes: string
  dataEntrega?: string
}

export const TabDocumentos = ({ contratoId }: TabDocumentosProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const {
    data: documentosApi = [],
    isLoading,
    error,
  } = useDocumentos(contratoId)
  const updateMutation = useUpdateDocumentosMultiplos()

  // Espera o componente montar para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determina se está em dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark')

  // Estados para confirmações
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Estado local dos documentos (todos os 7 tipos sempre)
  const [documentosLocais, setDocumentosLocais] = useState<DocumentoLocal[]>(
    () =>
      tiposDeDocumento.map((tipo) => ({
        tipo: tipo.tipo,
        nome: tipo.nome,
        key: tipo.key,
        apiName: tipo.apiName,
        selecionado: false,
        urlDocumento: '',
        observacoes: '',
      })),
  )

  // Sincronizar com dados da API quando carregarem
  useMemo(() => {
    if (documentosApi.length > 0) {
      setDocumentosLocais((prev) =>
        prev.map((local) => {
          // Buscar documento da API pelo tipo numérico
          const docApi = documentosApi.find(
            (d) => d.tipo === local.tipo.toString(),
          )
          if (docApi) {
            return {
              ...local,
              selecionado: docApi.status === 'conferido', // baseado no campo 'ativo' da API
              urlDocumento:
                docApi.linkExterno && docApi.linkExterno !== 'sem url'
                  ? docApi.linkExterno
                  : '',
              observacoes: docApi.observacoes ?? '',
              dataEntrega: docApi.dataAtualizacao ?? undefined,
            }
          }
          return local
        }),
      )
    }
  }, [documentosApi])

  // Calcular progresso
  const progressData = useMemo(() => {
    const entregues = documentosLocais.filter((doc) => doc.selecionado).length
    const total = documentosLocais.length
    const percentual = total > 0 ? Math.round((entregues / total) * 100) : 0
    return { entregues, total, percentual }
  }, [documentosLocais])

  // Atualizar documento local
  const atualizarDocumento = useCallback(
    (key: string, campo: keyof DocumentoLocal, valor: string | boolean) => {
      setDocumentosLocais((prev) =>
        prev.map((doc) =>
          doc.key === key
            ? {
                ...doc,
                [campo]: valor,
                // Quando marca como selecionado, define data automaticamente
                ...(campo === 'selecionado' && valor === true
                  ? { dataEntrega: new Date().toISOString() }
                  : {}),
              }
            : doc,
        ),
      )

      // Marcar como tendo mudanças não salvas
      setHasUnsavedChanges(true)
    },
    [],
  )

  // Salvar todas as alterações (com confirmação)
  const handleSalvarTodos = useCallback(() => {
    setShowSaveConfirm(true)
  }, [])

  // Confirmar e salvar todas as alterações
  const confirmarSalvarTodos = useCallback(() => {
    const payload = {
      documentos: documentosLocais.map(
        (doc) =>
          ({
            tipoDocumento: doc.tipo,
            urlDocumento: doc.urlDocumento || 'sem url',
            dataEntrega: doc.dataEntrega ?? new Date().toISOString(),
            observacoes: doc.observacoes,
            selecionado: doc.selecionado,
          }) as DocumentoMultiplo,
      ),
    }

    updateMutation.mutate({ contratoId, payload })
    setShowSaveConfirm(false)
    setHasUnsavedChanges(false)
  }, [contratoId, documentosLocais, updateMutation])

  // Resetar alterações para estado original
  const handleResetarAlteracoes = useCallback(() => {
    setShowResetConfirm(true)
  }, [])

  // Confirmar e resetar todas as alterações
  const confirmarResetarAlteracoes = useCallback(() => {
    // Restaurar para o estado original da API
    if (documentosApi.length > 0) {
      setDocumentosLocais((prev) =>
        prev.map((local) => {
          const docApi = documentosApi.find(
            (d) => d.tipo === local.tipo.toString(),
          )
          if (docApi) {
            return {
              ...local,
              selecionado: docApi.status === 'conferido',
              urlDocumento:
                docApi.linkExterno && docApi.linkExterno !== 'sem url'
                  ? docApi.linkExterno
                  : '',
              observacoes: docApi.observacoes ?? '',
              dataEntrega: docApi.dataAtualizacao ?? undefined,
            }
          }
          // Para documentos que não existem na API, resetar para vazio
          return {
            ...local,
            selecionado: false,
            urlDocumento: '',
            observacoes: '',
            dataEntrega: undefined,
          }
        }),
      )
    } else {
      // Se não há dados da API, resetar tudo para vazio
      setDocumentosLocais((prev) =>
        prev.map((doc) => ({
          ...doc,
          selecionado: false,
          urlDocumento: '',
          observacoes: '',
          dataEntrega: undefined,
        })),
      )
    }

    setShowResetConfirm(false)
    setHasUnsavedChanges(false)
  }, [documentosApi])

  if (isLoading) {
    return (
      <Card className={cn(isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-card')}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o checklist de documentos.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={cn(isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-card')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn(
              'flex items-center gap-2',
              isDarkMode ? 'text-gray-100' : 'text-foreground',
            )}
          >
            <FileText className="h-5 w-5" />
            Checklist de Documentos
          </CardTitle>
          <Badge variant="outline">
            {progressData.entregues} de {progressData.total} entregues
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                'flex items-center gap-1',
                isDarkMode ? 'text-gray-300' : 'text-foreground',
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Progresso
            </span>
            <span
              className={cn(
                'font-medium',
                isDarkMode ? 'text-gray-300' : 'text-foreground',
              )}
            >
              {progressData.percentual}%
            </span>
          </div>
          <Progress value={progressData.percentual} className="h-2" />
        </div>

        {/* Grid de documentos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documentosLocais.map((documento) => (
            <div
              key={documento.key}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                documento.selecionado
                  ? isDarkMode
                    ? 'border-green-700/50 bg-green-950/40'
                    : 'border-green-200 bg-green-50'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white',
              )}
            >
              {/* Header do documento */}
              <div className="mb-3 flex items-start gap-2">
                <Checkbox
                  id={documento.key}
                  checked={documento.selecionado}
                  onCheckedChange={(checked) =>
                    atualizarDocumento(
                      documento.key,
                      'selecionado',
                      checked === true,
                    )
                  }
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor={documento.key}
                    className={cn(
                      'block text-xs leading-4 font-medium',
                      isDarkMode ? 'text-gray-200' : 'text-foreground',
                    )}
                  >
                    {documento.nome}
                  </Label>
                  {documento.selecionado && documento.dataEntrega && (
                    <div
                      className={cn(
                        'mt-1 flex items-center gap-1 text-xs',
                        isDarkMode ? 'text-green-400' : 'text-green-600',
                      )}
                    >
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        <DateDisplay
                          value={documento.dataEntrega}
                          options={{
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }}
                        />
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos compactos */}
              <div className="space-y-2">
                <div>
                  <Label
                    htmlFor={`url-${documento.key}`}
                    className={cn(
                      'mb-1 block text-xs',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600',
                    )}
                  >
                    URL (opcional)
                  </Label>
                  <div className="flex gap-1">
                    <Input
                      id={`url-${documento.key}`}
                      value={documento.urlDocumento}
                      onChange={(e) =>
                        atualizarDocumento(
                          documento.key,
                          'urlDocumento',
                          e.target.value,
                        )
                      }
                      placeholder="https://..."
                      className="h-8 flex-1 text-xs"
                    />
                    {documento.urlDocumento && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a
                          href={documento.urlDocumento}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor={`obs-${documento.key}`}
                    className={cn(
                      'mb-1 block text-xs',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600',
                    )}
                  >
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id={`obs-${documento.key}`}
                    value={documento.observacoes}
                    onChange={(e) =>
                      atualizarDocumento(
                        documento.key,
                        'observacoes',
                        e.target.value,
                      )
                    }
                    placeholder="Observações..."
                    className="h-16 resize-none text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botões de ação */}
        <div
          className={cn(
            'flex items-center justify-between border-t pt-4',
            isDarkMode ? 'border-gray-700' : 'border-gray-200',
          )}
        >
          <div className="flex items-center">
            {hasUnsavedChanges && (
              <span
                className={cn(
                  'flex items-center gap-1 text-sm',
                  isDarkMode ? 'text-orange-400' : 'text-orange-600',
                )}
              >
                <AlertCircle className="h-3 w-3" />
                Há alterações não salvas
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Botão de cancelar/resetar */}
            {hasUnsavedChanges && (
              <Button
                onClick={handleResetarAlteracoes}
                disabled={updateMutation.isPending}
                variant="outline"
                className={cn(
                  'flex items-center gap-2',
                  isDarkMode
                    ? 'border-red-800 text-red-400 hover:border-red-700 hover:bg-red-950/30 hover:text-red-300'
                    : 'border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700',
                )}
              >
                <RotateCcw className="h-4 w-4" />
                Cancelar Alterações
              </Button>
            )}

            {/* Botão de salvar */}
            <Button
              onClick={handleSalvarTodos}
              disabled={updateMutation.isPending || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Dialog de confirmação para salvar */}
        <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Alterações</DialogTitle>
              <DialogDescription>
                Deseja salvar todas as alterações nos documentos? Isso incluirá
                status de entrega, URLs e observações.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarSalvarTodos}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar Tudo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmação para resetar */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-600" />
                Cancelar Alterações
              </DialogTitle>
              <DialogDescription>
                Deseja descartar todas as alterações não salvas? Todos os
                checkboxes, URLs e observações voltarão ao estado original.
                <br />
                <br />
                <strong>Esta ação não pode ser desfeita.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Manter Alterações
              </Button>
              <Button
                onClick={confirmarResetarAlteracoes}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Descartar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
