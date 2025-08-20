import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  BookOpen,
  MessageSquare,
} from 'lucide-react'

interface DetalhamentoFormProps {
  justificativa: string
  manifestacaoTecnica: string
  onJustificativaChange: (valor: string) => void
  onManifestacaoTecnicaChange: (valor: string) => void
  errors?: {
    justificativa?: string
    manifestacaoTecnica?: string
  }
  className?: string
}

export function DetalhamentoForm({
  justificativa,
  manifestacaoTecnica,
  onJustificativaChange,
  onManifestacaoTecnicaChange,
  errors = {},
  className
}: DetalhamentoFormProps) {
  const getTextareaStatus = (value: string, error?: string) => {
    if (error) return 'error'
    if (value && value.length >= 50) return 'completed'
    if (value && value.length > 0) return 'progress'
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'progress':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          card: 'border-green-200 bg-green-50/30',
          badge: 'bg-green-100 text-green-800'
        }
      case 'error':
        return {
          card: 'border-red-200 bg-red-50/30',
          badge: 'bg-red-100 text-red-800'
        }
      case 'progress':
        return {
          card: 'border-blue-200 bg-blue-50/30',
          badge: 'bg-blue-100 text-blue-800'
        }
      default:
        return {
          card: 'border-gray-200 bg-gray-50/30',
          badge: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const getCharacterCount = (text: string, minLength: number) => {
    const current = text.length
    const percentage = Math.min((current / minLength) * 100, 100)
    return { current, percentage }
  }

  const justificativaStatus = getTextareaStatus(justificativa, errors.justificativa)
  const manifestacaoStatus = getTextareaStatus(manifestacaoTecnica, errors.manifestacaoTecnica)
  const justificativaColors = getStatusColors(justificativaStatus)
  const manifestacaoColors = getStatusColors(manifestacaoStatus)

  const justificativaCount = getCharacterCount(justificativa, 100)
  const manifestacaoCount = getCharacterCount(manifestacaoTecnica, 100)

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Detalhamento da Alteração</h3>
        <p className="text-muted-foreground text-sm">
          Forneça informações detalhadas sobre a justificativa e análise técnica
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Justificativa */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn('transition-all duration-200', justificativaColors.card)}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-5 w-5" />
                    Justificativa
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Descreva os motivos que levaram à necessidade desta alteração contratual
                  </p>
                </div>
                {getStatusIcon(justificativaStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="justificativa" className="text-sm font-medium">
                  Justificativa *
                </Label>
                <Textarea
                  id="justificativa"
                  placeholder="Descreva detalhadamente os motivos que justificam esta alteração contratual..."
                  value={justificativa}
                  onChange={(e) => onJustificativaChange(e.target.value)}
                  className={cn(
                    'min-h-[120px] resize-none text-sm',
                    errors.justificativa && 'border-red-300 focus:border-red-500'
                  )}
                  maxLength={2000}
                />
                {errors.justificativa && (
                  <p className="text-xs text-red-600">{errors.justificativa}</p>
                )}
              </div>

              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progresso do detalhamento
                  </span>
                  <span className={cn(
                    'font-medium',
                    justificativaCount.percentage >= 100 ? 'text-green-600' : 'text-gray-600'
                  )}>
                    {justificativaCount.current}/2000 caracteres
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className={cn(
                      'h-full transition-all duration-300',
                      justificativaCount.percentage >= 100 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    )}
                    style={{ width: `${Math.min(justificativaCount.percentage, 100)}%` }}
                  />
                </div>
                <Badge className={cn('text-xs', justificativaColors.badge)}>
                  {justificativaStatus === 'completed' && 'Detalhamento adequado'}
                  {justificativaStatus === 'progress' && 'Em progresso'}
                  {justificativaStatus === 'pending' && 'Aguardando preenchimento'}
                  {justificativaStatus === 'error' && 'Requer atenção'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Manifestação Técnica */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={cn('transition-all duration-200', manifestacaoColors.card)}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    Manifestação Técnica
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Análise técnica e parecer sobre a viabilidade da alteração
                  </p>
                </div>
                {getStatusIcon(manifestacaoStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manifestacaoTecnica" className="text-sm font-medium">
                  Manifestação Técnica *
                </Label>
                <Textarea
                  id="manifestacaoTecnica"
                  placeholder="Forneça o parecer técnico sobre a alteração, incluindo análise de impactos e viabilidade..."
                  value={manifestacaoTecnica}
                  onChange={(e) => onManifestacaoTecnicaChange(e.target.value)}
                  className={cn(
                    'min-h-[120px] resize-none text-sm',
                    errors.manifestacaoTecnica && 'border-red-300 focus:border-red-500'
                  )}
                  maxLength={2000}
                />
                {errors.manifestacaoTecnica && (
                  <p className="text-xs text-red-600">{errors.manifestacaoTecnica}</p>
                )}
              </div>

              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progresso da análise
                  </span>
                  <span className={cn(
                    'font-medium',
                    manifestacaoCount.percentage >= 100 ? 'text-green-600' : 'text-gray-600'
                  )}>
                    {manifestacaoCount.current}/2000 caracteres
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className={cn(
                      'h-full transition-all duration-300',
                      manifestacaoCount.percentage >= 100 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    )}
                    style={{ width: `${Math.min(manifestacaoCount.percentage, 100)}%` }}
                  />
                </div>
                <Badge className={cn('text-xs', manifestacaoColors.badge)}>
                  {manifestacaoStatus === 'completed' && 'Análise completa'}
                  {manifestacaoStatus === 'progress' && 'Em análise'}
                  {manifestacaoStatus === 'pending' && 'Aguardando manifestação'}
                  {manifestacaoStatus === 'error' && 'Requer revisão'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Resumo do detalhamento */}
      {(justificativa || manifestacaoTecnica) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <h4 className="mb-3 text-sm font-medium">Status do Detalhamento</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Justificativa</span>
                {getStatusIcon(justificativaStatus)}
              </div>
              <p className="text-muted-foreground text-xs">
                {justificativa.length > 0 
                  ? `${justificativa.length} caracteres preenchidos`
                  : 'Aguardando preenchimento'
                }
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Manifestação Técnica</span>
                {getStatusIcon(manifestacaoStatus)}
              </div>
              <p className="text-muted-foreground text-xs">
                {manifestacaoTecnica.length > 0 
                  ? `${manifestacaoTecnica.length} caracteres preenchidos`
                  : 'Aguardando manifestação'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}