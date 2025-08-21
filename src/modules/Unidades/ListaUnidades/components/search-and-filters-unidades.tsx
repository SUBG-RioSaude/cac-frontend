import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Building2,
  MapPin,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SearchAndFiltersUnidadesProps {
  termoPesquisa: string
  onTermoPesquisaChange: (termo: string) => void
  filtros?: {
    status?: string
    sigla?: string
    tipo?: string
  }
  onFiltrosChange?: (filtros: { status?: string, sigla?: string, tipo?: string }) => void
}

export function SearchAndFiltersUnidades({
  termoPesquisa,
  onTermoPesquisaChange,
  filtros = { status: "todos", sigla: "", tipo: "todos" },
  onFiltrosChange,
}: SearchAndFiltersUnidadesProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Estados para controlar o colapso de cada seção de filtros
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [siglaExpanded, setSiglaExpanded] = useState(false)
  const [tipoExpanded, setTipoExpanded] = useState(false)

  const statusOptions = [
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
  ]

  const tipoOptions = [
    { value: 'ubs', label: 'UBS' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'caps', label: 'CAPS' },
    { value: 'upa', label: 'UPA' },
    { value: 'centro', label: 'Centro Especializado' },
  ]

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked ? status : undefined

    onFiltrosChange?.({
      ...filtros,
      status: newStatus,
    })
  }

  const handleTipoChange = (tipo: string) => {
    onFiltrosChange?.({
      ...filtros,
      tipo: tipo !== "todos" ? tipo : undefined,
    })
  }

  const handleSiglaChange = (sigla: string) => {
    onFiltrosChange?.({
      ...filtros,
      sigla: sigla || undefined,
    })
  }

  const limparFiltros = () => {
    onTermoPesquisaChange("")
    onFiltrosChange?.({ status: undefined, sigla: undefined, tipo: undefined })
  }

  const contarFiltrosAtivos = () => {
    let count = 0
    if (filtros.status && filtros.status !== "todos") count++
    if (filtros.sigla) count++
    if (filtros.tipo && filtros.tipo !== "todos") count++
    if (termoPesquisa) count++
    return count
  }

  const filtrosAtivos = contarFiltrosAtivos()

  return (
    <div role="search" className="flex flex-col gap-4 lg:flex-row lg:items-center">
      {/* Search Bar */}
      <motion.div
        className="relative max-w-md flex-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Pesquisar por nome, sigla, UO, UG ou endereço..."
            value={termoPesquisa}
            onChange={(e) => onTermoPesquisaChange(e.target.value)}
            className="bg-background focus:border-primary h-11 border-2 pr-4 pl-10 shadow-sm transition-all duration-200 w-full lg:w-full"
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

      {/* Filters Dropdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 cursor-pointer bg-transparent px-4 shadow-sm transition-all duration-200 w-full lg:w-auto hover:bg-slate-600"
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

          <DropdownMenuContent className="w-96 p-0" align="start" sideOffset={8}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 p-6"
            >
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
                    className="h-7 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpar
                  </Button>
                )}
              </div>

              <Separator />

              {/* Status - Colapsível */}
              <Collapsible
                open={statusExpanded}
                onOpenChange={setStatusExpanded}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Status da Unidade
                      </Label>
                    </div>
                    {statusExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6 grid grid-cols-1 gap-2">
                    {statusOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={filtros.status === option.value}
                          onCheckedChange={(checked) =>
                            handleStatusChange(option.value, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`status-${option.value}`}
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
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Sigla - Colapsível */}
              <Collapsible open={siglaExpanded} onOpenChange={setSiglaExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Sigla da Unidade
                      </Label>
                    </div>
                    {siglaExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6">
                    <Input
                      placeholder="Ex: UBS, CAPS..."
                      value={filtros.sigla || ''}
                      onChange={(e) => handleSiglaChange(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Tipo de Unidade - Colapsível */}
              <Collapsible
                open={tipoExpanded}
                onOpenChange={setTipoExpanded}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Tipo de Unidade
                      </Label>
                    </div>
                    {tipoExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6">
                    <Select
                      value={filtros.tipo || "todos"}
                      onValueChange={handleTipoChange}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os tipos</SelectItem>
                        {tipoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {filtrosAtivos > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
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