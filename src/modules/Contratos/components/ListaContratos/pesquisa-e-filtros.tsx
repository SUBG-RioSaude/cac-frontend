import{ useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Calendar, DollarSign, Building2, FileText, ChevronDown, ChevronRight } from 'lucide-react'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useContratosStore } from '@/modules/Contratos/store/contratos-store'
import { unidadesMock } from '@/modules/Contratos/data/contratos-mock'
import { cn } from '@/lib/utils'

export function SearchAndFilters() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [periodoExpanded, setPeriodoExpanded] = useState(false)
  const [valorExpanded, setValorExpanded] = useState(false)
  const [unidadeExpanded, setUnidadeExpanded] = useState(false)
  
  const { 
    termoPesquisa, 
    filtros, 
    setTermoPesquisa, 
    setFiltros, 
    limparFiltros 
  } = useContratosStore()

  const statusOptions = [
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'vencendo', label: 'Vencendo em Breve', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'vencido', label: 'Vencido', color: 'bg-red-100 text-red-800' },
    { value: 'suspenso', label: 'Suspenso', color: 'bg-gray-100 text-gray-800' },
    { value: 'encerrado', label: 'Encerrado', color: 'bg-blue-100 text-blue-800' }
  ]

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filtros.status || []
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter(s => s !== status)
    
    setFiltros({ ...filtros, status: newStatus })
  }

  const handleUnidadeChange = (unidade: string, checked: boolean) => {
    const currentUnidades = filtros.unidade || []
    const newUnidades = checked
      ? [...currentUnidades, unidade]
      : currentUnidades.filter(u => u !== unidade)
    
    setFiltros({ ...filtros, unidade: newUnidades })
  }

  const contarFiltrosAtivos = () => {
    let count = 0
    if (filtros.status && filtros.status.length > 0) count++
    if (filtros.unidade && filtros.unidade.length > 0) count++
    if (filtros.dataInicialDe || filtros.dataInicialAte) count++
    if (filtros.dataFinalDe || filtros.dataFinalAte) count++
    if (filtros.valorMinimo || filtros.valorMaximo) count++
    return count
  }

  const filtrosAtivos = contarFiltrosAtivos()

  // Componente de filtros reutilizável
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("space-y-4", isMobile ? "p-6" : "p-6")}>
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
            onClick={limparFiltros}
            className="text-xs h-7"
          >
            <X className="h-3 w-3 mr-1" />
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
            className="w-full justify-between p-2 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
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
        <CollapsibleContent className="space-y-2 mt-2 ml-6">
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
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <span className={`px-2 py-1 rounded-full text-xs ${option.color}`}>
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
            className="w-full justify-between p-2 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Período de Vigência</span>
              {(filtros.dataInicialDe || filtros.dataInicialAte || filtros.dataFinalDe || filtros.dataFinalAte) && (
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
        <CollapsibleContent className="space-y-3 mt-2 ml-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`data-inicial-de-${isMobile ? 'mobile' : 'desktop'}`} className="text-xs text-muted-foreground">
                Data Inicial - De
              </Label>
              <Input
                id={`data-inicial-de-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataInicialDe || ''}
                onChange={(e) => setFiltros({ ...filtros, dataInicialDe: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`data-inicial-ate-${isMobile ? 'mobile' : 'desktop'}`} className="text-xs text-muted-foreground">
                Data Inicial - Até
              </Label>
              <Input
                id={`data-inicial-ate-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataInicialAte || ''}
                onChange={(e) => setFiltros({ ...filtros, dataInicialAte: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`data-final-de-${isMobile ? 'mobile' : 'desktop'}`} className="text-xs text-muted-foreground">
                Data Final - De
              </Label>
              <Input
                id={`data-final-de-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataFinalDe || ''}
                onChange={(e) => setFiltros({ ...filtros, dataFinalDe: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`data-final-ate-${isMobile ? 'mobile' : 'desktop'}`} className="text-xs text-muted-foreground">
                Data Final - Até
              </Label>
              <Input
                id={`data-final-ate-${isMobile ? 'mobile' : 'desktop'}`}
                type="date"
                value={filtros.dataFinalAte || ''}
                onChange={(e) => setFiltros({ ...filtros, dataFinalAte: e.target.value })}
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
            className="w-full justify-between p-2 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
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
        <CollapsibleContent className="space-y-3 mt-2 ml-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`valor-minimo-${isMobile ? 'mobile' : 'desktop'}`} className="text-xs text-muted-foreground">
                Valor Mínimo (R$)
              </Label>
              <Input
                id={`valor-minimo-${isMobile ? 'mobile' : 'desktop'}`}
                type="number"
                placeholder="0,00"
                value={filtros.valorMinimo || ''}
                onChange={(e) => setFiltros({ 
                  ...filtros, 
                  valorMinimo: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`valor-maximo-${isMobile ? 'mobile' : 'desktop'}`} className="text-xs text-muted-foreground">
                Valor Máximo (R$)
              </Label>
              <Input
                id={`valor-maximo-${isMobile ? 'mobile' : 'desktop'}`}
                type="number"
                placeholder="0,00"
                value={filtros.valorMaximo || ''}
                onChange={(e) => setFiltros({ 
                  ...filtros, 
                  valorMaximo: e.target.value ? Number(e.target.value) : undefined 
                })}
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
            className="w-full justify-between p-2 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
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
        <CollapsibleContent className="space-y-2 mt-2 ml-6">
          <div className="max-h-32 overflow-y-auto space-y-2">
            {unidadesMock.map((unidade) => (
              <div key={unidade} className="flex items-center space-x-2">
                <Checkbox
                  id={`unidade-${unidade}-${isMobile ? 'mobile' : 'desktop'}`}
                  checked={filtros.unidade?.includes(unidade) || false}
                  onCheckedChange={(checked) => 
                    handleUnidadeChange(unidade, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`unidade-${unidade}-${isMobile ? 'mobile' : 'desktop'}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {unidade}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      {/* Search Bar */}
      <motion.div 
        className="relative flex-1 w-full sm:max-w-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar contratos, fornecedores..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="pl-10 pr-4 h-10 sm:h-11 bg-background border-2 focus:border-primary transition-all duration-200 shadow-sm"
          />
          {termoPesquisa && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTermoPesquisa('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
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
              className="h-10 sm:h-11 px-4 border-2 hover:border-primary transition-all duration-200 shadow-sm relative whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {filtrosAtivos > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {filtrosAtivos}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-80 sm:w-96 p-0" 
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
              className="h-10 px-4 border-2 hover:border-primary transition-all duration-200 shadow-sm relative w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
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
            <div className="overflow-y-auto h-full">
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
            <span className="text-sm text-muted-foreground">
              {filtrosAtivos} filtro{filtrosAtivos > 1 ? 's' : ''} ativo{filtrosAtivos > 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
