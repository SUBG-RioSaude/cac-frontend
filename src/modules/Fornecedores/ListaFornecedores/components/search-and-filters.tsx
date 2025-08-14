import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, DollarSign, FileText, Hash, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useFornecedoresStore } from "../store/fornecedores-store"

export function SearchAndFiltersFornecedores() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Estados para controlar o colapso de cada seção de filtros
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [valorExpanded, setValorExpanded] = useState(false)
  const [contratosExpanded, setContratosExpanded] = useState(false)

  const { 
    termoPesquisa, 
    filtros, 
    setTermoPesquisa, 
    setFiltros, 
    limparFiltros 
  } = useFornecedoresStore()

  const statusOptions = [
    { value: "ativo", label: "Ativo", color: "bg-green-100 text-green-800" },
    { value: "inativo", label: "Inativo", color: "bg-gray-100 text-gray-800" },
    { value: "suspenso", label: "Suspenso", color: "bg-red-100 text-red-800" },
  ]

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filtros.status || []
    const newStatus = checked ? [...currentStatus, status] : currentStatus.filter((s) => s !== status)

    setFiltros({ ...filtros, status: newStatus })
  }

  const contarFiltrosAtivos = () => {
    let count = 0
    if (filtros.status && filtros.status.length > 0) count++
    if (filtros.valorMinimo || filtros.valorMaximo) count++
    if (filtros.contratosAtivosMinimo || filtros.contratosAtivosMaximo) count++
    return count
  }

  const filtrosAtivos = contarFiltrosAtivos()

  return (
    <div className="flex items-center gap-4">
      {/* Search Bar */}
      <motion.div
        className="relative flex-1 max-w-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar fornecedores, CNPJ, razão social..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="pl-10 pr-4 h-11 bg-background border-2 focus:border-primary transition-all duration-200 shadow-sm"
          />
          {termoPesquisa && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTermoPesquisa("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
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
              className="cursor-pointer h-11 px-4 border-2 hover:border-primary transition-all duration-200 shadow-sm relative bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {filtrosAtivos > 0 && <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">{filtrosAtivos}</Badge>}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-semibold">Filtros Avançados</h3>
                </div>
                {filtrosAtivos > 0 && (
                  <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-xs h-7">
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>

              <Separator />

              {/* Status - Colapsível */}
              <Collapsible open={statusExpanded} onOpenChange={setStatusExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label className="cursor-pointer text-sm font-medium">Status do Fornecedor</Label>
                    </div>
                    {statusExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 gap-2 ml-6">
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={filtros.status?.includes(option.value) || false}
                          onCheckedChange={(checked) => handleStatusChange(option.value, checked as boolean)}
                        />
                        <Label
                          htmlFor={`status-${option.value}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span className={`px-2 py-1 rounded-full text-xs ${option.color}`}>{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Valor Total dos Contratos - Colapsível */}
              <Collapsible open={valorExpanded} onOpenChange={setValorExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Label className="cursor-pointer text-sm font-medium">Valor Total dos Contratos</Label>
                    </div>
                    {valorExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="valor-minimo" className="text-xs text-muted-foreground">
                        Valor Mínimo (R$)
                      </Label>
                      <Input
                        id="valor-minimo"
                        type="number"
                        placeholder="0,00"
                        value={filtros.valorMinimo || ""}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            valorMinimo: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor-maximo" className="text-xs text-muted-foreground">
                        Valor Máximo (R$)
                      </Label>
                      <Input
                        id="valor-maximo"
                        type="number"
                        placeholder="0,00"
                        value={filtros.valorMaximo || ""}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            valorMaximo: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Contratos Ativos - Colapsível */}
              <Collapsible open={contratosExpanded} onOpenChange={setContratosExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <Label className="cursor-pointer text-sm font-medium">Quantidade de Contratos Ativos</Label>
                    </div>
                    {contratosExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="contratos-minimo" className="text-xs text-muted-foreground">
                        Mínimo
                      </Label>
                      <Input
                        id="contratos-minimo"
                        type="number"
                        placeholder="0"
                        value={filtros.contratosAtivosMinimo || ""}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            contratosAtivosMinimo: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contratos-minimo" className="text-xs text-muted-foreground">
                        Máximo
                      </Label>
                      <Input
                        id="contratos-maximo"
                        type="number"
                        placeholder="0"
                        value={filtros.contratosAtivosMaximo || ""}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            contratosAtivosMaximo: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="h-9"
                      />
                    </div>
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
            <span className="text-sm text-muted-foreground">
              {filtrosAtivos} filtro{filtrosAtivos > 1 ? "s" : ""} ativo{filtrosAtivos > 1 ? "s" : ""}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
