import { Search, Building2, MapPin, Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'
import {
  useUnidades,
  useBuscarUnidades,
} from '@/modules/Unidades/hooks/use-unidades'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

// Função para mapear UnidadeSaudeApi para UnidadeHospitalar
function mapearUnidadeSaudeParaHospitalar(
  unidade: UnidadeSaudeApi,
): UnidadeHospitalar {
  return {
    id: unidade.id,
    nome: unidade.nome,
    codigo: `${unidade.sigla ?? 'UNK'}-${unidade.id.slice(-3)}`,
    ug: unidade.uo?.toString() ?? '',
    sigla: unidade.sigla ?? '',
    cnpj: unidade.cnes ?? '', // CNES como aproximação
    cep: '', // Não disponível na API atual
    endereco: unidade.endereco ?? '',
    cidade: '', // Não disponível na API atual
    estado: '', // Não disponível na API atual
    responsavel: '', // Não disponível na API atual
    telefone: '', // Não disponível na API atual
    email: '', // Não disponível na API atual
    ativa: unidade.ativo,
  }
}

interface BuscaUnidadeInteligenteProps {
  onUnidadeSelecionada: (unidade: UnidadeHospitalar) => void
  unidadeSelecionada?: UnidadeHospitalar | null
  onLimpar?: () => void
}

const BuscaUnidadeInteligente = ({
  onUnidadeSelecionada,
  unidadeSelecionada,
  onLimpar,
}: BuscaUnidadeInteligenteProps) => {
  const [termoBusca, setTermoBusca] = useState('')
  const [debouncedTermoBusca, setDebouncedTermoBusca] = useState('')
  const [resultados, setResultados] = useState<UnidadeHospitalar[]>([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hooks da API - usar termo com debounce
  const {
    data: unidadesData,
    isLoading: carregandoUnidades,
    error: erroUnidades,
  } = useUnidades(
    { tamanhoPagina: 100 },
    { enabled: debouncedTermoBusca.length === 0 }, // Só carregar lista completa se não há busca
  )

  const {
    data: unidadesBusca,
    isLoading: carregandoBusca,
    error: erroBusca,
  } = useBuscarUnidades(debouncedTermoBusca, {
    enabled: debouncedTermoBusca.length >= 2,
  })

  // Loading combinado: debounce local + requisições da API
  const carregando =
    isSearching ||
    carregandoBusca ||
    (carregandoUnidades && debouncedTermoBusca.length === 0)
  const erro = erroUnidades ?? erroBusca

  // Debounce do termo de busca para evitar spam de requests
  useEffect(() => {
    if (termoBusca.length < 2) {
      setDebouncedTermoBusca('')
      setIsSearching(false)
      setResultados([])
      setMostrarResultados(false)
      return
    }

    // Mostrar loading imediatamente quando usuário digita
    setIsSearching(true)

    const timer = setTimeout(() => {
      setDebouncedTermoBusca(termoBusca)
      setIsSearching(false) // O loading da API assumirá
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [termoBusca])

  // Processar resultados quando dados chegam da API
  useEffect(() => {
    let unidadesParaFiltrar: UnidadeSaudeApi[] = []

    if (debouncedTermoBusca.length >= 2 && unidadesBusca) {
      // Usar dados da busca específica
      unidadesParaFiltrar = unidadesBusca
    } else if (debouncedTermoBusca.length === 0 && unidadesData?.dados) {
      // Lista completa quando não há busca
      unidadesParaFiltrar = unidadesData.dados
    } else if (
      debouncedTermoBusca.length >= 2 &&
      unidadesData?.dados &&
      !unidadesBusca
    ) {
      // Fallback: filtrar localmente se busca específica não funcionou
      const termo = debouncedTermoBusca.toLowerCase()
      unidadesParaFiltrar = unidadesData.dados.filter(
        (unidade) =>
          unidade.nome.toLowerCase().includes(termo) ||
          unidade.sigla?.toLowerCase().includes(termo),
      )
    }

    const resultadosMapeados = unidadesParaFiltrar.map(
      mapearUnidadeSaudeParaHospitalar,
    )
    setResultados(resultadosMapeados)
    setMostrarResultados(
      debouncedTermoBusca.length >= 2 && resultadosMapeados.length >= 0,
    )
  }, [debouncedTermoBusca, unidadesBusca, unidadesData])

  // Fecha resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMostrarResultados(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelecionarUnidade = (unidade: UnidadeHospitalar) => {
    onUnidadeSelecionada(unidade)
    setTermoBusca('')
    setMostrarResultados(false)
    setResultados([])
  }

  const handleLimparSelecao = () => {
    if (onLimpar) {
      onLimpar()
    }
    setTermoBusca('')
    setResultados([])
    setMostrarResultados(false)
    inputRef.current?.focus()
  }

  const destacarTexto = (texto: string, termo: string) => {
    if (!termo) return texto

    // Escapar caracteres especiais do regex
    const termoEscapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`(${termoEscapado})`, 'gi')
    const partes = texto.split(regex)

    return partes.map((parte) =>
      regex.test(parte) ? (
        <mark key={`highlight-${parte}`} className="rounded bg-blue-200 px-1 text-blue-900">
          {parte}
        </mark>
      ) : (
        parte
      ),
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative space-y-4"
      data-testid="busca-unidade-inteligente"
    >
      {/* Campo de busca ou unidade selecionada */}
      {!unidadeSelecionada ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Buscar Unidade Hospitalar
          </Label>
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              data-testid="search-icon"
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Digite UG, sigla, CNPJ ou nome da unidade..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pr-4 pl-10"
              autoComplete="off"
            />
            {carregando && (
              <div
                className="absolute top-1/2 right-3 -translate-y-1/2"
                data-testid="loading-spinner"
              >
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Digite pelo menos 2 caracteres para buscar
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Unidade Selecionada
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLimparSelecao}
              className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="mr-1 h-4 w-4" />
              Alterar
            </Button>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <h3 className="truncate font-semibold text-green-900">
                        {unidadeSelecionada.nome}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {unidadeSelecionada.sigla}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-green-700 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">UG:</span>
                        <span>{unidadeSelecionada.ug}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">CNES:</span>
                        <span>{unidadeSelecionada.cnpj}</span>
                      </div>
                      {unidadeSelecionada.endereco && (
                        <div className="flex items-center space-x-2 md:col-span-2">
                          <MapPin className="h-3 w-3" />
                          <span>{unidadeSelecionada.endereco}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Check
                  className="h-5 w-5 flex-shrink-0 text-green-600"
                  data-testid="check-icon"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resultados da busca */}
      {mostrarResultados && resultados.length > 0 && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-1 border shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {resultados.map((unidade, index) => (
                <button
                  key={unidade.id}
                  type="button"
                  onClick={() => handleSelecionarUnidade(unidade)}
                  className={cn(
                    'w-full p-4 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    index !== resultados.length - 1 &&
                      'border-b border-gray-100',
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h4 className="truncate font-medium text-gray-900">
                          {destacarTexto(unidade.nome, debouncedTermoBusca)}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {destacarTexto(unidade.sigla, debouncedTermoBusca)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">UG:</span>{' '}
                          {destacarTexto(unidade.ug, debouncedTermoBusca)}
                        </div>
                        <div>
                          <span className="font-medium">CNES:</span>{' '}
                          {destacarTexto(unidade.cnpj, debouncedTermoBusca)}
                        </div>
                        {unidade.endereco && (
                          <div className="col-span-2 flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{unidade.endereco}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {resultados.length > 5 && (
              <div className="border-t border-gray-100 p-2 text-center">
                <p className="text-xs text-gray-500">
                  {resultados.length} unidades encontradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nenhum resultado encontrado ou erro */}
      {mostrarResultados &&
        resultados.length === 0 &&
        termoBusca.length >= 2 &&
        !carregando && (
          <Card className="absolute top-full right-0 left-0 z-50 mt-1 border shadow-lg">
            <CardContent className="p-4 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              {erro ? (
                <>
                  <p className="mb-1 text-sm text-red-600">
                    Erro ao buscar unidades
                  </p>
                  <p className="text-xs text-gray-500">
                    Verifique sua conexão e tente novamente
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-1 text-sm text-gray-600">
                    Nenhuma unidade encontrada
                  </p>
                  <p className="text-xs text-gray-500">
                    Tente buscar por UG, sigla, CNES ou nome da unidade
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  )
}

export default BuscaUnidadeInteligente
