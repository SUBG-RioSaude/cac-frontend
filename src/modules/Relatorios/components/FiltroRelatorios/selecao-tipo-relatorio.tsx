import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TipoRelatorio } from '../../types/relatorio'
import { CONFIGURACAO_TIPOS_RELATORIO } from '../../config/relatorios-config'

interface SelecaoTipoRelatorioProps {
  tipoSelecionado?: TipoRelatorio
  onSelecionarTipo: (tipo: TipoRelatorio) => void
  desabilitado?: boolean
}

/**
 * Componente de seleção de tipo de relatório
 * Exibe cards visuais para cada tipo disponível
 */
export const SelecaoTipoRelatorio = ({
  tipoSelecionado,
  onSelecionarTipo,
  desabilitado = false,
}: SelecaoTipoRelatorioProps) => {
  const tiposDisponiveis = Object.values(CONFIGURACAO_TIPOS_RELATORIO).filter(
    (config) => config.habilitado,
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Selecione o Tipo de Relatório</h3>
        <p className="text-muted-foreground text-sm">
          Escolha o formato de relatório que deseja gerar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiposDisponiveis.map((config, index) => {
          const IconeComponente = config.icone
          const selecionado = tipoSelecionado === config.tipo

          return (
            <motion.div
              key={config.tipo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'relative cursor-pointer transition-all hover:shadow-md',
                  selecionado && 'ring-2 ring-offset-2',
                  desabilitado && 'cursor-not-allowed opacity-50',
                )}
                style={{
                  borderColor: selecionado ? config.corHex : undefined,
                  ringColor: selecionado ? config.corHex : undefined,
                }}
                onClick={() => {
                  if (!desabilitado) {
                    onSelecionarTipo(config.tipo)
                  }
                }}
                role="button"
                tabIndex={desabilitado ? -1 : 0}
                onKeyDown={(e) => {
                  if (!desabilitado && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onSelecionarTipo(config.tipo)
                  }
                }}
                aria-label={`Selecionar ${config.nome}`}
                aria-pressed={selecionado}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${config.corHex}15`,
                        color: config.corHex,
                      }}
                    >
                      <IconeComponente className="h-6 w-6" />
                    </div>
                    {selecionado && (
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: config.corHex }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-base">{config.nome}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {config.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {config.temGraficos && (
                      <Badge variant="secondary" className="text-xs">
                        Com gráficos
                      </Badge>
                    )}
                    {config.temPersonalizacao && (
                      <Badge variant="secondary" className="text-xs">
                        Personalizável
                      </Badge>
                    )}
                    {config.maxContratos <= 10 && (
                      <Badge variant="outline" className="text-xs">
                        Até {config.maxContratos} contratos
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
