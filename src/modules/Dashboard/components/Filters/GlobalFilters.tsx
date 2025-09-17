/**
 * ==========================================
 * FILTROS GLOBAIS DO DASHBOARD
 * ==========================================
 * Componente de filtros persistentes que afetam todos os dados
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Filter, 
  X, 
  Calendar,
  Building2,
  FileText,
  Tag,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardFilters, UseFiltersResult } from '../../types/dashboard'
import type { ContratoStatus, TipoContrato } from '@/modules/Contratos/types/contrato'
import { generatePeriodOptions } from '../../utils/dashboard-utils'
import { fetchUnidadesForFilters } from '../../services/dashboard-service'
import { useQuery } from '@tanstack/react-query'

interface GlobalFiltersProps {
  filters: DashboardFilters
  onFiltersChange: UseFiltersResult['updateFilter']
  onReset: UseFiltersResult['resetFilters']
  hasActiveFilters: boolean
  className?: string
}

// Opções de status
const statusOptions: { value: ContratoStatus; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'vencendo', label: 'Vencendo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'suspenso', label: 'Suspenso' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'em_aprovacao', label: 'Em Aprovação' },
  { value: 'rascunho', label: 'Rascunho' }
]

// Opções de tipo
const tipoOptions: { value: TipoContrato; label: string }[] = [
  { value: 'servicos', label: 'Serviços' },
  { value: 'obras', label: 'Obras' },
  { value: 'fornecimento', label: 'Fornecimento' },
  { value: 'concessao', label: 'Concessão' }
]

export function GlobalFilters({
  filters,
  onFiltersChange,
  onReset,
  hasActiveFilters,
  className
}: GlobalFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Buscar unidades para o filtro usando React Query
  const { data: unidades = [] } = useQuery({
    queryKey: ['unidades-dashboard-filters'],
    queryFn: fetchUnidadesForFilters,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos (gcTime é o novo nome para cacheTime)
  })
  
  // Gerar opções de período
  const periodOptions = generatePeriodOptions()

  // Handlers para mudanças nos filtros
  const handlePeriodChange = (value: string) => {
    const [ano, mes] = value.split('-').map(Number)
    onFiltersChange('periodo', { ano, mes })
  }

  const handleStatusChange = (status: ContratoStatus, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status)
    onFiltersChange('status', newStatus)
  }

  const handleTipoChange = (tipo: TipoContrato, checked: boolean) => {
    const newTipos = checked
      ? [...filters.tipos, tipo]
      : filters.tipos.filter(t => t !== tipo)
    onFiltersChange('tipos', newTipos)
  }

  const handleUnidadeChange = (unidadeId: string, checked: boolean) => {
    const newUnidades = checked
      ? [...filters.unidades, unidadeId]
      : filters.unidades.filter(u => u !== unidadeId)
    onFiltersChange('unidades', newUnidades)
  }

  // Contador de filtros ativos
  const activeFiltersCount = 
    filters.status.length + 
    filters.tipos.length + 
    filters.unidades.length +
    (hasActiveFilters ? 1 : 0) // Período não padrão

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Período */}
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              value={`${filters.periodo.ano}-${String(filters.periodo.mes).padStart(2, '0')}`}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros Avançados */}
          <div className="flex items-center gap-2">
            {/* Indicador de filtros ativos */}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}

            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={activeFiltersCount > 0 ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtros Avançados</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="gap-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Limpar
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Filtro por Status */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Status</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${option.value}`}
                            checked={filters.status.includes(option.value)}
                            onCheckedChange={(checked) => 
                              handleStatusChange(option.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`status-${option.value}`}
                            className="text-xs font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Filtro por Tipo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Tipo</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tipoOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tipo-${option.value}`}
                            checked={filters.tipos.includes(option.value)}
                            onCheckedChange={(checked) => 
                              handleTipoChange(option.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`tipo-${option.value}`}
                            className="text-xs font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Filtro por Unidades */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Unidades</Label>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {Array.isArray(unidades) && unidades.length > 0 ? (
                        <>
                          {unidades.slice(0, 10).map(unidade => (
                            <div key={unidade.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`unidade-${unidade.id}`}
                                checked={filters.unidades.includes(unidade.id)}
                                onCheckedChange={(checked) => 
                                  handleUnidadeChange(unidade.id, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`unidade-${unidade.id}`}
                                className="text-xs font-normal truncate"
                                title={unidade.nome}
                              >
                                {unidade.nome}
                              </Label>
                            </div>
                          ))}
                          {unidades.length > 10 && (
                            <div className="text-xs text-muted-foreground text-center py-2">
                              E mais {unidades.length - 10} unidades...
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Nenhuma unidade disponível
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filtros Ativos (Tags) */}
        {(filters.status.length > 0 || filters.tipos.length > 0 || filters.unidades.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {/* Status selecionados */}
            {filters.status.map(status => {
              const statusLabel = statusOptions.find(opt => opt.value === status)?.label || status
              return (
                <Badge key={status} variant="secondary" className="gap-1">
                  {statusLabel}
                  <button
                    onClick={() => handleStatusChange(status, false)}
                    className="ml-1 hover:bg-muted rounded-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}

            {/* Tipos selecionados */}
            {filters.tipos.map(tipo => {
              const tipoLabel = tipoOptions.find(opt => opt.value === tipo)?.label || tipo
              return (
                <Badge key={tipo} variant="secondary" className="gap-1">
                  {tipoLabel}
                  <button
                    onClick={() => handleTipoChange(tipo, false)}
                    className="ml-1 hover:bg-muted rounded-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}

            {/* Unidades selecionadas */}
            {filters.unidades.map(unidadeId => {
              const unidade = Array.isArray(unidades) ? unidades.find(u => u.id === unidadeId) : null
              const unidadeNome = unidade?.nome || unidadeId
              return (
                <Badge key={unidadeId} variant="secondary" className="gap-1">
                  {unidadeNome}
                  <button
                    onClick={() => handleUnidadeChange(unidadeId, false)}
                    className="ml-1 hover:bg-muted rounded-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}