/**
 * Modal de Confirmação para Alertas de Limite Legal
 * Exibido quando a API retorna HTTP 202 indicando que a alteração excede limites legais
 */

import { useState } from 'react'
import { AlertTriangle, FileText, Calculator, Clock, Users } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import type { AlertaLimiteLegal } from '@/modules/Contratos/types/alteracoes-contratuais'
import { useConfirmarLimiteLegal } from '@/modules/Contratos/hooks/useAlteracoesContratuaisApi'

interface ModalAlertaLimiteLegalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alteracaoId: string
  alerta: AlertaLimiteLegal
  onConfirmed: () => void
  onCancelled: () => void
}

const tipoLimiteLabels = {
  acrescimo: 'Acréscimo de Valor',
  prazo: 'Extensão de Prazo',
  objeto: 'Alteração de Objeto'
} as const

const severidadeColors = {
  alerta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critico: 'bg-red-100 text-red-800 border-red-200'
} as const

export function ModalAlertaLimiteLegal({
  open,
  onOpenChange,
  alteracaoId,
  alerta,
  onConfirmed,
  onCancelled
}: ModalAlertaLimiteLegalProps) {
  const [justificativaAdicional, setJustificativaAdicional] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const confirmarMutation = useConfirmarLimiteLegal({
    onSuccess: () => {
      onConfirmed()
      onOpenChange(false)
    },
    onError: () => {
      setConfirmando(false)
    }
  })

  const cancelarMutation = useConfirmarLimiteLegal({
    onSuccess: () => {
      onCancelled()
      onOpenChange(false)
    },
    onError: () => {
      setConfirmando(false)
    }
  })

  const handleConfirmar = async () => {
    setConfirmando(true)
    await confirmarMutation.mutateAsync({
      id: alteracaoId,
      confirmacao: {
        confirmado: true,
        justificativaAdicional: justificativaAdicional.trim() || undefined
      }
    })
  }

  const handleCancelar = async () => {
    setConfirmando(true)
    await cancelarMutation.mutateAsync({
      id: alteracaoId,
      confirmacao: {
        confirmado: false
      }
    })
  }

  const formatPercentual = (valor: number) => `${(valor * 100).toFixed(1)}%`

  const getIconForTipo = (tipo: keyof typeof tipoLimiteLabels) => {
    switch (tipo) {
      case 'acrescimo':
        return <Calculator className="h-4 w-4" />
      case 'prazo':
        return <Clock className="h-4 w-4" />
      case 'objeto':
        return <FileText className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alerta de Limite Legal
          </DialogTitle>
          <DialogDescription>
            Esta alteração contratual excede os limites legais estabelecidos. 
            Revise as informações abaixo antes de prosseguir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do Alerta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo dos Limites Excedidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerta.limites.map((limite: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIconForTipo(limite.tipo as keyof typeof tipoLimiteLabels)}
                      <span className="font-medium">
                        {tipoLimiteLabels[limite.tipo as keyof typeof tipoLimiteLabels]}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={severidadeColors[limite.severidade as keyof typeof severidadeColors]}
                    >
                      {limite.severidade === 'critico' ? 'Crítico' : 'Atenção'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 rounded-lg p-3">
                    <div>
                      <span className="text-gray-600">Limite Legal:</span>
                      <div className="font-medium">{formatPercentual(limite.limiteLegal)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor Atual:</span>
                      <div className="font-medium">{formatPercentual(limite.valorAtual)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Excesso:</span>
                      <div className="font-medium text-red-600">
                        +{formatPercentual(limite.valorAtual - limite.limiteLegal)}
                      </div>
                    </div>
                  </div>

                  {limite.observacoes && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <strong>Observação:</strong> {limite.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fundamentação Legal */}
          {alerta.fundamentacaoLegal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fundamentação Legal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-gray-50 p-4 rounded-lg">
                  {alerta.fundamentacaoLegal}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consequências */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Procedimentos Necessários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  Justificativa detalhada é obrigatória para alterações acima dos limites legais
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  Aprovação de autoridade competente será necessária
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  Documentação adicional pode ser solicitada durante a análise
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  Processo de aprovação pode demorar mais tempo que o usual
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Justificativa Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Justificativa Adicional</CardTitle>
              <DialogDescription>
                Forneça uma justificativa detalhada para a exceção aos limites legais. 
                Esta informação será considerada durante o processo de aprovação.
              </DialogDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva detalhadamente os motivos que justificam a exceção aos limites legais estabelecidos..."
                value={justificativaAdicional}
                onChange={(e) => setJustificativaAdicional(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="text-xs text-gray-500 mt-2">
                Mínimo recomendado: 100 caracteres (atual: {justificativaAdicional.length})
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancelar}
              disabled={confirmando}
              className="order-2 sm:order-1"
            >
              Cancelar Alteração
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={confirmando || justificativaAdicional.length < 50}
              className="order-1 sm:order-2"
            >
              {confirmando ? 'Processando...' : 'Confirmar e Prosseguir'}
            </Button>
          </div>

          {justificativaAdicional.length < 50 && justificativaAdicional.length > 0 && (
            <p className="text-xs text-amber-600 text-center">
              Justificativa muito curta. Recomendamos pelo menos 50 caracteres para uma aprovação mais rápida.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}