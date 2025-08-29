import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { currencyUtils } from '@/lib/utils'
import {
  Eye,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react'
import type { AlteracaoContratualForm, TipoAditivo } from '@/modules/Contratos/types/alteracoes-contratuais'
import { TIPOS_ADITIVO_CONFIG } from '@/modules/Contratos/types/alteracoes-contratuais'

interface PreviewCardProps {
  dados: Partial<AlteracaoContratualForm>
  valorOriginal?: number
  numeroContrato?: string
  onSalvarRascunho?: () => void
  onSubmeter?: () => void
  isLoading?: boolean
  className?: string
}

export function PreviewCard({
  dados,
  valorOriginal = 0,
  numeroContrato,
  onSalvarRascunho,
  onSubmeter,
  isLoading = false,
  className
}: PreviewCardProps) {
  const formatarData = (data?: string) => {
    if (!data) return '-'
    try {
      return new Date(data).toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  const calcularImpactoFinanceiro = () => {
    if (!dados.valorAjustado || valorOriginal === 0) return null
    
    const diferenca = dados.valorAjustado - valorOriginal
    const percentual = (diferenca / valorOriginal) * 100
    
    return {
      diferenca,
      percentual,
      tipo: diferenca > 0 ? 'acrescimo' : diferenca < 0 ? 'reducao' : 'inalterado'
    }
  }

  const impacto = calcularImpactoFinanceiro()

  const getStatusPreenchimento = () => {
    const campos = [
      dados.tipoAditivo,
      dados.dataSolicitacao,
      dados.dataAutorizacao,
      dados.justificativa,
      dados.manifestacaoTecnica,
      dados.valorAjustado
    ]
    
    const preenchidos = campos.filter(campo => 
      campo !== undefined && campo !== '' && campo !== 0
    ).length
    
    const total = campos.length
    const percentual = (preenchidos / total) * 100
    
    return {
      preenchidos,
      total,
      percentual,
      completo: percentual === 100
    }
  }

  const status = getStatusPreenchimento()

  const getTipoConfig = () => {
    if (!dados.tipoAditivo) return null
    return TIPOS_ADITIVO_CONFIG[dados.tipoAditivo as TipoAditivo]
  }

  const tipoConfig = getTipoConfig()

  const getImpactoColor = () => {
    if (!impacto) return 'text-gray-600'
    
    switch (impacto.tipo) {
      case 'acrescimo':
        return 'text-green-600'
      case 'reducao':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Resumo da Alteração</h3>
        <p className="text-muted-foreground text-sm">
          Visualize o resumo completo antes de submeter a alteração contratual
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                Preview da Alteração
              </CardTitle>
              {numeroContrato && (
                <p className="text-muted-foreground text-sm">
                  Contrato: {numeroContrato}
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge className={cn(
                'mb-2',
                status.completo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              )}>
                {status.percentual.toFixed(0)}% preenchido
              </Badge>
              <p className="text-muted-foreground text-xs">
                {status.preenchidos} de {status.total} campos
              </p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <motion.div 
                className={cn(
                  'h-full transition-all duration-500',
                  status.completo ? 'bg-green-500' : 'bg-blue-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${status.percentual}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Tipo de Aditivo */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Tipo de Aditivo</p>
                {tipoConfig ? (
                  <div className="space-y-2">
                    <Badge className={`bg-${tipoConfig.cor}-100 text-${tipoConfig.cor}-800`}>
                      {tipoConfig.label}
                    </Badge>
                    <p className="text-muted-foreground text-xs">
                      {tipoConfig.descricao}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Não selecionado</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Cronograma */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Cronograma</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Solicitação</p>
                    <p className="text-sm font-medium">
                      {formatarData(dados.dataSolicitacao)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Autorização</p>
                    <p className="text-sm font-medium">
                      {formatarData(dados.dataAutorizacao)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nova Vigência</p>
                    <p className="text-sm font-medium">
                      {formatarData(dados.novaVigencia)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Impacto Financeiro */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Impacto Financeiro</p>
                {impacto ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Valor Original</p>
                      <p className="text-sm font-semibold">
                        {currencyUtils.formatar(valorOriginal)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Diferença</p>
                      <p className={cn('text-sm font-semibold', getImpactoColor())}>
                        {impacto.diferenca > 0 ? '+' : ''}
                        {currencyUtils.formatar(Math.abs(impacto.diferenca))}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Novo Valor</p>
                      <p className="text-sm font-semibold">
                        {currencyUtils.formatar(dados.valorAjustado || 0)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Aguardando definição do valor
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Documentação */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Documentação</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Justificativa</p>
                    {dados.justificativa ? (
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-sm leading-relaxed">
                          {dados.justificativa.length > 200 
                            ? `${dados.justificativa.substring(0, 200)}...`
                            : dados.justificativa
                          }
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {dados.justificativa.length} caracteres
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Não preenchida</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Manifestação Técnica</p>
                    {dados.manifestacaoTecnica ? (
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-sm leading-relaxed">
                          {dados.manifestacaoTecnica.length > 200 
                            ? `${dados.manifestacaoTecnica.substring(0, 200)}...`
                            : dados.manifestacaoTecnica
                          }
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {dados.manifestacaoTecnica.length} caracteres
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Não preenchida</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status da alteração */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                {status.completo ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {status.completo 
                      ? 'Pronto para submissão' 
                      : 'Preenchimento incompleto'
                    }
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {status.completo 
                      ? 'Todos os campos obrigatórios foram preenchidos'
                      : `Faltam ${status.total - status.preenchidos} campos para completar`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {onSalvarRascunho && (
                <Button
                  variant="outline"
                  onClick={onSalvarRascunho}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Salvar Rascunho
                </Button>
              )}
              
              {onSubmeter && (
                <Button
                  onClick={onSubmeter}
                  disabled={!status.completo || isLoading}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isLoading ? 'Submetendo...' : 'Submeter Alteração'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}