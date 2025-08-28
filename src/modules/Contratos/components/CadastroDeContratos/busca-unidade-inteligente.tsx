import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Building2, MapPin, Phone, Mail, Check, X, Loader2 } from "lucide-react"
import type { UnidadeHospitalar } from "@/modules/Contratos/types/unidades"
import { cn } from "@/lib/utils"
import { useUnidades, useBuscarUnidades } from '@/modules/Unidades/hooks/use-unidades'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

// Função para mapear UnidadeSaudeApi para UnidadeHospitalar
function mapearUnidadeSaudeParaHospitalar(unidade: UnidadeSaudeApi): UnidadeHospitalar {
  return {
    id: unidade.id,
    nome: unidade.nome,
    codigo: `${unidade.sigla || 'UNK'}-${unidade.id.slice(-3)}`,
    ug: unidade.uo?.toString() || '',
    sigla: unidade.sigla || '',
    cnpj: unidade.cnes || '', // CNES como aproximação
    cep: '', // Não disponível na API atual
    endereco: unidade.endereco || '',
    cidade: '', // Não disponível na API atual
    estado: '', // Não disponível na API atual
    responsavel: '', // Não disponível na API atual
    telefone: '', // Não disponível na API atual
    email: '', // Não disponível na API atual
    ativa: unidade.ativo
  }
}

interface BuscaUnidadeInteligenteProps {
  onUnidadeSelecionada: (unidade: UnidadeHospitalar) => void
  unidadeSelecionada?: UnidadeHospitalar | null
  onLimpar?: () => void
}

export default function BuscaUnidadeInteligente({
  onUnidadeSelecionada,
  unidadeSelecionada,
  onLimpar,
}: BuscaUnidadeInteligenteProps) {
  const [termoBusca, setTermoBusca] = useState("")
  const [debouncedTermoBusca, setDebouncedTermoBusca] = useState("")
  const [resultados, setResultados] = useState<UnidadeHospitalar[]>([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hooks da API - usar termo com debounce
  const { data: unidadesData, isLoading: carregandoUnidades, error: erroUnidades } = useUnidades(
    { tamanhoPagina: 100 },
    { enabled: debouncedTermoBusca.length === 0 } // Só carregar lista completa se não há busca
  )
  
  const { data: unidadesBusca, isLoading: carregandoBusca, error: erroBusca } = useBuscarUnidades(
    debouncedTermoBusca,
    { enabled: debouncedTermoBusca.length >= 2 }
  )

  // Loading combinado: debounce local + requisições da API
  const carregando = isSearching || carregandoBusca || (carregandoUnidades && debouncedTermoBusca.length === 0)
  const erro = erroUnidades || erroBusca

  // Debounce do termo de busca para evitar spam de requests
  useEffect(() => {
    if (termoBusca.length < 2) {
      setDebouncedTermoBusca("")
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
    
    if (debouncedTermoBusca.length >= 2 && unidadesBusca?.dados) {
      // Usar dados da busca específica
      unidadesParaFiltrar = unidadesBusca.dados
    } else if (debouncedTermoBusca.length === 0 && unidadesData?.dados) {
      // Lista completa quando não há busca
      unidadesParaFiltrar = unidadesData.dados
    } else if (debouncedTermoBusca.length >= 2 && unidadesData?.dados && !unidadesBusca) {
      // Fallback: filtrar localmente se busca específica não funcionou
      const termo = debouncedTermoBusca.toLowerCase()
      unidadesParaFiltrar = unidadesData.dados.filter(unidade => 
        unidade.nome.toLowerCase().includes(termo) ||
        (unidade.sigla && unidade.sigla.toLowerCase().includes(termo))
      )
    }

    const resultadosMapeados = unidadesParaFiltrar.map(mapearUnidadeSaudeParaHospitalar)
    setResultados(resultadosMapeados)
    setMostrarResultados(debouncedTermoBusca.length >= 2 && resultadosMapeados.length >= 0)
  }, [debouncedTermoBusca, unidadesBusca, unidadesData])

  // Fecha resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarResultados(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelecionarUnidade = (unidade: UnidadeHospitalar) => {
    onUnidadeSelecionada(unidade)
    setTermoBusca("")
    setMostrarResultados(false)
    setResultados([])
  }

  const handleLimparSelecao = () => {
    if (onLimpar) {
      onLimpar()
    }
    setTermoBusca("")
    setResultados([])
    setMostrarResultados(false)
    inputRef.current?.focus()
  }

  const destacarTexto = (texto: string, termo: string) => {
    if (!termo) return texto

    const regex = new RegExp(`(${termo})`, "gi")
    const partes = texto.split(regex)

    return partes.map((parte, index) =>
      regex.test(parte) ? (
        <mark key={index} className="bg-blue-200 text-blue-900 rounded px-1">
          {parte}
        </mark>
      ) : (
        parte
      ),
    )
  }

  return (
    <div ref={containerRef} className="relative space-y-4" data-testid="busca-unidade-inteligente">
      {/* Campo de busca ou unidade selecionada */}
      {!unidadeSelecionada ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Buscar Unidade Hospitalar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" data-testid="search-icon" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Digite UG, sigla, CNPJ ou nome da unidade..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10 pr-4"
              autoComplete="off"
            />
            {carregando && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="loading-spinner">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">Digite pelo menos 2 caracteres para buscar</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Unidade Selecionada</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLimparSelecao}
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-green-900 truncate">{unidadeSelecionada.nome}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {unidadeSelecionada.sigla}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
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
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" data-testid="check-icon" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resultados da busca */}
      {mostrarResultados && resultados.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {resultados.map((unidade, index) => (
                <button
                  key={unidade.id}
                  type="button"
                  onClick={() => handleSelecionarUnidade(unidade)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors",
                    index !== resultados.length - 1 && "border-b border-gray-100",
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {destacarTexto(unidade.nome, debouncedTermoBusca)}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {destacarTexto(unidade.sigla, debouncedTermoBusca)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">UG:</span> {destacarTexto(unidade.ug, debouncedTermoBusca)}
                        </div>
                        <div>
                          <span className="font-medium">CNES:</span> {destacarTexto(unidade.cnpj, debouncedTermoBusca)}
                        </div>
                        {unidade.endereco && (
                          <div className="flex items-center space-x-1 col-span-2">
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
                <p className="text-xs text-gray-500">{resultados.length} unidades encontradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nenhum resultado encontrado ou erro */}
      {mostrarResultados && resultados.length === 0 && termoBusca.length >= 2 && !carregando && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
          <CardContent className="p-4 text-center">
            <Building2 className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            {erro ? (
              <>
                <p className="text-sm text-red-600 mb-1">Erro ao buscar unidades</p>
                <p className="text-xs text-gray-500">Verifique sua conexão e tente novamente</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-1">Nenhuma unidade encontrada</p>
                <p className="text-xs text-gray-500">Tente buscar por UG, sigla, CNES ou nome da unidade</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
