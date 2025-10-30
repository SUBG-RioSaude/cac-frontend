import { Building2, X, MapPin, Unlink, AlertCircle } from 'lucide-react'
import { useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TransformedUnidade {
  id: string
  codigo: string
  nome: string
  tipo: string
  endereco: string
  ativo: boolean
}

interface UnlinkedUnitsManagerProps {
  unidadesDesvinculadas: string[]
  onChange: (unidades: string[]) => void
  getUnitDetails: (id: string) => TransformedUnidade | undefined
  disabled?: boolean
  errors?: Record<string, string>
}

const CORES_TIPO: Record<string, string> = {
  UBS: 'bg-blue-100 text-blue-700',
  UPA: 'bg-red-100 text-red-700',
  Hospital: 'bg-green-100 text-green-700',
  CAPS: 'bg-purple-100 text-purple-700',
  Unidade: 'bg-gray-100 text-gray-700',
}

export const UnlinkedUnitsManager = ({
  unidadesDesvinculadas = [],
  onChange,
  getUnitDetails,
  disabled = false,
  errors = {},
}: UnlinkedUnitsManagerProps) => {
  const handleRemoveUnit = useCallback(
    (unitId: string) => {
      const updatedUnits = unidadesDesvinculadas.filter((id) => id !== unitId)
      onChange(updatedUnits)
    },
    [unidadesDesvinculadas, onChange],
  )

  if (unidadesDesvinculadas.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="py-8 text-center">
          <Unlink className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Nenhuma unidade marcada para desvinculação
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Adicione unidades usando o botão "Desvincular" na lista de unidades
            disponíveis
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-red-700">
          <Unlink className="h-4 w-4" />
          Unidades para Desvinculação ({unidadesDesvinculadas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {unidadesDesvinculadas.map((unitId) => {
            const unitDetails = getUnitDetails(unitId)

            return (
              <div
                key={unitId}
                className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  {unitDetails ? (
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
                        {!unitDetails.ativo && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        Unidade não encontrada (ID: {unitId})
                      </p>
                      <p className="text-xs text-red-600">
                        Esta unidade pode ter sido removida do sistema
                      </p>
                    </div>
                  )}

                  {errors[unitId] && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors[unitId]}</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveUnit(unitId)}
                  disabled={disabled}
                  className="flex-shrink-0 text-red-600 hover:text-red-700"
                  title="Remover da lista de desvinculação"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>

        {/* Resumo */}
        <div className="mt-4 rounded-lg border-t border-red-200 bg-red-50 p-3 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-red-700">
              Total de {unidadesDesvinculadas.length} unidade(s) para
              desvinculação
            </span>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">
                Estas unidades serão removidas do contrato
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
