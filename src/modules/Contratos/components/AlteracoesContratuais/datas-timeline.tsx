import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatasTimelineProps {
  dataSolicitacao: string
  dataAutorizacao: string
  novaVigencia: string
  onDataSolicitacaoChange: (data: string) => void
  onDataAutorizacaoChange: (data: string) => void
  onNovaVigenciaChange: (data: string) => void
  errors?: {
    dataSolicitacao?: string
    dataAutorizacao?: string
    novaVigencia?: string
  }
  className?: string
}

export function DatasTimeline({
  dataSolicitacao,
  dataAutorizacao,
  novaVigencia,
  onDataSolicitacaoChange,
  onDataAutorizacaoChange,
  onNovaVigenciaChange,
  errors = {},
  className
}: DatasTimelineProps) {
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    // Se já está no formato YYYY-MM-DD, retorna como está
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }
    // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/')
      return `${year}-${month}-${day}`
    }
    return dateString
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const isDateFilled = (date: string) => {
    return date && date.length > 0
  }

  const isDateValid = (date: string) => {
    if (!date) return false
    try {
      const dateObj = new Date(date)
      return !isNaN(dateObj.getTime())
    } catch {
      return false
    }
  }

  const getStepStatus = (date: string, hasError: boolean) => {
    if (hasError) return 'error'
    if (isDateFilled(date) && isDateValid(date)) return 'completed'
    if (isDateFilled(date)) return 'progress'
    return 'pending'
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-100 border-green-300',
          line: 'bg-green-300',
          card: 'border-green-200 bg-green-50/30'
        }
      case 'error':
        return {
          circle: 'bg-red-100 border-red-300',
          line: 'bg-red-300',
          card: 'border-red-200 bg-red-50/30'
        }
      case 'progress':
        return {
          circle: 'bg-blue-100 border-blue-300',
          line: 'bg-blue-300',
          card: 'border-blue-200 bg-blue-50/30'
        }
      default:
        return {
          circle: 'bg-gray-100 border-gray-300',
          line: 'bg-gray-200',
          card: 'border-gray-200 bg-gray-50/30'
        }
    }
  }

  const steps = [
    {
      id: 'solicitacao',
      title: 'Data de Solicitação',
      description: 'Data em que a alteração contratual foi solicitada',
      value: dataSolicitacao,
      displayValue: formatDateForDisplay(dataSolicitacao),
      onChange: onDataSolicitacaoChange,
      error: errors.dataSolicitacao,
      status: getStepStatus(dataSolicitacao, !!errors.dataSolicitacao)
    },
    {
      id: 'autorizacao',
      title: 'Data de Autorização',
      description: 'Data em que a alteração foi autorizada',
      value: dataAutorizacao,
      displayValue: formatDateForDisplay(dataAutorizacao),
      onChange: onDataAutorizacaoChange,
      error: errors.dataAutorizacao,
      status: getStepStatus(dataAutorizacao, !!errors.dataAutorizacao)
    },
    {
      id: 'vigencia',
      title: 'Nova Vigência',
      description: 'Nova data de término do contrato (se aplicável)',
      value: novaVigencia,
      displayValue: formatDateForDisplay(novaVigencia),
      onChange: onNovaVigenciaChange,
      error: errors.novaVigencia,
      status: getStepStatus(novaVigencia, !!errors.novaVigencia)
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Cronograma de Datas</h3>
        <p className="text-muted-foreground text-sm">
          Defina as datas importantes do processo de alteração contratual
        </p>
      </div>

      {/* Timeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha connecting steps */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />
            
            <div className="space-y-8">
              {steps.map((step, index) => {
                const colors = getStepColors(step.status)
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Step indicator */}
                    <div className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2',
                      colors.circle
                    )}>
                      {getStepIcon(step.status)}
                    </div>

                    {/* Step content */}
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">{step.title}</h4>
                        <p className="text-muted-foreground text-xs">{step.description}</p>
                        {step.displayValue && (
                          <p className="mt-1 text-sm font-medium text-blue-600">
                            {step.displayValue}
                          </p>
                        )}
                      </div>

                      {/* Input card */}
                      <Card className={cn(
                        'transition-colors',
                        colors.card,
                        step.error && 'border-red-300'
                      )}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <Label htmlFor={step.id} className="text-xs font-medium">
                              {step.title} *
                            </Label>
                            <Input
                              id={step.id}
                              type="date"
                              value={formatDateForInput(step.value)}
                              onChange={(e) => step.onChange(e.target.value)}
                              className={cn(
                                'h-9 text-sm',
                                step.error && 'border-red-300 focus:border-red-500'
                              )}
                            />
                            {step.error && (
                              <p className="text-xs text-red-600">{step.error}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das datas */}
      {(dataSolicitacao || dataAutorizacao || novaVigencia) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <h4 className="mb-3 text-sm font-medium">Resumo do Cronograma</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.map((step) => (
              step.displayValue && (
                <div key={step.id} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{step.title}</p>
                  <p className="text-sm font-medium">{step.displayValue}</p>
                </div>
              )
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}