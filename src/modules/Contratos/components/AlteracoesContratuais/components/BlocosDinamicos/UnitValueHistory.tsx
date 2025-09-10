/**
 * ==========================================
 * HISTÓRICO DE ALTERAÇÕES DE VALOR DE UNIDADE
 * ==========================================
 * Componente para visualizar e gerenciar o histórico de alterações
 * de valores das unidades em alterações contratuais
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  History,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Plus,
  Minus,
  User,
  RotateCcw,
  AlertCircle
} from 'lucide-react'

import type { HistoricoAlteracaoValor } from '../../../../types/alteracoes-contratuais'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
  valorAtual?: number
}

interface UnitValueHistoryProps {
  isOpen: boolean
  onClose: () => void
  unit: TransformedUnidade | null
  historico?: HistoricoAlteracaoValor[]
  onRestore?: (valorAnterior: number) => void
  disabled?: boolean
}

const CORES_TIPO: Record<string, string> = {
  UBS: 'bg-blue-100 text-blue-700',
  UPA: 'bg-red-100 text-red-700', 
  Hospital: 'bg-green-100 text-green-700',
  CAPS: 'bg-purple-100 text-purple-700',
  'Unidade': 'bg-gray-100 text-gray-700',
}

const ICONS_OPERACAO = {
  criar: Plus,
  editar: RefreshCcw,
  remover: Minus
}

const COLORS_OPERACAO = {
  criar: 'text-green-600 bg-green-50 border-green-200',
  editar: 'text-blue-600 bg-blue-50 border-blue-200',
  remover: 'text-red-600 bg-red-50 border-red-200'
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return timestamp
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function getDiferenceIcon(valorAnterior: number = 0, valorNovo: number): React.ReactNode {
  if (valorNovo > valorAnterior) {
    return <TrendingUp className="h-3 w-3 text-green-600" />
  } else if (valorNovo < valorAnterior) {
    return <TrendingDown className="h-3 w-3 text-red-600" />
  }
  return <RefreshCcw className="h-3 w-3 text-blue-600" />
}

export function UnitValueHistory({
  isOpen,
  onClose,
  unit,
  historico = [],
  onRestore,
  disabled = false
}: UnitValueHistoryProps) {
  const [restoringValue, setRestoringValue] = useState<number | null>(null)

  const handleRestore = async (valorAnterior: number) => {
    if (!onRestore || disabled) return
    
    setRestoringValue(valorAnterior)
    try {
      await onRestore(valorAnterior)
      onClose()
    } catch (error) {
      console.error('Erro ao restaurar valor:', error)
    } finally {
      setRestoringValue(null)
    }
  }

  if (!unit) return null

  const historicoOrdenado = [...historico].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações de Valor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes da unidade */}
          <div className="p-3 bg-gray-50 rounded-lg overflow-hidden">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <Badge 
                  variant="secondary" 
                  className={cn('text-xs whitespace-nowrap', CORES_TIPO[unit.tipo as keyof typeof CORES_TIPO])}
                >
                  {unit.tipo}
                </Badge>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-sm break-words" title={unit.nome}>
                  {unit.nome}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">
                    {unit.codigo}
                  </span>
                  {unit.valorAtual !== undefined && (
                    <span className="font-medium text-green-700">
                      Valor atual: {formatCurrency(unit.valorAtual)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lista do histórico */}
          {historicoOrdenado.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-3 pr-4">
                {historicoOrdenado.map((entrada, index) => {
                  const Icon = ICONS_OPERACAO[entrada.operacao]
                  const isFirst = index === 0
                  const isLast = index === historicoOrdenado.length - 1

                  return (
                    <div key={index} className="relative">
                      <div className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        COLORS_OPERACAO[entrada.operacao]
                      )}>
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-6 top-12 w-px h-8 bg-gray-200" />
                        )}

                        {/* Icon */}
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2",
                          isFirst ? "ring-2 ring-offset-2 ring-blue-300" : "",
                          COLORS_OPERACAO[entrada.operacao]
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {entrada.operacao === 'criar' ? 'Criado' : 
                                 entrada.operacao === 'editar' ? 'Editado' : 'Removido'}
                              </Badge>
                              {isFirst && (
                                <Badge variant="default" className="text-xs">
                                  Atual
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(entrada.timestamp)}
                            </div>
                          </div>

                          {/* Valores */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getDiferenceIcon(entrada.valorAnterior, entrada.valorNovo)}
                              <span className="font-medium">
                                {formatCurrency(entrada.valorNovo)}
                              </span>
                              {entrada.valorAnterior !== undefined && entrada.valorAnterior !== entrada.valorNovo && (
                                <span className="text-xs text-gray-600">
                                  (de {formatCurrency(entrada.valorAnterior)})
                                </span>
                              )}
                            </div>

                            {/* Usuário */}
                            {entrada.usuario && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <User className="h-3 w-3" />
                                {entrada.usuario}
                              </div>
                            )}

                            {/* Observações */}
                            {entrada.observacoes && (
                              <p className="text-xs text-gray-700 mt-1 p-2 bg-white/50 rounded">
                                {entrada.observacoes}
                              </p>
                            )}

                            {/* Botão de restaurar */}
                            {!isFirst && onRestore && entrada.valorAnterior !== undefined && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(entrada.valorNovo)}
                                disabled={disabled || restoringValue !== null}
                                className="text-xs mt-2"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                {restoringValue === entrada.valorNovo ? 'Restaurando...' : 'Restaurar este valor'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isLast && <Separator className="my-2" />}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhum histórico disponível</h3>
              <p className="text-sm">
                As alterações de valor desta unidade aparecerão aqui.
              </p>
            </div>
          )}

          {/* Aviso sobre restauração */}
          {onRestore && historicoOrdenado.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-800">
                <p className="font-medium">Sobre a restauração de valores</p>
                <p className="text-xs mt-1">
                  Restaurar um valor anterior criará uma nova entrada no histórico com o valor selecionado.
                </p>
              </div>
            </div>
          )}

          {/* Botão fechar */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} disabled={disabled}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}