import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { FiltrosContrato } from '@/modules/Contratos/types/contrato'
import { useUnidades } from '@/modules/Unidades/hooks/use-unidades'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchAndFiltersProps {
  termoPesquisa: string
  filtros: FiltrosContrato
  onTermoPesquisaChange: (termo: string) => void
  onFiltrosChange: (filtros: FiltrosContrato) => void
  onLimparFiltros: () => void
}

export function SearchAndFilters({
  termoPesquisa,
  filtros,
  onTermoPesquisaChange,
  onFiltrosChange,
  onLimparFiltros,
}: SearchAndFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [periodoExpanded, setPeriodoExpanded] = useState(false)
  const [valorExpanded, setValorExpanded] = useState(false)
  const [unidadeExpanded, setUnidadeExpanded] = useState(false)

  // Hook para carregar unidades da API
  const {
    data: unidadesData,
    isLoading: unidadesLoading,
    error: unidadesError,
  } = useUnidades({
    pagina: 1,
    tamanhoPagina: 100,
  })

  // Calcular número de filtros ativos
  const calcularFiltrosAtivos = () => {
    let count = 0
    if (filtros.status && filtros.status.length > 0) count++
    if (
      filtros.dataInicialDe ||
      filtros.dataInicialAte ||
      filtros.dataFinalDe ||
      filtros.dataFinalAte
    )
      count++
    if (filtros.valorMinimo && filtros.valorMinimo > 0) count++
    if (filtros.valorMaximo && filtros.valorMaximo > 0) count++
    if (filtros.unidade && filtros.unidade.length > 0) count++
    return count
  }

  const statusOptions = [
    { value: 'Ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    {
      value: 'Vencendo',
      label: 'Vencendo em Breve',
      color: 'bg-yellow-100 text-yellow-800',
    },
    { value: 'Vencido', label: 'Vencido', color: 'bg-red-100 text-red-800' },
    {
      value: 'Suspenso',
      label: 'Suspenso',
      color: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'Encerrado',
      label: 'Encerrado',
      color: 'bg-blue-100 text-blue-800',
    },
  ]

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filtros.status || []
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter((s) => s !== status)

    onFiltrosChange({ ...filtros, status: newStatus })
  }

  const handleUnidadeChange = (unidadeId: string, checked: boolean) => {
    const currentUnidades = filtros.unidade || []
    const newUnidades = checked
      ? [...currentUnidades, unidadeId]
      : currentUnidades.filter((u) => u !== unidadeId)

    onFiltrosChange({ ...filtros, unidade: newUnidades })
  }

  const filtrosAtivos = calcularFiltrosAtivos()

  // Componente de filtros reutilizável
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn('space-y-4', isMobile ? 'p-6' : 'p-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filtros Avançados</h3>
        </div>
        {filtrosAtivos > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLimparFiltros}
            className="h-7 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <Separator />

      {/* Status do Contrato */}
      <Collapsible open={statusExpanded} onOpenChange={setStatusExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted/50 h-auto w-full justify-between p-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Status do Contrato</span>
              {filtros.status && filtros.status.length > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {filtros.status.length}
                </Badge>
              )}
            </div>
            {statusExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 ml-6 space-y-2">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${option.value}-${isMobile ? 'mobile' : 'desktop'}`}
                checked={filtros.status?.includes(option.value) || false}
                onCheckedChange={(checked) =>
                  handleStatusChange(option.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`status-${option.value}-${isMobile ? 'mobile' : 'desktop'}`}
                className="flex cursor-pointer items-center gap-2 text-sm font-normal"
              >
                <span
                  className={`rounded-full px-2 py-1 text-xs ${option.color}`}
                >
                  {option.label}
                </span>
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Período de Vigência */}
      <Collapsible open={periodoExpanded} onOpenChange={setPeriodoExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted/50 h-auto w-full justify-between p-2"
          >
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Período de Vigência</span>
              {(filtros.dataInicialDe ||
                filtros.dataInicialAte ||
                filtros.dataFinalDe ||
                filtros.dataFinalAte) && (
                <Badge variant="secondary" className="h-5 text-xs">
                  Ativo
                </Badge>
              )}
            </div>
            {periodoExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 ml-6 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor={`data-inicial-de-${isMobile ? 'mobile' : 'desktop'}`}
                className="text-muted-foreground text-xs"
              >
                Data Inicial - De
              </Label>
              <Input
                id={`data-inicial-de-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataInicialDe || ''}
                onChange={(e) =>
                  onFiltrosChange({ ...filtros, dataInicialDe: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`data-inicial-ate-${isMobile ? 'mobile' : 'desktop'}`}
                className="text-muted-foreground text-xs"
              >
                Data Inicial - Até
              </Label>
              <Input
                id={`data-inicial-ate-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataInicialAte || ''}
                onChange={(e) =>
                  onFiltrosChange({
                    ...filtros,
                    dataInicialAte: e.target.value,
                  })
                }
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`data-final-de-${isMobile ? 'mobile' : 'desktop'}`}
                className="text-muted-foreground text-xs"
              >
                Data Final - De
              </Label>
              <Input
                id={`data-final-de-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataFinalDe || ''}
                onChange={(e) =>
                  onFiltrosChange({ ...filtros, dataFinalDe: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`data-final-ate-${isMobile ? 'mobile' : 'desktop'}`}
                className="text-muted-foreground text-xs"
              >
                Data Final - Até
              </Label>
              <Input
                id={`data-final-ate-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataFinalAte || ''}
                onChange={(e) =>
                  onFiltrosChange({ ...filtros, dataFinalAte: e.target.value })
                }
                className="h-9"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Valor do Contrato */}
      <Collapsible open={valorExpanded} onOpenChange={setValorExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted/50 h-auto w-full justify-between p-2"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Valor do Contrato</span>
              {(filtros.valorMinimo || filtros.valorMaximo) && (
                <Badge variant="secondary" className="h-5 text-xs">
                  Ativo
                </Badge>
              )}
            </div>
            {valorExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 ml-6 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor={`valor-minimo-${isMobile ? 'mobile' : 'desktop'}`}
                className="text-muted-foreground text-xs"
              >
                Valor Mínimo (R$)
              </Label>
              <Input
                id={`valor-minimo-${isMobile ? 'mobile' : 'desktop'}`}
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
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`valor-maximo-${isMobile ? 'mobile' : 'desktop'}`}
                className="text-muted-foreground text-xs"
              >
                Valor Máximo (R$)
              </Label>
              <Input
                id={`valor-maximo-${isMobile ? 'mobile' : 'desktop'}`}
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
                className="h-9"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Unidades */}
      <Collapsible open={unidadeExpanded} onOpenChange={setUnidadeExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted/50 h-auto w-full justify-between p-2"
          >
            <div className="flex items-center gap-2">
              <Building2 className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">Unidades</span>
              {filtros.unidade && filtros.unidade.length > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {filtros.unidade.length}
                </Badge>
              )}
            </div>
            {unidadeExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 ml-6 space-y-2">
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {unidadesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-center space-x-2"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))
            ) : unidadesError ? (
              <div className="py-2 text-center text-sm text-red-600">
                Erro ao carregar unidades
              </div>
            ) : unidadesData?.dados && unidadesData.dados.length > 0 ? (
              unidadesData.dados.map((unidade) => (
                <div key={unidade.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`unidade-${unidade.id}-${isMobile ? 'mobile' : 'desktop'}`}
                    checked={filtros.unidade?.includes(unidade.id) || false}
                    onCheckedChange={(checked) =>
                      handleUnidadeChange(unidade.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`unidade-${unidade.id}-${isMobile ? 'mobile' : 'desktop'}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {unidade.nome}
                  </Label>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-sm text-gray-500">
                Nenhuma unidade encontrada
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Search Bar */}
      <motion.div
        className="relative w-full flex-1 sm:max-w-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Pesquisar contratos, fornecedores..."
            value={termoPesquisa}
            onChange={(e) => onTermoPesquisaChange(e.target.value)}
            className="bg-background focus:border-primary h-10 border-2 pr-4 pl-10 shadow-sm transition-all duration-200 sm:h-11"
          />
          {termoPesquisa && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTermoPesquisaChange('')}
              className="hover:bg-muted absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Desktop Filters Dropdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden sm:block"
      >
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="hover:border-primary relative h-10 border-2 px-4 whitespace-nowrap shadow-sm transition-all duration-200 sm:h-11"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {filtrosAtivos > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {filtrosAtivos}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-80 p-0 sm:w-96"
            align="end"
            sideOffset={8}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FilterContent />
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Mobile Filters Sheet */}
      <div className="sm:hidden">
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="hover:border-primary relative h-10 w-full border-2 px-4 shadow-sm transition-all duration-200"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {filtrosAtivos > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {filtrosAtivos}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtros Avançados</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto">
              <FilterContent isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {filtrosAtivos > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 sm:hidden"
          >
            <span className="text-muted-foreground text-sm">
              {filtrosAtivos} filtro{filtrosAtivos > 1 ? 's' : ''} ativo
              {filtrosAtivos > 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
