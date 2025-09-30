import { Filter, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { FiltrosFornecedor } from '@/modules/Fornecedores/ListaFornecedores/types/fornecedor'

interface FiltrosFornecedoresProps {
  filtros: FiltrosFornecedor
  onFiltrosChange: (filtros: FiltrosFornecedor) => void
  onLimparFiltros: () => void
}

export const FiltrosFornecedores = ({
  filtros,
  onFiltrosChange,
  onLimparFiltros,
}: FiltrosFornecedoresProps) => {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  // Estados para controlar o colapso de cada seção de filtros
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [valorExpanded, setValorExpanded] = useState(false)
  const [contratosExpanded, setContratosExpanded] = useState(false)

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'suspenso', label: 'Suspenso' },
  ]

  const handleStatusChange = (status: string, checked: boolean) => {
    const statusAtual = filtros.status ?? []
    if (checked) {
      onFiltrosChange({ ...filtros, status: [...statusAtual, status] })
    } else {
      onFiltrosChange({
        ...filtros,
        status: statusAtual.filter((s) => s !== status),
      })
    }
  }

  const handleValorChange = (
    campo: 'valorMinimo' | 'valorMaximo',
    valor: string,
  ) => {
    const valorNumerico = valor ? Number.parseFloat(valor) : undefined
    onFiltrosChange({ ...filtros, [campo]: valorNumerico })
  }

  const handleContratosChange = (
    campo: 'contratosAtivosMinimo' | 'contratosAtivosMaximo',
    valor: string,
  ) => {
    const valorNumerico = valor ? Number.parseInt(valor) : undefined
    onFiltrosChange({ ...filtros, [campo]: valorNumerico })
  }

  const temFiltrosAtivos = Object.keys(filtros).some((key) => {
    const valor = filtros[key as keyof FiltrosFornecedor]
    return Array.isArray(valor) ? valor.length > 0 : valor !== undefined
  })

  const FiltrosContent = () => (
    <div className="space-y-6">
      {/* Status - Colapsível */}
      <Collapsible open={statusExpanded} onOpenChange={setStatusExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 hover:bg-transparent"
          >
            <Label className="text-sm font-medium">Status</Label>
            {statusExpanded ? (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filtros.status?.includes(option.value) ?? false}
                  onCheckedChange={(checked) =>
                    handleStatusChange(option.value, checked as boolean)
                  }
                />
                <Label htmlFor={`status-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Valor Total dos Contratos - Colapsível */}
      <Collapsible open={valorExpanded} onOpenChange={setValorExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 hover:bg-transparent"
          >
            <Label className="text-sm font-medium">
              Valor Total dos Contratos
            </Label>
            {valorExpanded ? (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="valor-minimo"
                className="text-muted-foreground text-xs"
              >
                Mínimo
              </Label>
              <Input
                id="valor-minimo"
                type="number"
                placeholder="0"
                value={filtros.valorMinimo ?? ''}
                onChange={(e) =>
                  handleValorChange('valorMinimo', e.target.value)
                }
                className="text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="valor-maximo"
                className="text-muted-foreground text-xs"
              >
                Máximo
              </Label>
              <Input
                id="valor-maximo"
                type="number"
                placeholder="0"
                value={filtros.valorMaximo ?? ''}
                onChange={(e) =>
                  handleValorChange('valorMaximo', e.target.value)
                }
                className="text-sm"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Contratos Ativos - Colapsível */}
      <Collapsible open={contratosExpanded} onOpenChange={setContratosExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 hover:bg-transparent"
          >
            <Label className="text-sm font-medium">
              Quantidade de Contratos Ativos
            </Label>
            {contratosExpanded ? (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="contratos-minimo"
                className="text-muted-foreground text-xs"
              >
                Mínimo
              </Label>
              <Input
                id="contratos-minimo"
                type="number"
                placeholder="0"
                value={filtros.contratosAtivosMinimo ?? ''}
                onChange={(e) =>
                  handleContratosChange('contratosAtivosMinimo', e.target.value)
                }
                className="text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="contratos-maximo"
                className="text-muted-foreground text-xs"
              >
                Máximo
              </Label>
              <Input
                id="contratos-maximo"
                type="number"
                placeholder="0"
                value={filtros.contratosAtivosMaximo ?? ''}
                onChange={(e) =>
                  handleContratosChange('contratosAtivosMaximo', e.target.value)
                }
                className="text-sm"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  return (
    <div className="flex items-center gap-2">
      {/* Filtros Mobile */}
      <div className="sm:hidden">
        <Sheet open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {temFiltrosAtivos && (
                <span className="bg-primary ml-2 h-2 w-2 rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtros Avançados</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FiltrosContent />
              {temFiltrosAtivos && (
                <Button
                  variant="outline"
                  onClick={onLimparFiltros}
                  className="mt-4 w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filtros Desktop */}
      <div className="hidden sm:block">
        <Popover open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {temFiltrosAtivos && (
                <span className="bg-primary ml-2 h-2 w-2 rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filtros Avançados</h3>
                {temFiltrosAtivos && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLimparFiltros}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpar
                  </Button>
                )}
              </div>
              <FiltrosContent />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
