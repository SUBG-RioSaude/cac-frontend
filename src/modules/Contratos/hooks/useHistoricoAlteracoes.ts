/**
 * Hook para buscar histórico de alterações contratuais
 */

import { useQuery } from '@tanstack/react-query'
import { getHistoricoAlteracoesContrato } from '../services/alteracoes-contratuais-service'
import type { AlteracaoContrato } from '../types/contrato'
import type { AlteracaoContratualResponse } from '../types/alteracoes-contratuais'

/**
 * Transforma dados da nova API para o formato esperado pelo componente RegistroAlteracoes
 */
function transformAlteracaoContratual(alteracao: AlteracaoContratualResponse): AlteracaoContrato {
  // Mapeamento melhorado dos tipos de alteração
  const tipoMap: Record<number, string> = {
    1: 'prazo_aditivo',      // Prazo
    2: 'alteracao_valor',    // Valor 
    3: 'qualitativo',        // Qualitativo
    4: 'repactuacao',        // Repactuação  
    5: 'reajuste',           // Reajuste
    6: 'quantidade'          // Quantidade
  }
  
  const primeiroTipo = alteracao.tiposAlteracao?.[0] || 3
  const tipo = tipoMap[primeiroTipo] || 'alteracao_contratual'
  
  // Usar resumoAlteracao da API se disponível, senão usar justificativa
  const descricao = alteracao.resumoAlteracao || 
    alteracao.justificativa || 
    `Alteração Contratual - ${alteracao.id.substring(0, 8)}`
  
  return {
    id: alteracao.id,
    tipo: tipo as AlteracaoContrato['tipo'],
    descricao,
    dataHora: alteracao.dataCadastro, // Usar campo correto da API
    responsavel: alteracao.usuarioCadastroId || 'Sistema',
    detalhes: alteracao,
    
    // Campos estendidos da nova API
    resumoAlteracao: alteracao.resumoAlteracao,
    tiposAlteracao: alteracao.tiposAlteracao,
    status: alteracao.status,
    versaoContrato: alteracao.versaoContrato,
    dataEfeito: alteracao.dataEfeito,
    requerConfirmacaoLimiteLegal: alteracao.requerConfirmacaoLimiteLegal,
    alertaLimiteLegal: alteracao.alertaLimiteLegal || undefined,
    
    // Dados estruturados dos blocos (agora diretamente na raiz) - converter null para undefined
    vigencia: alteracao.vigencia || undefined,
    valor: alteracao.valor || undefined,
    clausulas: alteracao.clausulas || undefined,
    
    // Campos adicionais para compatibilidade futura
    fornecedores: alteracao.fornecedores ? {
      fornecedoresVinculados: [],
      fornecedoresDesvinculados: [],
      novoFornecedorPrincipal: null,
      observacoes: null
    } : undefined,
    
    unidades: alteracao.unidades ? {
      unidadesVinculadas: [],
      unidadesDesvinculadas: [],
      observacoes: null
    } : undefined
  }
}

export function useHistoricoAlteracoes(contratoId: string, enabled = true) {
  return useQuery({
    queryKey: ['historico-alteracoes', contratoId],
    queryFn: async () => {
      const alteracoes = await getHistoricoAlteracoesContrato(contratoId)
      return alteracoes.map(transformAlteracaoContratual)
    },
    enabled: enabled && !!contratoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}