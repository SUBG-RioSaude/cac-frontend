import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Loader2,
} from 'lucide-react'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from '@/hooks/use-debounce'

import type { FiltrosUsuariosApi } from '../types/usuario-api'

const FILTROS_IGNORADOS: (keyof FiltrosUsuariosApi)[] = [
  'pagina',
  'tamanhoPagina',
]

function sanitizeFiltros(filtros: FiltrosUsuariosApi): FiltrosUsuariosApi {
  if (typeof filtros !== 'object') {
    return {}
  }
  return (
    Object.entries(filtros) as [
      keyof FiltrosUsuariosApi,
      FiltrosUsuariosApi[keyof FiltrosUsuariosApi],
    ][]
  ).reduce<FiltrosUsuariosApi>((acc, [key, value]) => {
    if (FILTROS_IGNORADOS.includes(key)) {
      return acc
    }

    if (key === 'busca') {
      if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return acc
      }
    }

    if (value === undefined || value === null) {
      return acc
    }

    if (typeof value === 'string' && value.trim() === '') {
      return acc
    }

    ;(acc as Record<string, unknown>)[key] = value
    return acc
  }, {} as FiltrosUsuariosApi)
}

function shallowEqualFiltros(
  a: FiltrosUsuariosApi,
  b: FiltrosUsuariosApi,
): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  return keysA.every((key) => {
    const typedKey = key as keyof FiltrosUsuariosApi
    return a[typedKey] === b[typedKey]
  })
}

interface SearchAndFiltersUsuariosProps {
  onFiltrosChange: (filtros: FiltrosUsuariosApi) => void
  filtrosAtivos: FiltrosUsuariosApi
  isLoading?: boolean
  totalResultados?: number
}

export const SearchAndFiltersUsuarios = ({
  onFiltrosChange,
  filtrosAtivos,
  isLoading = false,
  totalResultados,
}: SearchAndFiltersUsuariosProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtrosBase = useMemo(
    () => sanitizeFiltros(filtrosAtivos),
    [filtrosAtivos],
  )
  const [termoPesquisaLocal, setTermoPesquisaLocal] = useState(
    filtrosAtivos.busca ?? '',
  )
  const [filtrosLocais, setFiltrosLocais] =
    useState<FiltrosUsuariosApi>(filtrosBase)

  // Debounce para pesquisa (500ms)
  const termoPesquisaDebounced = useDebounce(termoPesquisaLocal, 500)
  const filtrosAplicadosRef = useRef<string>('')

  // Estado para mostrar loading durante debounce
  const isSearching =
    termoPesquisaLocal !== termoPesquisaDebounced &&
    termoPesquisaLocal.trim() !== '' &&
    termoPesquisaLocal.trim().length >= 2

  useEffect(() => {
    setFiltrosLocais((prev) =>
      shallowEqualFiltros(prev, filtrosBase) ? prev : filtrosBase,
    )
  }, [filtrosBase])

  // Efeito para enviar pesquisa debounced
  useEffect(() => {
    const novosFiltros: FiltrosUsuariosApi = {
      ...filtrosLocais,
      busca: termoPesquisaDebounced.trim() || undefined,
    }

    const filtrosString = JSON.stringify(sanitizeFiltros(novosFiltros))
    if (filtrosString !== filtrosAplicadosRef.current) {
      filtrosAplicadosRef.current = filtrosString
      onFiltrosChange(novosFiltros)
    }
  }, [termoPesquisaDebounced, filtrosLocais, onFiltrosChange])

  const limparCampoPesquisa = useCallback(() => {
    setTermoPesquisaLocal('')
    const novosFiltros = { ...filtrosLocais, busca: undefined }
    setFiltrosLocais(novosFiltros)
    onFiltrosChange(novosFiltros)
  }, [filtrosLocais, onFiltrosChange])

  const aplicarFiltros = useCallback(() => {
    const novosFiltros: FiltrosUsuariosApi = {
      ...filtrosLocais,
      busca: termoPesquisaLocal.trim() || undefined,
    }
    onFiltrosChange(novosFiltros)
    setIsFilterOpen(false)
  }, [filtrosLocais, termoPesquisaLocal, onFiltrosChange])

  const limparFiltros = useCallback(() => {
    setTermoPesquisaLocal('')
    setFiltrosLocais({})
    onFiltrosChange({ pagina: 1, tamanhoPagina: 20 })
  }, [onFiltrosChange])

  const contarFiltrosAtivos = useCallback(() => {
    const filtros = sanitizeFiltros({
      ...filtrosLocais,
      busca: termoPesquisaLocal.trim() || undefined,
    })
    return Object.keys(filtros).length
  }, [filtrosLocais, termoPesquisaLocal])

  const filtrosAtivosCount = contarFiltrosAtivos()

  return (
    <div
      role="search"
      className="flex flex-col gap-4 lg:flex-row lg:items-center"
    >
      {/* Search Bar */}
      <motion.div
        className="relative min-h-[44px] max-w-md flex-1"
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
            aria-label="Buscar usuários por nome ou e-mail"
            aria-busy={isSearching}
            placeholder="Digite nome ou e-mail do usuário..."
            value={termoPesquisaLocal}
            onChange={(e) => {
              const novoTermo = e.target.value
              setTermoPesquisaLocal(novoTermo)

              if (novoTermo.trim() === '') {
                limparCampoPesquisa()
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && termoPesquisaLocal) {
                e.preventDefault()
                limparCampoPesquisa()
              }
            }}
            className="bg-background focus:border-primary h-11 w-full border-2 pr-4 pl-10 shadow-sm transition-all duration-200"
            disabled={isLoading}
          />
          {termoPesquisaLocal && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparCampoPesquisa}
              className="hover:bg-muted absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0"
              aria-label="Limpar pesquisa"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Botão de Filtros */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="relative h-11 gap-2 border-2 shadow-sm"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {filtrosAtivosCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {filtrosAtivosCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-4"
            onCloseAutoFocus={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filtros</h3>
                {filtrosAtivosCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltros}
                    className="h-7 text-xs"
                  >
                    Limpar tudo
                  </Button>
                )}
              </div>

              <Separator />

              {/* Filtro de Status Ativo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={
                    filtrosLocais.ativo === undefined || filtrosLocais.ativo === null
                      ? 'todos'
                      : filtrosLocais.ativo
                        ? 'ativo'
                        : 'inativo'
                  }
                  onValueChange={(value) => {
                    setFiltrosLocais((prev) => ({
                      ...prev,
                      ativo:
                        value === 'todos'
                          ? null
                          : value === 'ativo',
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Login Recente */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Último Login</Label>
                <Select
                  value={
                    filtrosLocais.loginRecente === undefined || filtrosLocais.loginRecente === null
                      ? 'todos'
                      : filtrosLocais.loginRecente
                        ? 'recentes'
                        : 'antigos'
                  }
                  onValueChange={(value) => {
                    setFiltrosLocais((prev) => ({
                      ...prev,
                      loginRecente:
                        value === 'todos'
                          ? null
                          : value === 'recentes',
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o filtro de login" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="recentes">Logins mais recentes</SelectItem>
                    <SelectItem value="antigos">Logins menos recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Ordenação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ordenar por</Label>
                <Select
                  value={filtrosLocais.ordenarPor ?? 'nome'}
                  onValueChange={(value) => {
                    setFiltrosLocais((prev) => ({
                      ...prev,
                      ordenarPor: value as FiltrosUsuariosApi['ordenarPor'],
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a ordenação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome">Nome</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="ultimoLogin">Último Login</SelectItem>
                    <SelectItem value="ativo">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Direção de Ordenação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Direção</Label>
                <Select
                  value={filtrosLocais.direcaoOrdenacao ?? 'asc'}
                  onValueChange={(value) => {
                    setFiltrosLocais((prev) => ({
                      ...prev,
                      direcaoOrdenacao: value as 'asc' | 'desc',
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={aplicarFiltros} className="flex-1">
                  Aplicar
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Total de resultados */}
      {totalResultados !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm"
        >
          {totalResultados} {totalResultados === 1 ? 'usuário encontrado' : 'usuários encontrados'}
        </motion.div>
      )}
    </div>
  )
}

