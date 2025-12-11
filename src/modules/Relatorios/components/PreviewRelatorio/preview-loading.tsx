import { motion } from 'framer-motion'
import { Loader2, FileText, BarChart3, FileCheck } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

interface PreviewLoadingProps {
  progresso?: number
  mensagem?: string
  etapa?: string
}

/**
 * Componente de loading para geração de relatório
 * Exibe progresso e mensagens de status
 */
export const PreviewLoading = ({
  progresso = 0,
  mensagem = 'Gerando relatório...',
  etapa = 'Processando',
}: PreviewLoadingProps) => {
  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="mx-auto max-w-md space-y-8">
          {/* Animação de ícones */}
          <div className="relative flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
                <FileText className="h-10 w-10" />
              </div>
            </motion.div>

            {/* Ícones orbitais */}
            <motion.div
              className="absolute top-0 left-1/2"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: '0 40px' }}
            >
              <div className="bg-blue-500/10 text-blue-500 flex h-8 w-8 items-center justify-center rounded-full">
                <BarChart3 className="h-4 w-4" />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-0 left-1/2"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                delay: 2,
              }}
              style={{ transformOrigin: '0 40px' }}
            >
              <div className="bg-green-500/10 text-green-500 flex h-8 w-8 items-center justify-center rounded-full">
                <FileCheck className="h-4 w-4" />
              </div>
            </motion.div>
          </div>

          {/* Texto de status */}
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">{mensagem}</h3>
            <p className="text-muted-foreground text-sm">{etapa}</p>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <Progress value={progresso} className="h-2" />
            <p className="text-muted-foreground text-center text-xs">
              {progresso}% concluído
            </p>
          </div>

          {/* Dicas */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              {progresso < 30 && 'Buscando dados dos contratos selecionados...'}
              {progresso >= 30 && progresso < 60 && 'Calculando indicadores e métricas...'}
              {progresso >= 60 && progresso < 90 && 'Gerando gráficos e visualizações...'}
              {progresso >= 90 && 'Finalizando documento PDF...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading simples inline
 */
export const LoadingInline = ({ mensagem = 'Carregando...' }: { mensagem?: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-muted-foreground text-sm">{mensagem}</span>
    </div>
  )
}
