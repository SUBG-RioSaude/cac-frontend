import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Hash,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Clock,
  FileText,
  Users,
  Shield
} from 'lucide-react'
import type { Responsavel, ContratoFuncionario } from '@/modules/Contratos/types/contrato'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'
import { DateDisplay } from '@/components/ui/formatters'

interface FuncionarioCardProps {
  responsavel?: Responsavel // dados básicos do contrato (legado)
  contratoFuncionario?: ContratoFuncionario // dados da nova API
  funcionario?: FuncionarioApi // dados completos da API (opcional)
  isLoading?: boolean
  variant: 'fiscal' | 'gestor'
  onSubstituir?: () => void // Callback para abrir modal de substituição
  onRemover?: () => void // Callback para remover funcionário
  permitirSubstituicao?: boolean // Se deve mostrar botão de substituir
  permitirRemocao?: boolean // Se deve mostrar botão de remover
}

export function FuncionarioCard({
  responsavel,
  contratoFuncionario,
  funcionario,
  isLoading = false,
  variant,
  onSubstituir,
  onRemover,
  permitirSubstituicao = true,
  permitirRemocao = true
}: FuncionarioCardProps) {
  const variantConfig = {
    fiscal: {
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    gestor: {
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      badgeColor: 'bg-green-50 text-green-700 border-green-200'
    }
  }

  const config = variantConfig[variant]


  // Determinar situação funcional
  const getSituacaoFuncional = () => {
    if (!funcionario) return null

    const isFuncionarioAtivo = funcionario.ativo && funcionario.situacao === 1

    return {
      ativo: isFuncionarioAtivo,
      label: isFuncionarioAtivo ? 'Ativo' : 'Inativo',
      icon: isFuncionarioAtivo ? CheckCircle : XCircle,
      color: isFuncionarioAtivo ? 'text-green-600' : 'text-red-600'
    }
  }

  const situacao = getSituacaoFuncional()

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Usar dados da API de contratos primeiro (mais ricos), depois funcionário geral, depois legado
  const nomeCompleto = contratoFuncionario?.funcionarioNome || funcionario?.nomeCompleto || responsavel?.nome || 'Nome não informado'
  const cargo = contratoFuncionario?.funcionarioCargo || funcionario?.cargo || responsavel?.cargo || 'Cargo não informado'
  const email = contratoFuncionario?.email || funcionario?.emailInstitucional || responsavel?.email || ''
  const telefone = contratoFuncionario?.telefone || funcionario?.telefone || responsavel?.telefone || ''
  const matricula = contratoFuncionario?.funcionarioMatricula || funcionario?.matricula

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
          <User className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1">
          {/* Header com nome, cargo e tipo de gerência */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{nomeCompleto}</h4>
                {contratoFuncionario && (
                  <Badge className={config.badgeColor}>
                    <Shield className="mr-1 h-3 w-3" />
                    {contratoFuncionario.tipoGerenciaDescricao}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm font-medium">{cargo}</p>
              {funcionario?.funcao && funcionario.funcao !== cargo && (
                <p className="text-muted-foreground text-xs">({funcionario.funcao})</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status de situação funcional */}
              {situacao && (
                <div className="flex items-center gap-1">
                  <situacao.icon className={`h-4 w-4 ${situacao.color}`} />
                  <span className={`text-xs ${situacao.color}`}>{situacao.label}</span>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex items-center gap-1">
                {/* Botão de substituir */}
                {permitirSubstituicao && onSubstituir && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSubstituir}
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                    title={`Substituir ${variant}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}

                {/* Botão de remover */}
                {permitirRemocao && onRemover && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemover}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    title={`Remover ${variant}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Informações de identificação */}
          <div className="mt-3 flex flex-wrap gap-2">
            {matricula && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                <Hash className="mr-1 h-3 w-3" />
                Mat: {matricula}
              </Badge>
            )}
            {funcionario?.lotacaoSigla && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Building className="mr-1 h-3 w-3" />
                {funcionario.lotacaoSigla}
              </Badge>
            )}
            {contratoFuncionario?.documentoDesignacao && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <FileText className="mr-1 h-3 w-3" />
                Doc: {contratoFuncionario.documentoDesignacao}
              </Badge>
            )}
          </div>

          {/* Informações de contato */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{email}</span>
            </div>

            {telefone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{telefone}</span>
              </div>
            )}
          </div>

          {/* Informações de lotação completa */}
          {funcionario?.lotacaoNome && (
            <div className="mt-2">
              <div className="flex items-start gap-2 text-sm">
                <Building className="mt-0.5 h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground text-xs leading-tight">
                  {funcionario.lotacaoNome}
                </span>
              </div>
            </div>
          )}

          {/* Informações de designação e período - MELHORADO */}
          {contratoFuncionario && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${
              contratoFuncionario.estaAtivo
                ? 'bg-green-50 border-l-green-500'
                : 'bg-red-50 border-l-red-500'
            }`}>
              <div className="space-y-3">
                {/* Header da designação */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-800">Designação no Contrato</span>
                  </div>
                  {contratoFuncionario.estaAtivo ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Inativo
                    </Badge>
                  )}
                </div>

                {/* Grid com informações detalhadas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Período da função */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Período:</span>
                      <p className="text-gray-900">{contratoFuncionario.periodoFormatado}</p>
                    </div>
                  </div>

                  {/* Dias na função */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Tempo na função:</span>
                      <p className="text-gray-900">
                        {contratoFuncionario.diasNaFuncao} {contratoFuncionario.diasNaFuncao === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Motivo da alteração */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Motivo:</span>
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                    {contratoFuncionario.motivoAlteracaoDescricao}
                  </Badge>
                </div>

                {/* Observações se houver */}
                {contratoFuncionario.observacoes && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Observações:</span>
                      <span className="ml-2 text-gray-600">{contratoFuncionario.observacoes}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datas importantes (fallback para dados legados) */}
          {!contratoFuncionario && (
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              {funcionario?.dataAdmissao && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Admitido em <DateDisplay value={funcionario.dataAdmissao} /></span>
                </div>
              )}

              {responsavel?.dataDesignacao && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Designado em <DateDisplay value={responsavel.dataDesignacao} /></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}