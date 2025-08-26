import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Filter, X } from 'lucide-react'
import type { FiltrosContrato } from '@/modules/Contratos/types/contrato'
import { unidadesMock } from '@/modules/Contratos/data/contratos-mock'

interface FiltrosContratosProps {
  filtros: FiltrosContrato
  onFiltrosChange: (filtros: FiltrosContrato) => void
  onLimparFiltros: () => void
}

export function FiltrosContratos({
  filtros,
  onFiltrosChange,
  onLimparFiltros,
}: FiltrosContratosProps) {
  const [isOpen, setIsOpen] = useState(false)

  const statusOptions = [
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Vencendo', label: 'Vencendo em Breve' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Encerrado', label: 'Encerrado' },
  ]

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filtros.status || []
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter((s) => s !== status)

    onFiltrosChange({ ...filtros, status: newStatus })
  }

  const handleUnidadeChange = (unidade: string, checked: boolean) => {
    const currentUnidades = filtros.unidade || []
    const newUnidades = checked
      ? [...currentUnidades, unidade]
      : currentUnidades.filter((u) => u !== unidade)

    onFiltrosChange({ ...filtros, unidade: newUnidades })
  }

  const temFiltrosAtivos = Object.values(filtros).some((value) =>
    Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== '',
  )

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
                {temFiltrosAtivos && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    Ativos
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Status do Contrato</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filtros.status?.includes(option.value) || false}
                      onCheckedChange={(checked) =>
                        handleStatusChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`status-${option.value}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Período de Vigência */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Período de Vigência</Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="data-inicial-de"
                    className="text-muted-foreground text-xs"
                  >
                    Data Inicial - De
                  </Label>
                  <Input
                    id="data-inicial-de"
                    type="date"
                    value={filtros.dataInicialDe || ''}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        dataInicialDe: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="data-inicial-ate"
                    className="text-muted-foreground text-xs"
                  >
                    Data Inicial - Até
                  </Label>
                  <Input
                    id="data-inicial-ate"
                    type="date"
                    value={filtros.dataInicialAte || ''}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        dataInicialAte: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="data-final-de"
                    className="text-muted-foreground text-xs"
                  >
                    Data Final - De
                  </Label>
                  <Input
                    id="data-final-de"
                    type="date"
                    value={filtros.dataFinalDe || ''}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        dataFinalDe: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="data-final-ate"
                    className="text-muted-foreground text-xs"
                  >
                    Data Final - Até
                  </Label>
                  <Input
                    id="data-final-ate"
                    type="date"
                    value={filtros.dataFinalAte || ''}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        dataFinalAte: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Valor do Contrato */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Valor do Contrato</Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="valor-minimo"
                    className="text-muted-foreground text-xs"
                  >
                    Valor Mínimo (R$)
                  </Label>
                  <Input
                    id="valor-minimo"
                    type="number"
                    placeholder="0,00"
                    value={filtros.valorMinimo || ''}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        valorMinimo: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="valor-maximo"
                    className="text-muted-foreground text-xs"
                  >
                    Valor Máximo (R$)
                  </Label>
                  <Input
                    id="valor-maximo"
                    type="number"
                    placeholder="0,00"
                    value={filtros.valorMaximo || ''}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        valorMaximo: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Unidades */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Unidades</Label>
              <div className="grid max-h-40 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2">
                {unidadesMock.demandantes.map((unidade) => (
                  <div key={unidade} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unidade-${unidade}`}
                      checked={filtros.unidade?.includes(unidade) || false}
                      onCheckedChange={(checked) =>
                        handleUnidadeChange(unidade, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`unidade-${unidade}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {unidade}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={onLimparFiltros}
                disabled={!temFiltrosAtivos}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
