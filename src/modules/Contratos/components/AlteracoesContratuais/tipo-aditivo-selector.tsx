import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Calendar,
  FileText,
  TrendingUp,
  Package,
  Calculator,
  Scale,
  CheckCircle,
} from 'lucide-react'
import type { TipoAditivo } from '@/modules/Contratos/types/alteracoes-contratuais'
import { TIPOS_ADITIVO_CONFIG } from '@/modules/Contratos/types/alteracoes-contratuais'

interface TipoAditivoSelectorProps {
  valor?: TipoAditivo
  onChange: (tipo: TipoAditivo) => void
  className?: string
}

const iconMap = {
  Calendar,
  FileText,
  TrendingUp,
  Package,
  Calculator,
  Scale,
}

export function TipoAditivoSelector({ valor, onChange, className }: TipoAditivoSelectorProps) {
  const handleSelect = (tipo: TipoAditivo) => {
    onChange(tipo)
  }

  const getIconComponent = (iconeName: string) => {
    const Icon = iconMap[iconeName as keyof typeof iconMap] || FileText
    return Icon
  }

  const getColorClasses = (cor: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        card: isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-blue-100' 
          : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/50',
        icon: isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-blue-100 text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      },
      green: {
        card: isSelected 
          ? 'border-green-500 bg-green-50 shadow-green-100' 
          : 'border-green-200 hover:border-green-300 hover:bg-green-50/50',
        icon: isSelected 
          ? 'bg-green-500 text-white' 
          : 'bg-green-100 text-green-600',
        badge: 'bg-green-100 text-green-800'
      },
      orange: {
        card: isSelected 
          ? 'border-orange-500 bg-orange-50 shadow-orange-100' 
          : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50/50',
        icon: isSelected 
          ? 'bg-orange-500 text-white' 
          : 'bg-orange-100 text-orange-600',
        badge: 'bg-orange-100 text-orange-800'
      },
      purple: {
        card: isSelected 
          ? 'border-purple-500 bg-purple-50 shadow-purple-100' 
          : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/50',
        icon: isSelected 
          ? 'bg-purple-500 text-white' 
          : 'bg-purple-100 text-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      },
      yellow: {
        card: isSelected 
          ? 'border-yellow-500 bg-yellow-50 shadow-yellow-100' 
          : 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50/50',
        icon: isSelected 
          ? 'bg-yellow-500 text-white' 
          : 'bg-yellow-100 text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800'
      },
      red: {
        card: isSelected 
          ? 'border-red-500 bg-red-50 shadow-red-100' 
          : 'border-red-200 hover:border-red-300 hover:bg-red-50/50',
        icon: isSelected 
          ? 'bg-red-500 text-white' 
          : 'bg-red-100 text-red-600',
        badge: 'bg-red-100 text-red-800'
      }
    }

    return colorMap[cor as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Selecione o Tipo de Aditivo</h3>
        <p className="text-muted-foreground text-sm">
          Escolha o tipo de alteração que será aplicada ao contrato
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(TIPOS_ADITIVO_CONFIG).map((config, index) => {
          const isSelected = valor === config.tipo
          const Icon = getIconComponent(config.icone)
          const colors = getColorClasses(config.cor, isSelected)

          return (
            <motion.div
              key={config.tipo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-lg',
                  colors.card
                )}
                onClick={() => handleSelect(config.tipo)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header com ícone e seleção */}
                    <div className="flex items-start justify-between">
                      <div 
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
                          colors.icon
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>

                    {/* Título e badge */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{config.label}</h4>
                      </div>
                      <Badge className={cn('text-xs', colors.badge)}>
                        {config.tipo.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {/* Descrição */}
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {config.descricao}
                    </p>

                    {/* Exemplos (aparecem apenas quando selecionado) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 border-t pt-3"
                      >
                        <p className="text-xs font-medium">Exemplos:</p>
                        <ul className="space-y-1">
                          {config.exemplos.map((exemplo, i) => (
                            <li key={i} className="text-muted-foreground flex items-start gap-1 text-xs">
                              <span className="text-muted-foreground/50">•</span>
                              <span>{exemplo}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Resumo da seleção */}
      {valor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              getColorClasses(TIPOS_ADITIVO_CONFIG[valor].cor, true).icon
            )}>
              {(() => {
                const Icon = getIconComponent(TIPOS_ADITIVO_CONFIG[valor].icone)
                return <Icon className="h-4 w-4" />
              })()}
            </div>
            <div>
              <p className="text-sm font-medium">
                Selecionado: {TIPOS_ADITIVO_CONFIG[valor].label}
              </p>
              <p className="text-muted-foreground text-xs">
                {TIPOS_ADITIVO_CONFIG[valor].descricao}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}