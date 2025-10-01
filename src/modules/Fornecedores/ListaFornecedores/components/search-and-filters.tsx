import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  DollarSign,
  FileText,
  Hash,
  ChevronDown,
  ChevronRight,
  Loader2,
  Info,
} from 'lucide-react'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from '@/hooks/use-debounce'

import type { FiltrosFornecedorApi } from '../types/fornecedor'

// Função para detectar se o termo é CNPJ ou Razão Social
function detectarTipoPesquisa(termo: string): Partial<FiltrosFornecedorApi> {
  if (!termo || termo.trim() === '') {
    return {}
  }

  // Remove espaços e caracteres especiais para detecção
  const termoLimpo = termo.replace(/[^\w]/g, '')

  // Se for apenas números e tem 11 ou 14 dígitos, é CNPJ
  if (/^\d{11,14}$/.test(termoLimpo)) {
    return { cnpj: termo.trim() }
  }

  // Caso contrário, é Razão Social
  return { razaoSocial: termo.trim() }
}

const FILTROS_IGNORADOS: (keyof FiltrosFornecedorApi)[] = [
  'pagina',
  'tamanhoPagina',
]

function sanitizeFiltros(filtros: FiltrosFornecedorApi): FiltrosFornecedorApi {
  return (
    Object.entries(filtros) as [
        keyof FiltrosFornecedorApi,
        FiltrosFornecedorApi[keyof FiltrosFornecedorApi],
      ][]
  ).reduce<FiltrosFornecedorApi>((acc, [key, value]) => {
    if (FILTROS_IGNORADOS.includes(key)) {
      return acc
    }

    if (key === 'cnpj' || key === 'razaoSocial') {
      if (value === undefined) {
        acc[key] = undefined
        return acc
      }
      if (typeof value === 'string' && value.trim() === '') {
        return acc
      }
    }

    if (value === undefined) {
      return acc
    }

    if (typeof value === 'string' && value.trim() === '') {
      return acc
    }

    acc[key] = undefined
    return acc
  }, {} as FiltrosFornecedorApi)
}

function shallowEqualFiltros(
  a: FiltrosFornecedorApi,
  b: FiltrosFornecedorApi,
): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  return keysA.every((key) => {
    const typedKey = key as keyof FiltrosFornecedorApi
    return a[typedKey] === b[typedKey]
  })
}

interface SearchAndFiltersFornecedoresProps {
  onFiltrosChange: (filtros: FiltrosFornecedorApi) => void
  filtrosAtivos: FiltrosFornecedorApi
  isLoading?: boolean
  totalResultados?: number
}

export const SearchAndFiltersFornecedores = ({
  onFiltrosChange,
  filtrosAtivos,
  isLoading = false,
  totalResultados,
}: SearchAndFiltersFornecedoresProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Estados locais para UI
  const [statusExpanded, setStatusExpanded] = useState(false)
  const [valorExpanded, setValorExpanded] = useState(false)
  const [contratosExpanded, setContratosExpanded] = useState(false)
  const filtrosBase = useMemo(
    () => sanitizeFiltros(filtrosAtivos),
    [filtrosAtivos],
  )
  const [termoPesquisaLocal, setTermoPesquisaLocal] = useState(
    filtrosAtivos.cnpj ?? filtrosAtivos.razaoSocial ?? '',
  )
  const [filtrosLocais, setFiltrosLocais] =
    useState<FiltrosFornecedorApi>(filtrosBase)

  // Debounce para pesquisa (500ms)
  const termoPesquisaDebounced = useDebounce(termoPesquisaLocal, 500)
  const filtrosAplicadosRef = useRef<string>('')

  // Estado para mostrar loading durante debounce
  // Só mostra loading se tiver 3+ caracteres e ainda não terminou o debounce
  const isSearching = termoPesquisaLocal !== termoPesquisaDebounced &&
    termoPesquisaLocal.trim() !== '' &&
    termoPesquisaLocal.trim().length >= 3

  useEffect(() => {
    setFiltrosLocais((prev) =>
      shallowEqualFiltros(prev, filtrosBase) ? prev : filtrosBase,
    )
  }, [filtrosBase])

  // Efeito para enviar pesquisa debounced
  useEffect(() => {
    const termoTrimmed = termoPesquisaDebounced.trim()
    const temPesquisa = termoTrimmed !== ''

    // Validação: só buscar se tiver 3+ caracteres OU campo vazio
    // Se tiver 1-2 caracteres, não fazer nada
    if (temPesquisa && termoTrimmed.length < 3) {
      return
    }

    const filtrosNormalizados = sanitizeFiltros(filtrosLocais)

    // Se não tem pesquisa, remove explicitamente cnpj e razaoSocial
    const pesquisaDetectada = temPesquisa
      ? detectarTipoPesquisa(termoPesquisaDebounced)
      : {
          cnpj: undefined,
          razaoSocial: undefined,
        }

    const filtrosParaEnviar: FiltrosFornecedorApi = {
      ...filtrosNormalizados,
      ...pesquisaDetectada,
    }

    const filtrosSerializados = JSON.stringify(filtrosParaEnviar)
    if (filtrosSerializados === filtrosAplicadosRef.current) {
      return
    }

    filtrosAplicadosRef.current = filtrosSerializados
    onFiltrosChange(filtrosParaEnviar)
  }, [filtrosLocais, termoPesquisaDebounced, onFiltrosChange])

  const statusOptions = [
    { value: 'Ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'Inativo', label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
    { value: 'Suspenso', label: 'Suspenso', color: 'bg-red-100 text-red-800' },
  ]

  const handleStatusChange = useCallback((status: string, checked: boolean) => {
    setFiltrosLocais((prev) => {
      if (checked) {
        return { ...prev, status }
      }
      const { status: _status, ...rest } = prev
      return rest as FiltrosFornecedorApi
    })
  }, [])

  const contarFiltrosAtivos = useCallback(() => {
    let count = 0
    if (filtrosLocais.status) count++
    if (filtrosLocais.valorMinimo || filtrosLocais.valorMaximo) count++
    if (filtrosLocais.contratosMinimo || filtrosLocais.contratosMaximo) count++
    if (termoPesquisaLocal) count++
    return count
  }, [filtrosLocais, termoPesquisaLocal])

  const filtrosAtivosCount = contarFiltrosAtivos()

  const limparCampoPesquisa = useCallback(() => {
    setTermoPesquisaLocal('')

    // Remove cnpj e razaoSocial dos filtros locais
    setFiltrosLocais(prev => {
      const filtrosSemPesquisa = { ...prev }
      delete filtrosSemPesquisa.cnpj
      delete filtrosSemPesquisa.razaoSocial
      return filtrosSemPesquisa
    })

    const filtrosParaEnviar = {
      pagina: 1,
      tamanhoPagina: filtrosLocais.tamanhoPagina ?? 10,
      // Preserva outros filtros ativos
      ...(filtrosLocais.status !== undefined && { status: filtrosLocais.status }),
      ...(filtrosLocais.valorMinimo !== undefined && { valorMinimo: filtrosLocais.valorMinimo }),
      ...(filtrosLocais.valorMaximo !== undefined && { valorMaximo: filtrosLocais.valorMaximo }),
      ...(filtrosLocais.contratosMinimo !== undefined && { contratosMinimo: filtrosLocais.contratosMinimo }),
      ...(filtrosLocais.contratosMaximo !== undefined && { contratosMaximo: filtrosLocais.contratosMaximo }),
      cnpj: undefined,
      razaoSocial: undefined,
    }

    filtrosAplicadosRef.current = JSON.stringify(filtrosParaEnviar)
    onFiltrosChange(filtrosParaEnviar)

    // Mantém foco no input
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [filtrosLocais, onFiltrosChange])

  const limparFiltros = useCallback(() => {
    setTermoPesquisaLocal('')
    setFiltrosLocais({})
    setStatusExpanded(false)
    setValorExpanded(false)
    setContratosExpanded(false)
    // Força o reset enviando apenas paginação
    onFiltrosChange({ pagina: 1, tamanhoPagina: 10 })
  }, [onFiltrosChange])

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou / para focar no campo de busca
      if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
        // Não ativar se usuário está digitando em outro input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return
        }

        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Mantém foco no input durante e após buscas
  useEffect(() => {
    // Se há termo de pesquisa e o input não está focado, restaura o foco
    // Isso evita perda de foco durante re-renders causados por atualizações da API
    if (termoPesquisaLocal.length > 0 &&
        document.activeElement !== inputRef.current &&
        !isFilterOpen) { // Não restaurar foco se dropdown de filtros estiver aberto
      // Usar requestAnimationFrame para garantir que o foco seja restaurado após o render
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [totalResultados, isLoading, termoPesquisaLocal, isFilterOpen])

  return (
    <div
      role="search"
      className="flex flex-col gap-4 lg:flex-row lg:items-center"
    >
      {/* Search Bar */}
      <motion.div
        className="relative max-w-md flex-1 min-h-[44px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {isSearching || isLoading ? (
            <Loader2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform animate-spin" />
          ) : (
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          )}
          <Input
            ref={inputRef}
            role="searchbox"
            aria-label="Buscar fornecedores por CNPJ ou Razão Social"
            aria-busy={isSearching}
            aria-describedby="search-hint"
            placeholder="Digite CNPJ ou Razão Social do fornecedor..."
            value={termoPesquisaLocal}
            onChange={(e) => {
              const novoTermo = e.target.value
              setTermoPesquisaLocal(novoTermo)

              // Se o campo foi limpo, reset imediato dos filtros de pesquisa
              if (novoTermo.trim() === '') {
                limparCampoPesquisa()
              }
            }}
            onKeyDown={(e) => {
              // ESC limpa o campo
              if (e.key === 'Escape' && termoPesquisaLocal) {
                e.preventDefault()
                limparCampoPesquisa()
              }
            }}
            className="bg-background focus:border-primary h-11 w-full border-2 pr-4 pl-10 shadow-sm transition-all duration-200 lg:w-full"
            disabled={isLoading}
          />
          {termoPesquisaLocal && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparCampoPesquisa}
              className="hover:bg-muted absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0"
              aria-label="Limpar busca"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Mensagem informativa quando digitar menos de 3 caracteres - Posicionamento absoluto */}
        <AnimatePresence>
          {termoPesquisaLocal.trim().length > 0 && termoPesquisaLocal.trim().length < 3 && (
            <motion.div
              id="search-hint"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 flex items-center gap-2 text-muted-foreground text-sm bg-background/95 backdrop-blur-sm px-3 py-2 rounded-md border shadow-sm z-10"
            >
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>Digite pelo menos 3 caracteres para buscar</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contador de resultados - Posicionamento absoluto */}
        <AnimatePresence>
          {termoPesquisaLocal.trim().length >= 3 && totalResultados !== undefined && !isSearching && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 z-10"
            >
              <Badge variant="secondary" className="text-xs shadow-sm">
                {totalResultados} {totalResultados === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="h-11 w-full cursor-pointer bg-transparent px-4 shadow-sm transition-all duration-200 hover:bg-slate-600 lg:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {filtrosAtivosCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {filtrosAtivosCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-96 p-0"
            align="start"
            sideOffset={8}
          >
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
                {filtrosAtivosCount > 0 && (
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
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Status do Fornecedor
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
                          checked={filtrosLocais.status === option.value}
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

              {/* Valor Total dos Contratos - Colapsível */}
              <Collapsible open={valorExpanded} onOpenChange={setValorExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Valor Total dos Contratos
                      </Label>
                    </div>
                    {valorExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6 grid grid-cols-2 gap-3">
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
                        value={filtrosLocais.valorMinimo ?? ''}
                        onChange={(e) => {
                          const valor = e.target.value
                          setFiltrosLocais((prev) => {
                            if (valor === '') {
                              const { valorMinimo: _valorMinimo, ...rest } = prev
                              return rest as FiltrosFornecedorApi
                            }
                            return { ...prev, valorMinimo: Number(valor) }
                          })
                        }}
                        className="h-9"
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
                        value={filtrosLocais.valorMaximo ?? ''}
                        onChange={(e) => {
                          const valor = e.target.value
                          setFiltrosLocais((prev) => {
                            if (valor === '') {
                              const { valorMaximo: _valorMaximo, ...rest } = prev
                              return rest as FiltrosFornecedorApi
                            }
                            return { ...prev, valorMaximo: Number(valor) }
                          })
                        }}
                        className="h-9"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Contratos Ativos - Colapsível */}
              <Collapsible
                open={contratosExpanded}
                onOpenChange={setContratosExpanded}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Quantidade de Contratos Ativos
                      </Label>
                    </div>
                    {contratosExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
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
                        value={filtrosLocais.contratosMinimo ?? ''}
                        onChange={(e) => {
                          const valor = e.target.value
                          setFiltrosLocais((prev) => {
                            if (valor === '') {
                              const { contratosMinimo: _contratosMinimo, ...rest } = prev
                              return rest as FiltrosFornecedorApi
                            }
                            return { ...prev, contratosMinimo: Number(valor) }
                          })
                        }}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
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
                        value={filtrosLocais.contratosMaximo ?? ''}
                        onChange={(e) => {
                          const valor = e.target.value
                          setFiltrosLocais((prev) => {
                            if (valor === '') {
                              const { contratosMaximo: _contratosMaximo, ...rest } = prev
                              return rest as FiltrosFornecedorApi
                            }
                            return { ...prev, contratosMaximo: Number(valor) }
                          })
                        }}
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
        {filtrosAtivosCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <span className="text-muted-foreground text-sm">
              {filtrosAtivosCount} filtro{filtrosAtivosCount > 1 ? 's' : ''}{' '}
              ativo
              {filtrosAtivosCount > 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
