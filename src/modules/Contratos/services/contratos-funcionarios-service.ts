/**
 * ==========================================
 * SERVICE PARA GESTÃO DE FUNCIONÁRIOS DO CONTRATO
 * ==========================================
 * Centraliza as operações de API para funcionários vinculados a contratos
 */

import { api } from '@/lib/axios'

// ========== INTERFACES ==========

export interface AdicionarFuncionarioPayload {
  funcionarioId: string
  tipoGerencia: 1 | 2 // 1=Gestor, 2=Fiscal
  observacoes?: string
}

export interface AdicionarFuncionarioResponse {
  funcionarioId: string
  tipoGerencia: number
  observacoes?: string
  dataCadastro: string
  ativo: boolean
  funcionarioNome?: string
  funcionarioCargo?: string
}

// ========== FUNÇÕES DO SERVICE ==========

/**
 * Adicionar funcionário ao contrato
 */
export async function adicionarFuncionarioContrato(
  contratoId: string,
  payload: AdicionarFuncionarioPayload
): Promise<AdicionarFuncionarioResponse> {
  const response = await api.post(
    `/api/contratos/${contratoId}/funcionarios`,
    payload
  )
  return response.data
}

/**
 * Remover funcionário do contrato
 */
export async function removerFuncionarioContrato(
  contratoId: string,
  funcionarioId: string,
  tipoGerencia: 1 | 2
): Promise<void> {
  await api.delete(
    `/api/contratos/${contratoId}/funcionarios/${funcionarioId}`,
    {
      params: { tipoGerencia }
    }
  )
}

/**
 * Substituir funcionário do contrato (remove antigo + adiciona novo)
 * Esta é uma operação composta que tenta ser o mais atômica possível
 */
export async function substituirFuncionarioContrato(
  contratoId: string,
  funcionarioAntigoId: string,
  funcionarioNovoId: string,
  tipoGerencia: 1 | 2,
  observacoes?: string
): Promise<AdicionarFuncionarioResponse> {
  // Passo 1: Remover funcionário antigo
  try {
    await removerFuncionarioContrato(contratoId, funcionarioAntigoId, tipoGerencia)
  } catch (error) {
    console.error('Erro ao remover funcionário antigo:', error)
    throw new Error('Não foi possível remover o funcionário atual. Operação cancelada.')
  }

  // Passo 2: Adicionar novo funcionário
  try {
    const novoFuncionario = await adicionarFuncionarioContrato(contratoId, {
      funcionarioId: funcionarioNovoId,
      tipoGerencia,
      observacoes
    })
    return novoFuncionario
  } catch (error) {
    console.error('Erro ao adicionar novo funcionário:', error)
    
    // Tentar rollback: re-adicionar funcionário antigo
    try {
      console.log('Tentando rollback: re-adicionando funcionário antigo...')
      await adicionarFuncionarioContrato(contratoId, {
        funcionarioId: funcionarioAntigoId,
        tipoGerencia,
        observacoes: 'Revertido automaticamente após falha na substituição'
      })
      console.log('Rollback realizado com sucesso')
    } catch (rollbackError) {
      console.error('Falha no rollback:', rollbackError)
      throw new Error('Erro crítico: Não foi possível adicionar o novo funcionário e o rollback falhou. Contate o suporte.')
    }
    
    throw new Error('Não foi possível adicionar o novo funcionário. O funcionário anterior foi mantido.')
  }
}

/**
 * Listar funcionários do contrato por tipo
 */
export async function listarFuncionariosContrato(
  contratoId: string,
  tipoGerencia?: 1 | 2
): Promise<AdicionarFuncionarioResponse[]> {
  const params = tipoGerencia ? { tipoGerencia } : {}
  const response = await api.get(
    `/api/contratos/${contratoId}/funcionarios`,
    { params }
  )
  return response.data
}

// ========== UTILITÁRIOS ==========

/**
 * Mapear tipo de gerência para texto legível
 */
export function getTipoGerenciaLabel(tipo: 1 | 2): string {
  return tipo === 1 ? 'Gestor' : 'Fiscal'
}

/**
 * Validar se funcionário pode ser substituído
 */
export function validarSubstituicaoFuncionario(
  funcionarioAtualId: string,
  funcionarioNovoId: string,
  tipoGerencia: 1 | 2
): { valido: boolean; erro?: string } {
  if (!funcionarioAtualId || !funcionarioNovoId) {
    return { valido: false, erro: 'IDs dos funcionários são obrigatórios' }
  }

  if (funcionarioAtualId === funcionarioNovoId) {
    return { valido: false, erro: 'O novo funcionário deve ser diferente do atual' }
  }

  if (![1, 2].includes(tipoGerencia)) {
    return { valido: false, erro: 'Tipo de gerência deve ser 1 (Gestor) ou 2 (Fiscal)' }
  }

  return { valido: true }
}