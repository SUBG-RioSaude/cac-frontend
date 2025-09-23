/**
 * ==========================================
 * HOOKS PARA HISTÓRICO DE FUNCIONÁRIOS
 * ==========================================
 * Hooks para buscar histórico e períodos de funcionários do contrato
 */

import { useQuery } from '@tanstack/react-query'
import {
  obterHistoricoFuncionarios,
  obterFuncionariosAtivosEm,
  obterPeriodosFuncionario,
} from '../services/contratos-funcionarios-service'

// ========== INTERFACES ==========

export interface HistoricoFuncionario {
  id: string
  funcionarioId: string
  tipoGerencia: number // 1 = Gestor, 2 = Fiscal
  tipoGerenciaDescricao: string
  dataInicio: string
  dataFim: string | null
  motivoAlteracao: number
  motivoAlteracaoDescricao: string
  documentoDesignacao: string | null
  observacoes: string | null
  periodoFormatado: string
  diasNaFuncao: number
  estaAtivo: boolean
  funcionarioNome: string
  funcionarioMatricula: string
  funcionarioCargo: string
}

// ========== HOOKS ==========

/**
 * Hook para obter histórico completo de funcionários do contrato
 */
export function useHistoricoFuncionarios(
  contratoId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['historico-funcionarios', contratoId],
    queryFn: () => obterHistoricoFuncionarios(contratoId),
    enabled: !!contratoId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    select: (data: unknown[]): HistoricoFuncionario[] => {
      return data.map((item: unknown) => {
        const typedItem = item as Record<string, unknown>
        return {
          id: String(typedItem.id),
          funcionarioId: String(typedItem.funcionarioId),
          tipoGerencia: Number(typedItem.tipoGerencia),
          tipoGerenciaDescricao: String(typedItem.tipoGerenciaDescricao),
          dataInicio: String(typedItem.dataInicio),
          dataFim: typedItem.dataFim ? String(typedItem.dataFim) : null,
          motivoAlteracao: Number(typedItem.motivoAlteracao),
          motivoAlteracaoDescricao: String(typedItem.motivoAlteracaoDescricao),
          documentoDesignacao: typedItem.documentoDesignacao
            ? String(typedItem.documentoDesignacao)
            : null,
          observacoes: typedItem.observacoes
            ? String(typedItem.observacoes)
            : null,
          periodoFormatado: String(typedItem.periodoFormatado),
          diasNaFuncao: Number(typedItem.diasNaFuncao),
          estaAtivo: Boolean(typedItem.estaAtivo),
          funcionarioNome: String(typedItem.funcionarioNome),
          funcionarioMatricula: String(typedItem.funcionarioMatricula),
          funcionarioCargo: String(typedItem.funcionarioCargo),
        }
      })
    },
  })
}

/**
 * Hook para obter funcionários ativos em determinada data
 */
export function useFuncionariosAtivosEm(
  contratoId: string,
  data?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['funcionarios-ativos-em', contratoId, data],
    queryFn: () => obterFuncionariosAtivosEm(contratoId, data!),
    enabled: !!contratoId && !!data && options?.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutos
    select: (data: unknown[]): HistoricoFuncionario[] => {
      return data.map((item: unknown) => {
        const typedItem = item as Record<string, unknown>
        return {
          id: String(typedItem.id),
          funcionarioId: String(typedItem.funcionarioId),
          tipoGerencia: Number(typedItem.tipoGerencia),
          tipoGerenciaDescricao: String(typedItem.tipoGerenciaDescricao),
          dataInicio: String(typedItem.dataInicio),
          dataFim: typedItem.dataFim ? String(typedItem.dataFim) : null,
          motivoAlteracao: Number(typedItem.motivoAlteracao),
          motivoAlteracaoDescricao: String(typedItem.motivoAlteracaoDescricao),
          documentoDesignacao: typedItem.documentoDesignacao
            ? String(typedItem.documentoDesignacao)
            : null,
          observacoes: typedItem.observacoes
            ? String(typedItem.observacoes)
            : null,
          periodoFormatado: String(typedItem.periodoFormatado),
          diasNaFuncao: Number(typedItem.diasNaFuncao),
          estaAtivo: Boolean(typedItem.estaAtivo),
          funcionarioNome: String(typedItem.funcionarioNome),
          funcionarioMatricula: String(typedItem.funcionarioMatricula),
          funcionarioCargo: String(typedItem.funcionarioCargo),
        }
      })
    },
  })
}

/**
 * Hook para obter períodos de um funcionário específico no contrato
 */
export function usePeriodosFuncionario(
  contratoId: string,
  funcionarioId?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['periodos-funcionario', contratoId, funcionarioId],
    queryFn: () => obterPeriodosFuncionario(contratoId, funcionarioId!),
    enabled: !!contratoId && !!funcionarioId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    select: (data: unknown[]): HistoricoFuncionario[] => {
      return data.map((item: unknown) => {
        const typedItem = item as Record<string, unknown>
        return {
          id: String(typedItem.id),
          funcionarioId: String(typedItem.funcionarioId),
          tipoGerencia: Number(typedItem.tipoGerencia),
          tipoGerenciaDescricao: String(typedItem.tipoGerenciaDescricao),
          dataInicio: String(typedItem.dataInicio),
          dataFim: typedItem.dataFim ? String(typedItem.dataFim) : null,
          motivoAlteracao: Number(typedItem.motivoAlteracao),
          motivoAlteracaoDescricao: String(typedItem.motivoAlteracaoDescricao),
          documentoDesignacao: typedItem.documentoDesignacao
            ? String(typedItem.documentoDesignacao)
            : null,
          observacoes: typedItem.observacoes
            ? String(typedItem.observacoes)
            : null,
          periodoFormatado: String(typedItem.periodoFormatado),
          diasNaFuncao: Number(typedItem.diasNaFuncao),
          estaAtivo: Boolean(typedItem.estaAtivo),
          funcionarioNome: String(typedItem.funcionarioNome),
          funcionarioMatricula: String(typedItem.funcionarioMatricula),
          funcionarioCargo: String(typedItem.funcionarioCargo),
        }
      })
    },
  })
}
