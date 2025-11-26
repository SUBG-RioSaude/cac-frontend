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
import { useTheme } from 'next-themes'
import { useState, useCallback, useMemo, useEffect } from 'react'

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

// Função para obter cores adaptadas ao dark mode
const getCoresMap = (isDarkMode: boolean) => ({
  blue: isDarkMode
    ? 'bg-blue-950/30 text-blue-400 border-blue-800/50'
    : 'bg-blue-100 text-blue-700 border-blue-200',
  green: isDarkMode
    ? 'bg-green-950/30 text-green-400 border-green-800/50'
    : 'bg-green-100 text-green-700 border-green-200',
  purple: isDarkMode
    ? 'bg-purple-950/30 text-purple-400 border-purple-800/50'
    : 'bg-purple-100 text-purple-700 border-purple-200',
  gray: isDarkMode
    ? 'bg-gray-800/30 text-gray-400 border-gray-700/50'
    : 'bg-gray-100 text-gray-700 border-gray-200',
  yellow: isDarkMode
    ? 'bg-yellow-950/30 text-yellow-400 border-yellow-800/50'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200',
  orange: isDarkMode
    ? 'bg-orange-950/30 text-orange-400 border-orange-800/50'
    : 'bg-orange-100 text-orange-700 border-orange-200',
  red: isDarkMode
    ? 'bg-red-950/30 text-red-400 border-red-800/50'
    : 'bg-red-100 text-red-700 border-red-200',
  indigo: isDarkMode
    ? 'bg-indigo-950/30 text-indigo-400 border-indigo-800/50'
    : 'bg-indigo-100 text-indigo-700 border-indigo-200',
})

export const TipoAlteracaoSelector = ({
  tiposSelecionados = [],
  onChange,
  disabled = false,
  error,
}: TipoAlteracaoSelectorProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)

  // Espera o componente montar para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determina se está em dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark')

  // Obtém as cores baseadas no tema
  const CORES_MAP = getCoresMap(isDarkMode)

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
            <div
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                isDarkMode
                  ? 'bg-red-950/30 text-red-400 dark:bg-red-950/30 dark:text-red-400'
                  : 'bg-red-50 text-red-600',
              )}
            >
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
                      ? isDarkMode
                        ? 'border-blue-500 bg-blue-950/20 dark:bg-blue-950/20'
                        : 'border-blue-500 bg-blue-50'
                      : isEnabled
                        ? isDarkMode
                          ? 'border-gray-700 dark:border-gray-700'
                          : 'border-gray-200'
                        : isDarkMode
                          ? 'border-gray-700 dark:border-gray-700'
                          : 'border-gray-200',
                    (disabled || !isEnabled) && 'cursor-not-allowed opacity-75',
                    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
                  )}
                >
                  {/* Badge "Em Breve" para tipos desabilitados */}
                  {!isEnabled && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          isDarkMode
                            ? 'bg-gray-800 text-gray-400 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-gray-200 text-gray-600',
                        )}
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
                            ? 'border-blue-500 bg-blue-500 dark:border-blue-500 dark:bg-blue-500'
                            : isDarkMode
                              ? 'border-gray-600 group-hover:border-gray-500 dark:border-gray-600 dark:group-hover:border-gray-500'
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
                        isEnabled
                          ? corClasse
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                            : 'bg-gray-200 text-gray-500',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          'mb-1 text-sm font-medium',
                          isEnabled
                            ? isDarkMode
                              ? 'text-gray-100 dark:text-gray-100'
                              : 'text-gray-900'
                            : isDarkMode
                              ? 'text-gray-500 dark:text-gray-500'
                              : 'text-gray-500',
                        )}
                      >
                        {config.label}
                      </h3>
                      <p
                        className={cn(
                          'text-xs leading-relaxed',
                          isEnabled
                            ? isDarkMode
                              ? 'text-gray-400 dark:text-gray-400'
                              : 'text-gray-600'
                            : isDarkMode
                              ? 'text-gray-600 dark:text-gray-600'
                              : 'text-gray-400',
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
                  <div
                    className={cn(
                      'space-y-3 rounded-lg p-4',
                      isDarkMode
                        ? 'bg-blue-950/20 dark:bg-blue-950/20'
                        : 'bg-blue-50',
                    )}
                  >
                    <h4
                      className={cn(
                        'flex items-center gap-2 font-medium',
                        isDarkMode
                          ? 'text-blue-300 dark:text-blue-300'
                          : 'text-blue-900',
                      )}
                    >
                      <Info className="h-4 w-4" />
                      Impacto da Seleção Atual
                    </h4>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      {/* Blocos obrigatórios */}
                      {infoSelecao.blocosObrigatorios.size > 0 && (
                        <div>
                          <span
                            className={cn(
                              'font-medium',
                              isDarkMode
                                ? 'text-gray-300 dark:text-gray-300'
                                : 'text-gray-700',
                            )}
                          >
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
                          <span
                            className={cn(
                              'font-medium',
                              isDarkMode
                                ? 'text-gray-300 dark:text-gray-300'
                                : 'text-gray-700',
                            )}
                          >
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
                            <AlertTriangle
                              className={cn(
                                'h-4 w-4',
                                isDarkMode
                                  ? 'text-amber-400 dark:text-amber-400'
                                  : 'text-amber-500',
                              )}
                            />
                            <span
                              className={cn(
                                'font-medium',
                                isDarkMode
                                  ? 'text-gray-300 dark:text-gray-300'
                                  : 'text-gray-700',
                              )}
                            >
                              Limite legal aplicável:
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                isDarkMode
                                  ? 'border-amber-600 text-amber-400 dark:border-amber-600 dark:text-amber-400'
                                  : 'border-amber-300 text-amber-700',
                              )}
                            >
                              {infoSelecao.limiteLegal}%
                            </Badge>
                          </div>
                          <p
                            className={cn(
                              'mt-1 text-xs',
                              isDarkMode
                                ? 'text-amber-400 dark:text-amber-400'
                                : 'text-amber-700',
                            )}
                          >
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
                    <h4
                      className={cn(
                        'font-medium',
                        isDarkMode
                          ? 'text-gray-300 dark:text-gray-300'
                          : 'text-gray-700',
                      )}
                    >
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
                            className={cn(
                              'rounded-md p-3',
                              isDarkMode
                                ? 'bg-gray-800/50 dark:bg-gray-800/50'
                                : 'bg-gray-50',
                            )}
                          >
                            <span
                              className={cn(
                                'font-medium',
                                isDarkMode
                                  ? 'text-gray-300 dark:text-gray-300'
                                  : 'text-gray-700',
                              )}
                            >
                              {config.label}:
                            </span>
                            <ul
                              className={cn(
                                'mt-1 ml-2 list-inside list-disc',
                                isDarkMode
                                  ? 'text-gray-400 dark:text-gray-400'
                                  : 'text-gray-600',
                              )}
                            >
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
