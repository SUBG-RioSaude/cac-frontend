import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  MapPin,
  ChevronDown,
  ChevronRight,
  Loader2,
  FileText,
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

import type { FiltrosUnidadesApi } from '../../types/unidade-api'

// Função para detectar se o termo é nome ou sigla
function detectarTipoPesquisa(termo: string): Partial<FiltrosUnidadesApi> {
  if (!termo || termo.trim() === '') {
    return {}
  }

  // Se parece com sigla (letras maiúsculas, underscores, hífens, slashes)
  if (/^[A-Z0-9/_-]+$/.test(termo.trim())) {
    return { sigla: termo.trim() }
  }

  // Caso contrário, é nome
  return { nome: termo.trim() }
}

const FILTROS_IGNORADOS: (keyof FiltrosUnidadesApi)[] = [
  'pagina',
  'tamanhoPagina',
]

function sanitizeFiltros(filtros: FiltrosUnidadesApi): FiltrosUnidadesApi {
  if (typeof filtros !== 'object') {
    return {}
  }
  return (
    Object.entries(filtros) as [
      keyof FiltrosUnidadesApi,
      FiltrosUnidadesApi[keyof FiltrosUnidadesApi],
    ][]
  ).reduce<FiltrosUnidadesApi>((acc, [key, value]) => {
    if (FILTROS_IGNORADOS.includes(key)) {
      return acc
    }

    if (
      key === 'nome' ||
      key === 'sigla' ||
      key === 'cnes' ||
      key === 'bairro'
    ) {
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

    // Type assertion needed due to generic nature of reduce operation
    ;(acc as Record<string, unknown>)[key] = value
    return acc
  }, {} as FiltrosUnidadesApi)
}

function shallowEqualFiltros(
  a: FiltrosUnidadesApi,
  b: FiltrosUnidadesApi,
): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  return keysA.every((key) => {
    const typedKey = key as keyof FiltrosUnidadesApi
    return a[typedKey] === b[typedKey]
  })
}

interface SearchAndFiltersUnidadesProps {
  onFiltrosChange: (filtros: FiltrosUnidadesApi) => void
  filtrosAtivos: FiltrosUnidadesApi
  isLoading?: boolean
}

export const SearchAndFiltersUnidades = ({
  onFiltrosChange,
  filtrosAtivos,
  isLoading = false,
}: SearchAndFiltersUnidadesProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Estados locais para UI
  const [statusExpanded, setStatusExpanded] = useState(false)
  const filtrosBase = useMemo(
    () => sanitizeFiltros(filtrosAtivos),
    [filtrosAtivos],
  )
  const [termoPesquisaLocal, setTermoPesquisaLocal] = useState(
    filtrosAtivos.nome ?? filtrosAtivos.sigla ?? '',
  )
  const [filtrosLocais, setFiltrosLocais] =
    useState<FiltrosUnidadesApi>(filtrosBase)

  // Debounce para pesquisa (500ms)
  const termoPesquisaDebounced = useDebounce(termoPesquisaLocal, 500)
  const filtrosAplicadosRef = useRef<string>('')

  // Estado para mostrar loading durante debounce
  const isSearching =
    termoPesquisaLocal !== termoPesquisaDebounced && termoPesquisaLocal !== ''

  useEffect(() => {
    setFiltrosLocais((prev: FiltrosUnidadesApi) =>
      shallowEqualFiltros(prev, filtrosBase) ? prev : filtrosBase,
    )
  }, [filtrosBase])

  // Efeito para enviar pesquisa debounced
  useEffect(() => {
    // Só processa se há termo de pesquisa debounced ou se mudaram outros filtros
    const temPesquisa = termoPesquisaDebounced.trim() !== ''

    const filtrosNormalizados = sanitizeFiltros(filtrosLocais)

    // Se não tem pesquisa, remove explicitamente nome e sigla
    const pesquisaDetectada = temPesquisa
      ? detectarTipoPesquisa(termoPesquisaDebounced)
      : {
          nome: undefined,
          sigla: undefined,
        }

    const filtrosParaEnviar: FiltrosUnidadesApi = {
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
    { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'inativo', label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
  ]

  const handleStatusChange = useCallback((status: string, checked: boolean) => {
    setFiltrosLocais((prev: FiltrosUnidadesApi) => {
      if (checked) {
        return { ...prev, ativo: status === 'ativo' }
      }
      const { ativo: _ativo, ...rest } = prev
      return rest as FiltrosUnidadesApi
    })
  }, [])

  const contarFiltrosAtivos = useCallback(() => {
    let count = 0
    if (filtrosLocais.ativo !== undefined) count++
    if (filtrosLocais.cnes) count++
    if (filtrosLocais.bairro) count++
    if (termoPesquisaLocal) count++
    return count
  }, [filtrosLocais, termoPesquisaLocal])

  const filtrosAtivosCount = contarFiltrosAtivos()

  const limparFiltros = useCallback(() => {
    setTermoPesquisaLocal('')
    setFiltrosLocais({})
    setStatusExpanded(false)
    // Força o reset enviando apenas paginação
    onFiltrosChange({ pagina: 1, tamanhoPagina: 10, ativo: true })
  }, [onFiltrosChange])

  return (
    <div
      role="search"
      className="flex flex-col gap-4 lg:flex-row lg:items-center"
    >
      {/* Search Bar */}
      <motion.div
        className="relative max-w-md flex-1"
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
            placeholder="Digite nome ou sigla da unidade..."
            value={termoPesquisaLocal}
            onChange={(e) => {
              const novoTermo = e.target.value
              setTermoPesquisaLocal(novoTermo)

              // Se o campo foi limpo, reset imediato dos filtros de pesquisa
              if (novoTermo.trim() === '') {
                // Remove nome e sigla dos filtros locais também
                setFiltrosLocais((prev: FiltrosUnidadesApi) => {
                  const filtrosSemPesquisa = { ...prev }
                  delete filtrosSemPesquisa.nome
                  delete filtrosSemPesquisa.sigla
                  return filtrosSemPesquisa
                })

                const filtrosParaEnviar = {
                  pagina: 1,
                  tamanhoPagina: filtrosLocais.tamanhoPagina ?? 10,
                  // Preserva outros filtros ativos (status, cnes, bairro)
                  ...(filtrosLocais.ativo !== undefined && {
                    ativo: filtrosLocais.ativo,
                  }),
                  ...(filtrosLocais.cnes && { cnes: filtrosLocais.cnes }),
                  ...(filtrosLocais.bairro && { bairro: filtrosLocais.bairro }),
                  // Explicitamente define nome e sigla como undefined
                  nome: undefined,
                  sigla: undefined,
                }

                // Atualiza referência para evitar conflitos
                filtrosAplicadosRef.current = JSON.stringify(filtrosParaEnviar)
                onFiltrosChange(filtrosParaEnviar)
              }
            }}
            className="bg-background focus:border-primary h-11 w-full border-2 pr-4 pl-10 shadow-sm transition-all duration-200 lg:w-full"
            disabled={isLoading}
          />
          {termoPesquisaLocal && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTermoPesquisaLocal('')

                // Remove nome e sigla dos filtros locais também
                setFiltrosLocais((prev: FiltrosUnidadesApi) => {
                  const filtrosSemPesquisa = { ...prev }
                  delete filtrosSemPesquisa.nome
                  delete filtrosSemPesquisa.sigla
                  return filtrosSemPesquisa
                })

                const filtrosParaEnviar = {
                  pagina: 1,
                  tamanhoPagina: filtrosLocais.tamanhoPagina ?? 10,
                  // Preserva outros filtros ativos (status, cnes, bairro)
                  ...(filtrosLocais.ativo !== undefined && {
                    ativo: filtrosLocais.ativo,
                  }),
                  ...(filtrosLocais.cnes && { cnes: filtrosLocais.cnes }),
                  ...(filtrosLocais.bairro && { bairro: filtrosLocais.bairro }),
                  // Explicitamente define nome e sigla como undefined
                  nome: undefined,
                  sigla: undefined,
                }

                // Atualiza referência para evitar conflitos
                filtrosAplicadosRef.current = JSON.stringify(filtrosParaEnviar)
                onFiltrosChange(filtrosParaEnviar)
              }}
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
                          checked={
                            filtrosLocais.ativo === (option.value === 'ativo')
                          }
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

              {/* CNES - Colapsível */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        CNES
                      </Label>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6">
                    <Input
                      placeholder="Ex: 2269311, 7654321..."
                      value={filtrosLocais.cnes ?? ''}
                      onChange={(e) => {
                        const valor = e.target.value
                        setFiltrosLocais((prev: FiltrosUnidadesApi) => {
                          if (valor === '') {
                            const { cnes: _cnes, ...rest } = prev
                            return rest as FiltrosUnidadesApi
                          }
                          return { ...prev, cnes: valor }
                        })
                      }}
                      className="h-9"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Bairro - Colapsível */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full cursor-pointer justify-between p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <Label className="cursor-pointer text-sm font-medium">
                        Bairro
                      </Label>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="ml-6">
                    <Input
                      placeholder="Ex: Centro, Copacabana..."
                      value={filtrosLocais.bairro ?? ''}
                      onChange={(e) => {
                        const valor = e.target.value
                        setFiltrosLocais((prev: FiltrosUnidadesApi) => {
                          if (valor === '') {
                            const { bairro: _bairro, ...rest } = prev
                            return rest as FiltrosUnidadesApi
                          }
                          return { ...prev, bairro: valor }
                        })
                      }}
                      className="h-9"
                    />
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
