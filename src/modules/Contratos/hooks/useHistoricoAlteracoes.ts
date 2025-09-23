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
function transformAlteracaoContratual(
  alteracao: AlteracaoContratualResponse,
): AlteracaoContrato {
  // Mapeamento correto baseado no JSON da API (/api/alteracoes-contratuais/tipos)
  const tipoMap: Record<number, string> = {
    1: 'prazo_aditivo', // Aditivo - Prazo
    3: 'qualitativo', // Aditivo - Qualitativo
    4: 'quantidade', // Aditivo - Quantidade (CORRIGIDO: era 'repactuacao')
    7: 'reajuste', // Reajuste
    8: 'repactuacao', // Repactuação (CORRIGIDO: agora está no ID correto)
    9: 'reequilibrio', // Reequilíbrio
    11: 'rescisao', // Rescisão
    12: 'supressao', // Supressão
    13: 'suspensao', // Suspensão
    0: 'apostilamento', // Apostilamento
    6: 'sub_rogacao', // Sub-rogação
  }

  const primeiroTipo = alteracao.tiposAlteracao?.[0] || 3
  const tipo = tipoMap[primeiroTipo] || 'alteracao_contratual'

  // Usar resumoAlteracao da API se disponível, senão usar justificativa
  const descricao =
    alteracao.resumoAlteracao ||
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

    // Campos adicionais - preservar dados originais da API
    fornecedores: alteracao.fornecedores || undefined,
    unidades: alteracao.unidades || undefined,
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
