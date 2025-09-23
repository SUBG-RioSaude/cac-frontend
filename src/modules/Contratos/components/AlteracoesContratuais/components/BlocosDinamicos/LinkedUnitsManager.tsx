import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Building2,
  Plus,
  X,
  MapPin,
  DollarSign,
  Edit,
  Save,
  XCircle,
  AlertCircle,
} from 'lucide-react'

import type { UnidadeVinculada } from '../../../../types/alteracoes-contratuais'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
}

interface LinkedUnitsManagerProps {
  unidadesVinculadas: UnidadeVinculada[]
  onChange: (unidades: UnidadeVinculada[]) => void
  getUnitDetails: (id: string) => TransformedUnidade | undefined
  disabled?: boolean
  errors?: Record<string, string>
  contractValue?: number
}

interface EditingUnit {
  id: string
  valor: string
  observacoes: string
}

const CORES_TIPO: Record<string, string> = {
  UBS: 'bg-blue-100 text-blue-700',
  UPA: 'bg-red-100 text-red-700',
  Hospital: 'bg-green-100 text-green-700',
  CAPS: 'bg-purple-100 text-purple-700',
  Unidade: 'bg-gray-100 text-gray-700',
}

export function LinkedUnitsManager({
  unidadesVinculadas = [],
  onChange,
  getUnitDetails,
  disabled = false,
  errors = {},
  contractValue,
}: LinkedUnitsManagerProps) {
  const [editingUnit, setEditingUnit] = useState<EditingUnit | null>(null)

  const handleRemoveUnit = useCallback(
    (unitId: string) => {
      const updatedUnits = unidadesVinculadas.filter(
        (u) => u.unidadeSaudeId !== unitId,
      )
      onChange(updatedUnits)
    },
    [unidadesVinculadas, onChange],
  )

  const handleStartEdit = useCallback((unit: UnidadeVinculada) => {
    setEditingUnit({
      id: unit.unidadeSaudeId,
      valor: unit.valorAtribuido.toString(),
      observacoes: unit.observacoes || '',
    })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingUnit(null)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingUnit) return

    const valor = parseFloat(
      editingUnit.valor.replace(/[^\d,.-]/g, '').replace(',', '.'),
    )
    if (isNaN(valor) || valor <= 0) return

    const updatedUnits = unidadesVinculadas.map((unit) =>
      unit.unidadeSaudeId === editingUnit.id
        ? {
            ...unit,
            valorAtribuido: valor,
            observacoes: editingUnit.observacoes.trim() || undefined,
          }
        : unit,
    )

    onChange(updatedUnits)
    setEditingUnit(null)
  }, [editingUnit, unidadesVinculadas, onChange])

  const handleEditChange = useCallback(
    (field: keyof EditingUnit, value: string) => {
      if (!editingUnit) return
      setEditingUnit({ ...editingUnit, [field]: value })
    },
    [editingUnit],
  )

  const totalAtribuido = unidadesVinculadas.reduce(
    (sum, unit) => sum + unit.valorAtribuido,
    0,
  )
  const percentualUtilizado = contractValue
    ? (totalAtribuido / contractValue) * 100
    : 0

  if (unidadesVinculadas.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="py-8 text-center">
          <Plus className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Nenhuma unidade vinculada com valor atribuído
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Adicione unidades usando o botão "Vincular com Valor" na lista de
            unidades disponíveis
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-green-700">
            <Plus className="h-4 w-4" />
            Unidades Vinculadas com Valor ({unidadesVinculadas.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge
              variant={percentualUtilizado > 100 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {percentualUtilizado.toFixed(1)}% do contrato
            </Badge>
            <div className="text-sm font-medium text-green-700">
              Total:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalAtribuido)}
            </div>
          </div>
        </div>
        {percentualUtilizado > 100 && (
          <div className="flex items-center gap-2 rounded bg-red-50 p-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            Valor total atribuído excede o valor do contrato
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {unidadesVinculadas.map((unit) => {
            const unitDetails = getUnitDetails(unit.unidadeSaudeId)
            const isEditing = editingUnit?.id === unit.unidadeSaudeId

            return (
              <div
                key={unit.unidadeSaudeId}
                className={cn(
                  'space-y-3 rounded-lg border p-4',
                  isEditing
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-green-200 bg-green-50',
                )}
              >
                {/* Header da unidade */}
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    {unitDetails && (
                      <>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'flex-shrink-0 text-xs',
                            CORES_TIPO[unitDetails.tipo],
                          )}
                        >
                          {unitDetails.tipo}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {unitDetails.nome}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="font-mono">
                              {unitDetails.codigo}
                            </span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {unitDetails.endereco}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={disabled}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={disabled}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(unit)}
                          disabled={disabled}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUnit(unit.unidadeSaudeId)}
                          disabled={disabled}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Valor e observações */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Valor Atribuído
                    </Label>
                    {isEditing ? (
                      <div className="relative">
                        <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                          value={editingUnit.valor}
                          onChange={(e) =>
                            handleEditChange('valor', e.target.value)
                          }
                          placeholder="0,00"
                          className="pl-10"
                          disabled={disabled}
                        />
                      </div>
                    ) : (
                      <p className="font-medium text-green-700">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(unit.valorAtribuido)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Observações</Label>
                    {isEditing ? (
                      <Textarea
                        value={editingUnit.observacoes}
                        onChange={(e) =>
                          handleEditChange('observacoes', e.target.value)
                        }
                        placeholder="Observações específicas desta unidade..."
                        rows={2}
                        className="text-sm"
                        disabled={disabled}
                      />
                    ) : (
                      <p className="text-sm text-gray-700">
                        {unit.observacoes || 'Sem observações específicas'}
                      </p>
                    )}
                  </div>
                </div>

                {errors[unit.unidadeSaudeId] && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors[unit.unidadeSaudeId]}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Resumo */}
        <div className="mt-4 rounded-lg border-t border-green-200 bg-green-50 p-3 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-green-700">
              Total de {unidadesVinculadas.length} unidade(s) vinculada(s)
            </span>
            <span className="font-semibold text-green-700">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalAtribuido)}
            </span>
          </div>
          {contractValue && (
            <div className="mt-1 text-xs text-green-600">
              {percentualUtilizado.toFixed(2)}% do valor total do contrato
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
