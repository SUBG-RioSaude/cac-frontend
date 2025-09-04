import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Hash,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { Responsavel, ContratoFuncionario } from '@/modules/Contratos/types/contrato'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'

interface FuncionarioCardProps {
  responsavel?: Responsavel // dados básicos do contrato (legado)
  contratoFuncionario?: ContratoFuncionario // dados da nova API
  funcionario?: FuncionarioApi // dados completos da API (opcional)
  isLoading?: boolean
  variant: 'fiscal' | 'gestor'
}

export function FuncionarioCard({ 
  responsavel, 
  contratoFuncionario,
  funcionario, 
  isLoading = false, 
  variant 
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
  
  // Função para formatar data no formato brasileiro
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

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

  // Usar dados da API se disponível, senão usar dados da nova API do contrato, depois dados legados
  const nomeCompleto = funcionario?.nomeCompleto || contratoFuncionario?.funcionarioNome || responsavel?.nome || 'Nome não informado'
  const cargo = funcionario?.cargo || contratoFuncionario?.funcionarioCargo || responsavel?.cargo || 'Cargo não informado'
  const email = funcionario?.emailInstitucional || responsavel?.email || ''
  const telefone = funcionario?.telefone || responsavel?.telefone || ''
  const matricula = funcionario?.matricula || contratoFuncionario?.funcionarioMatricula

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
          <User className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex-1">
          {/* Header com nome e status */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{nomeCompleto}</h4>
              <p className="text-muted-foreground text-sm">{cargo}</p>
              {funcionario?.funcao && funcionario.funcao !== cargo && (
                <p className="text-muted-foreground text-xs">({funcionario.funcao})</p>
              )}
            </div>
            
            {/* Status de situação funcional */}
            {situacao && (
              <div className="flex items-center gap-1">
                <situacao.icon className={`h-4 w-4 ${situacao.color}`} />
                <span className={`text-xs ${situacao.color}`}>{situacao.label}</span>
              </div>
            )}
          </div>

          {/* Informações de identificação */}
          <div className="mt-2 flex flex-wrap gap-2">
            {matricula && (
              <Badge variant="outline" className="text-xs">
                <Hash className="mr-1 h-3 w-3" />
                {matricula}
              </Badge>
            )}
            {funcionario?.lotacaoSigla && (
              <Badge variant="outline" className={`text-xs ${config.badgeColor}`}>
                <Building className="mr-1 h-3 w-3" />
                {funcionario.lotacaoSigla}
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

          {/* Datas importantes */}
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            {funcionario?.dataAdmissao && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Admitido em {formatarData(funcionario.dataAdmissao)}</span>
              </div>
            )}
            
            {responsavel?.dataDesignacao && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Designado em {formatarData(responsavel.dataDesignacao)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}