import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  FileText,
  Package,
  FileSignature,
  Calculator,
  Scale,
  TrendingUp,
  XCircle,
  Users,
  Minus,
  Pause,
  DollarSign,
  Clock,
  AlertTriangle,
  Check,
  Info,
} from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import type { TipoAlteracao } from '../../../../types/alteracoes-contratuais'
import {
  TIPOS_ALTERACAO_CONFIG,
  getBlocosObrigatorios,
  getBlocosOpcionais,
  getLimiteLegal,
  type TipoAlteracaoConfig,
  type TipoAlteracaoValido,
} from '../../../../types/alteracoes-contratuais'

interface TipoAlteracaoSelectorProps {
  tiposSelecionados: number[]
  onChange: (tipos: number[]) => void
  disabled?: boolean
  error?: string
}

// Mapeamento dos ícones
const ICONES_MAP = {
  Calendar,
  FileText,
  Package,
  FileSignature,
  Calculator,
  Scale,
  TrendingUp,
  XCircle,
  Users,
  Minus,
  Pause,
  DollarSign,
  Clock,
}

// Cores para os badges
const CORES_MAP = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

export const TipoAlteracaoSelector = ({
  tiposSelecionados = [],
  onChange,
  disabled = false,
  error,
}: TipoAlteracaoSelectorProps) => {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)

  // Tipos habilitados - apenas os 3 solicitados pelo usuário
  const tiposHabilitados = useMemo(() => new Set([1, 3, 4]), []) // AditivoPrazo, AditivoQualitativo, AditivoQuantidade

  const handleTipoToggle = useCallback(
    (tipo: TipoAlteracao) => {
      if (disabled || !tiposHabilitados.has(tipo)) return

      const novosTipos = tiposSelecionados.includes(tipo)
        ? tiposSelecionados.filter((t) => t !== tipo)
        : [...tiposSelecionados, tipo]

      onChange(novosTipos)
    },
    [tiposSelecionados, onChange, disabled, tiposHabilitados],
  )

  const handleLimparSelecao = useCallback(() => {
    if (disabled) return
    onChange([])
  }, [onChange, disabled])

  // Calcular informações dos tipos selecionados
  const infoSelecao = useMemo(() => {
    if (tiposSelecionados.length === 0) {
      return {
        blocosObrigatorios: new Set<string>(),
        blocosOpcionais: new Set<string>(),
        limiteLegal: 0,
        temAlertaLegal: false,
      }
    }

    const blocosObrigatorios = getBlocosObrigatorios(
      tiposSelecionados as TipoAlteracao[],
    )
    const blocosOpcionais = getBlocosOpcionais(
      tiposSelecionados as TipoAlteracao[],
    )
    const limiteLegal = getLimiteLegal(tiposSelecionados as TipoAlteracao[])
    const temAlertaLegal = tiposSelecionados.some((tipo) => {
      // Verificar se o tipo existe no config antes de acessar
      if (tipo in TIPOS_ALTERACAO_CONFIG) {
        const config = TIPOS_ALTERACAO_CONFIG[tipo as TipoAlteracaoValido]
        return config.limiteLegal && config.limiteLegal > 0
      }
      return false
    })

    return {
      blocosObrigatorios,
      blocosOpcionais,
      limiteLegal,
      temAlertaLegal,
    }
  }, [tiposSelecionados])

  // Ordenar tipos alfabeticamente por label
  const tiposOrdenados = useMemo(() => {
    return Object.values(TIPOS_ALTERACAO_CONFIG).sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR'),
    )
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Tipos de Alteração Contratual</span>
              {tiposSelecionados.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tiposSelecionados.length} selecionado
                  {tiposSelecionados.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {tiposSelecionados.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLimparSelecao}
                  disabled={disabled}
                >
                  Limpar seleção
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              >
                <Info className="mr-1 h-4 w-4" />
                {mostrarDetalhes ? 'Ocultar' : 'Ver'} detalhes
              </Button>
            </div>
          </CardTitle>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Lista de tipos ordenada */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tiposOrdenados.map((config: TipoAlteracaoConfig) => {
              const Icon = ICONES_MAP[config.icone as keyof typeof ICONES_MAP]
              const isSelected = tiposSelecionados.includes(config.tipo)
              const isEnabled = tiposHabilitados.has(config.tipo)
              const corClasse = CORES_MAP[config.cor as keyof typeof CORES_MAP]

              return (
                <motion.button
                  key={config.tipo}
                  onClick={() => handleTipoToggle(config.tipo)}
                  disabled={disabled || !isEnabled}
                  whileHover={{ scale: disabled || !isEnabled ? 1 : 1.02 }}
                  whileTap={{ scale: disabled || !isEnabled ? 1 : 0.98 }}
                  className={cn(
                    'group relative rounded-lg border-2 p-3 text-left transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isEnabled
                        ? 'border-gray-200 bg-white hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50',
                    (disabled || !isEnabled) && 'cursor-not-allowed opacity-75',
                    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
                  )}
                >
                  {/* Badge "Em Breve" para tipos desabilitados */}
                  {!isEnabled && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-gray-200 text-xs text-gray-600"
                      >
                        Em Breve
                      </Badge>
                    </div>
                  )}

                  {/* Checkbox visual para tipos habilitados */}
                  {isEnabled && (
                    <div className="absolute top-2 right-2">
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border-2',
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 group-hover:border-gray-400',
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 pr-8">
                    <div
                      className={cn(
                        'rounded-md p-2',
                        isEnabled ? corClasse : 'bg-gray-200 text-gray-500',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          'mb-1 text-sm font-medium',
                          isEnabled ? 'text-gray-900' : 'text-gray-500',
                        )}
                      >
                        {config.label}
                      </h3>
                      <p
                        className={cn(
                          'text-xs leading-relaxed',
                          isEnabled ? 'text-gray-600' : 'text-gray-400',
                        )}
                      >
                        {config.descricao}
                      </p>

                      {/* Limite legal apenas para tipos habilitados */}
                      {config.limiteLegal && isEnabled && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Limite: {config.limiteLegal}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Informações da seleção */}
          <AnimatePresence>
            {(tiposSelecionados.length > 0 || mostrarDetalhes) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Separator />

                {tiposSelecionados.length > 0 && (
                  <div className="space-y-3 rounded-lg bg-blue-50 p-4">
                    <h4 className="flex items-center gap-2 font-medium text-blue-900">
                      <Info className="h-4 w-4" />
                      Impacto da Seleção Atual
                    </h4>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      {/* Blocos obrigatórios */}
                      {infoSelecao.blocosObrigatorios.size > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Blocos obrigatórios:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Array.from(infoSelecao.blocosObrigatorios).map(
                              (bloco: string) => (
                                <Badge
                                  key={String(bloco)}
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {bloco.charAt(0).toUpperCase() +
                                    bloco.slice(1)}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Blocos opcionais */}
                      {infoSelecao.blocosOpcionais.size > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Blocos opcionais:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Array.from(infoSelecao.blocosOpcionais).map(
                              (bloco: string) => (
                                <Badge
                                  key={String(bloco)}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {bloco.charAt(0).toUpperCase() +
                                    bloco.slice(1)}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Limite legal */}
                      {infoSelecao.limiteLegal > 0 && (
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="font-medium text-gray-700">
                              Limite legal aplicável:
                            </span>
                            <Badge
                              variant="outline"
                              className="border-amber-300 text-amber-700"
                            >
                              {infoSelecao.limiteLegal}%
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-amber-700">
                            Alterações quantitativas estão sujeitas a limites
                            legais. O sistema alertará se o limite for excedido.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detalhes expandidos */}
                {mostrarDetalhes && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Exemplos de cada tipo:
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {tiposOrdenados
                        .filter(
                          (config: TipoAlteracaoConfig) =>
                            tiposSelecionados.length === 0 ||
                            tiposSelecionados.includes(config.tipo),
                        )
                        .map((config: TipoAlteracaoConfig) => (
                          <div
                            key={config.tipo}
                            className="rounded-md bg-gray-50 p-3"
                          >
                            <span className="font-medium text-gray-700">
                              {config.label}:
                            </span>
                            <ul className="mt-1 ml-2 list-inside list-disc text-gray-600">
                              {config.exemplos.map((exemplo: string) => (
                                <li key={exemplo} className="text-xs">
                                  {exemplo}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
