import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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
  Info
} from 'lucide-react'

import { 
  TipoAlteracao, 
  TIPOS_ALTERACAO_CONFIG,
  getBlocosObrigatorios,
  getBlocosOpcionais,
  getLimiteLegal,
  type TipoAlteracaoConfig,
  type TipoAlteracaoValido
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
  Clock
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
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200'
}

export function TipoAlteracaoSelector({
  tiposSelecionados = [],
  onChange,
  disabled = false,
  error
}: TipoAlteracaoSelectorProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)

  const handleTipoToggle = useCallback((tipo: TipoAlteracao) => {
    if (disabled) return
    
    const novosTipos = tiposSelecionados.includes(tipo)
      ? tiposSelecionados.filter(t => t !== tipo)
      : [...tiposSelecionados, tipo]
    
    onChange(novosTipos)
  }, [tiposSelecionados, onChange, disabled])

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
        temAlertaLegal: false
      }
    }

    const blocosObrigatorios = getBlocosObrigatorios(tiposSelecionados as TipoAlteracao[])
    const blocosOpcionais = getBlocosOpcionais(tiposSelecionados as TipoAlteracao[])
    const limiteLegal = getLimiteLegal(tiposSelecionados as TipoAlteracao[])
    const temAlertaLegal = tiposSelecionados.some(tipo => {
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
      temAlertaLegal
    }
  }, [tiposSelecionados])

  // Ordenar tipos alfabeticamente por label
  const tiposOrdenados = useMemo(() => {
    return Object.values(TIPOS_ALTERACAO_CONFIG).sort((a, b) => 
      a.label.localeCompare(b.label, 'pt-BR')
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
                  {tiposSelecionados.length} selecionado{tiposSelecionados.length !== 1 ? 's' : ''}
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
                <Info className="h-4 w-4 mr-1" />
                {mostrarDetalhes ? 'Ocultar' : 'Ver'} detalhes
              </Button>
            </div>
          </CardTitle>
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Lista de tipos ordenada */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tiposOrdenados.map((config: TipoAlteracaoConfig) => {
              const Icon = ICONES_MAP[config.icone as keyof typeof ICONES_MAP] || FileText
              const isSelected = tiposSelecionados.includes(config.tipo)
              const corClasse = CORES_MAP[config.cor as keyof typeof CORES_MAP] || CORES_MAP.gray
              
              return (
                <motion.button
                  key={config.tipo}
                  onClick={() => handleTipoToggle(config.tipo)}
                  disabled={disabled}
                  whileHover={{ scale: disabled ? 1 : 1.02 }}
                  whileTap={{ scale: disabled ? 1 : 0.98 }}
                  className={cn(
                    'relative p-3 rounded-lg border-2 text-left transition-all group',
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                    disabled && 'opacity-50 cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  {/* Checkbox visual */}
                  <div className="absolute top-2 right-2">
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center',
                      isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 group-hover:border-gray-400'
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pr-8">
                    <div className={cn('p-2 rounded-md', corClasse)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 mb-1">
                        {config.label}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {config.descricao}
                      </p>
                      
                      {/* Limite legal */}
                      {config.limiteLegal && (
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs"
                        >
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
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-blue-900 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Impacto da Seleção Atual
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Blocos obrigatórios */}
                      {infoSelecao.blocosObrigatorios.size > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Blocos obrigatórios:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from(infoSelecao.blocosObrigatorios).map((bloco: string) => (
                              <Badge key={String(bloco)} variant="destructive" className="text-xs">
                                {bloco.charAt(0).toUpperCase() + bloco.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Blocos opcionais */}
                      {infoSelecao.blocosOpcionais.size > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Blocos opcionais:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from(infoSelecao.blocosOpcionais).map((bloco: string) => (
                              <Badge key={String(bloco)} variant="secondary" className="text-xs">
                                {bloco.charAt(0).toUpperCase() + bloco.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Limite legal */}
                      {infoSelecao.limiteLegal > 0 && (
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="font-medium text-gray-700">Limite legal aplicável:</span>
                            <Badge variant="outline" className="text-amber-700 border-amber-300">
                              {infoSelecao.limiteLegal}%
                            </Badge>
                          </div>
                          <p className="text-xs text-amber-700 mt-1">
                            Alterações quantitativas estão sujeitas a limites legais. 
                            O sistema alertará se o limite for excedido.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detalhes expandidos */}
                {mostrarDetalhes && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Exemplos de cada tipo:</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {tiposOrdenados
                        .filter((config: TipoAlteracaoConfig) => tiposSelecionados.length === 0 || tiposSelecionados.includes(config.tipo))
                        .map((config: TipoAlteracaoConfig) => (
                          <div key={config.tipo} className="p-3 bg-gray-50 rounded-md">
                            <span className="font-medium text-gray-700">{config.label}:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1 ml-2">
                              {config.exemplos.map((exemplo: string, index: number) => (
                                <li key={index} className="text-xs">{exemplo}</li>
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