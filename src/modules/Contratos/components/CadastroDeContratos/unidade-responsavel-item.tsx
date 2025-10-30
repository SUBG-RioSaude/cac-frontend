import { Trash2, MessageSquare, MessageSquareOff } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { CriarUnidadeResponsavelPayload } from '@/modules/Contratos/types/contrato'

interface UnidadeResponsavelItemProps {
  unidade: CriarUnidadeResponsavelPayload & {
    unidadeSaudeNome: string // Nome para exibição
  }
  index: number
  canRemove: boolean // Se pode ser removido (mínimo 1 por tipo)
  canSetPrincipal?: boolean // deprecated: ignorado
  onRemove: (index: number) => void
  onTogglePrincipal?: (index: number) => void // deprecated: ignorado
  onUpdateObservacoes: (index: number, observacoes: string) => void
}

export const UnidadeResponsavelItem = ({
  unidade,
  index,
  canRemove,
  onRemove,
  onUpdateObservacoes,
}: UnidadeResponsavelItemProps) => {
  const [showObservacoes, setShowObservacoes] = useState(false)
  const [observacoesValue, setObservacoesValue] = useState(
    unidade.observacoes ?? '',
  )

  const tipoLabel =
    unidade.tipoResponsabilidade === 1 ? 'Demandante' : 'Gestora'
  const tipoColor =
    unidade.tipoResponsabilidade === 1
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800'

  const handleObservacoesBlur = () => {
    if (observacoesValue !== unidade.observacoes) {
      onUpdateObservacoes(index, observacoesValue)
    }
  }

  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300',
      )}
    >
      {/* Header da Unidade */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {unidade.unidadeSaudeNome}
              </span>
              {/* tag 'principal' removida */}
            </div>
            <Badge
              variant="secondary"
              className={cn('mt-1 w-fit text-xs', tipoColor)}
            >
              {tipoLabel}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* ação de principal removida */}

          {/* Botão Observações */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowObservacoes(!showObservacoes)}
            className="h-8 w-8 p-0"
            title="Observações"
          >
            {showObservacoes || observacoesValue ? (
              <MessageSquare className="h-4 w-4 text-blue-500" />
            ) : (
              <MessageSquareOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>

          {/* Botão Remover */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            title={
              canRemove
                ? 'Remover unidade'
                : 'É necessário pelo menos uma unidade'
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Observações (expandível) */}
      {showObservacoes && (
        <div className="border-t pt-2">
          <label
            htmlFor={`observacoes-${index}`}
            className="mb-2 block text-xs font-medium text-gray-700"
          >
            Observações
          </label>
          <Textarea
            id={`observacoes-${index}`}
            placeholder="Observações sobre esta unidade responsável..."
            value={observacoesValue}
            onChange={(e) => setObservacoesValue(e.target.value)}
            onBlur={handleObservacoesBlur}
            rows={2}
            className="text-sm"
            maxLength={200}
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {observacoesValue.length}/200 caracteres
            </span>
            {observacoesValue !== unidade.observacoes && (
              <span className="text-xs text-blue-500">
                Pressione Enter ou clique fora para salvar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
