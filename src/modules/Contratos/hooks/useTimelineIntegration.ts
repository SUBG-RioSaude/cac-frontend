import { useCallback } from 'react'
import type { 
  TimelineEntry
} from '@/modules/Contratos/types/timeline'
import type { AlteracaoContratualForm } from '@/modules/Contratos/types/alteracoes-contratuais'
import { TIPOS_ADITIVO_CONFIG } from '@/modules/Contratos/types/alteracoes-contratuais'

interface UseTimelineIntegrationProps {
  contratoId: string
  onAdicionarEntrada?: (entrada: TimelineEntry) => void
}

/**
 * Hook para integração automática entre alterações contratuais e timeline
 * Converte eventos do wizard de alterações em entradas da timeline
 */
export function useTimelineIntegration({ contratoId, onAdicionarEntrada }: UseTimelineIntegrationProps) {
  
  /**
   * Cria entrada na timeline quando uma alteração contratual é criada/submetida
   */
  const criarEntradaAlteracao = useCallback((alteracao: AlteracaoContratualForm, autor: { id: string; nome: string; tipo: string }) => {
    try {
      const tipoConfig = TIPOS_ADITIVO_CONFIG[alteracao.tipoAditivo]
      
      if (!tipoConfig) {
        throw new Error(`Tipo de aditivo não encontrado: ${alteracao.tipoAditivo}`)
      }
      
      const entrada: TimelineEntry = {
      id: `timeline_${Date.now()}_${alteracao.id}`,
      contratoId,
      tipo: 'alteracao_contratual',
      categoria: 'alteracao',
      titulo: `${tipoConfig.label} - ${getDescricaoResumida(alteracao)}`,
      descricao: `${alteracao.justificativa}\n\nManifestação Técnica: ${alteracao.manifestacaoTecnica}`,
      dataEvento: alteracao.dataSolicitacao,
      autor: {
        id: autor.id,
        nome: autor.nome,
        tipo: autor.tipo as 'usuario' | 'fiscal' | 'gestor' | 'fornecedor' | 'sistema'
      },
      status: 'ativo',
      prioridade: getPrioridadePorTipo(alteracao.tipoAditivo),
      alteracaoContratual: {
        alteracaoId: alteracao.id || '',
        tipoAditivo: tipoConfig.label,
        valorOriginal: getValorOriginal(alteracao),
        valorNovo: alteracao.valorAjustado,
        diferenca: alteracao.valorAjustado - getValorOriginal(alteracao),
        percentualDiferenca: calcularPercentualDiferenca(getValorOriginal(alteracao), alteracao.valorAjustado),
        novaVigencia: alteracao.novaVigencia,
        statusAlteracao: alteracao.status || 'rascunho'
      },
      tags: gerarTagsAlteracao(alteracao),
      criadoEm: new Date().toISOString()
    }

      if (onAdicionarEntrada) {
        onAdicionarEntrada(entrada)
      }
      
      return entrada
    } catch (error) {
      console.error('Erro ao criar entrada da alteração:', error)
      throw error
    }
  }, [contratoId, onAdicionarEntrada])

  /**
   * Cria marcos automáticos baseados na alteração contratual
   */
  const criarMarcosAlteracao = useCallback((alteracao: AlteracaoContratualForm) => {
    const marcos: TimelineEntry[] = []

    // Marco de autorização
    if (alteracao.dataAutorizacao) {
      const marcoAutorizacao: TimelineEntry = {
        id: `marco_auth_${Date.now()}_${alteracao.id}`,
        contratoId,
        tipo: 'marco_sistema',
        categoria: 'milestone',
        titulo: 'Autorização da Alteração Contratual',
        descricao: `Marco automático: autorização oficial da ${TIPOS_ADITIVO_CONFIG[alteracao.tipoAditivo].label.toLowerCase()} em ${new Date(alteracao.dataAutorizacao).toLocaleDateString('pt-BR')}.`,
        dataEvento: alteracao.dataAutorizacao,
        autor: {
          id: 'SYSTEM',
          nome: 'Sistema CAC',
          tipo: 'sistema'
        },
        status: 'ativo',
        prioridade: 'alta',
        milestone: {
          etapa: 'Autorização de Alteração',
          concluido: true,
          percentualCompleto: 100
        },
        tags: ['marco', 'autorização', alteracao.tipoAditivo],
        criadoEm: new Date().toISOString()
      }
      marcos.push(marcoAutorizacao)
    }

    // Marco de nova vigência (se aplicável)
    if (alteracao.novaVigencia && alteracao.tipoAditivo === 'prazo') {
      const marcoVigencia: TimelineEntry = {
        id: `marco_vigencia_${Date.now()}_${alteracao.id}`,
        contratoId,
        tipo: 'marco_sistema', 
        categoria: 'milestone',
        titulo: 'Nova Vigência - Final do Contrato',
        descricao: `Marco automático: nova data de término do contrato estabelecida pela alteração.`,
        dataEvento: alteracao.novaVigencia,
        autor: {
          id: 'SYSTEM',
          nome: 'Sistema CAC',
          tipo: 'sistema'
        },
        status: 'ativo',
        prioridade: 'media',
        milestone: {
          etapa: 'Fim de Vigência',
          dataLimite: alteracao.novaVigencia,
          concluido: false,
          percentualCompleto: 0
        },
        tags: ['marco', 'vigência', 'prazo'],
        criadoEm: new Date().toISOString()
      }
      marcos.push(marcoVigencia)
    }

    // Adicionar todos os marcos à timeline
    marcos.forEach(marco => onAdicionarEntrada?.(marco))
    
    return marcos
  }, [contratoId, onAdicionarEntrada])

  /**
   * Atualiza entrada existente quando alteração contratual muda de status
   */
  const atualizarStatusAlteracao = useCallback((alteracaoId: string, novoStatus: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada') => {
    // Esta função seria implementada para atualizar entradas existentes
    // Por ora, criamos uma nova entrada de acompanhamento
    const statusLabels = {
      rascunho: 'Alteração salva como rascunho',
      submetida: 'Alteração submetida para aprovação',
      aprovada: 'Alteração aprovada e autorizada',
      rejeitada: 'Alteração rejeitada'
    }


    const entradaStatus: TimelineEntry = {
      id: `status_${Date.now()}_${alteracaoId}`,
      contratoId,
      tipo: 'marco_sistema',
      categoria: 'alteracao',
      titulo: statusLabels[novoStatus],
      descricao: `Status da alteração contratual ${alteracaoId} foi atualizado para: ${statusLabels[novoStatus].toLowerCase()}.`,
      dataEvento: new Date().toISOString(),
      autor: {
        id: 'SYSTEM',
        nome: 'Sistema CAC',
        tipo: 'sistema'
      },
      status: 'ativo',
      prioridade: novoStatus === 'aprovada' ? 'alta' : 'media',
      tags: ['status', 'alteração', novoStatus],
      criadoEm: new Date().toISOString()
    }

    onAdicionarEntrada?.(entradaStatus)
    return entradaStatus
  }, [contratoId, onAdicionarEntrada])

  return {
    criarEntradaAlteracao,
    criarMarcosAlteracao,
    atualizarStatusAlteracao
  }
}

// Funções auxiliares
function getDescricaoResumida(alteracao: AlteracaoContratualForm): string {
  const { tipoAditivo, valorAjustado } = alteracao
  
  switch (tipoAditivo) {
    case 'prazo':
      return 'Alteração de Prazo'
    case 'quantidade':
      return `Ajuste de Valor: R$ ${valorAjustado.toLocaleString('pt-BR')}`
    case 'qualitativo':
      return 'Alteração de Escopo'
    case 'reajuste':
      return `Reajuste: R$ ${valorAjustado.toLocaleString('pt-BR')}`
    case 'repactuacao':
      return 'Repactuação de Preços'
    case 'repactuacao_reequilibrio':
      return 'Repactuação e Reequilíbrio'
    default:
      return 'Alteração Contratual'
  }
}

function getPrioridadePorTipo(tipo: string): 'baixa' | 'media' | 'alta' | 'critica' {
  switch (tipo) {
    case 'repactuacao_reequilibrio':
    case 'repactuacao':
      return 'critica'
    case 'quantidade':
    case 'qualitativo':
      return 'alta'
    case 'prazo':
      return 'media'
    case 'reajuste':
      return 'baixa'
    default:
      return 'media'
  }
}

function getValorOriginal(alteracao: AlteracaoContratualForm): number {
  // TODO: Integrar com API para buscar valor original do contrato
  // Por ora, usamos lógica baseada no tipo de alteração
  switch (alteracao.tipoAditivo) {
    case 'quantidade':
    case 'repactuacao':
    case 'repactuacao_reequilibrio':
      // Para alterações que envolvem mudança de valor
      return alteracao.valorAjustado * 0.85
    case 'reajuste':
      // Para reajustes, calcular valor base sem reajuste
      return alteracao.valorAjustado / 1.10 // Assume reajuste de 10%
    default:
      // Para alterações que não afetam valor (prazo, qualitativo)
      return alteracao.valorAjustado
  }
}

function calcularPercentualDiferenca(valorOriginal: number, valorNovo: number): number {
  if (valorOriginal === 0) return 0
  return ((valorNovo - valorOriginal) / valorOriginal) * 100
}

function gerarTagsAlteracao(alteracao: AlteracaoContratualForm): string[] {
  const tags: string[] = [alteracao.tipoAditivo]
  
  if (alteracao.status) {
    tags.push(alteracao.status)
  }
  
  // Tags contextuais baseadas no tipo
  switch (alteracao.tipoAditivo) {
    case 'prazo':
      tags.push('cronograma', 'vigência')
      break
    case 'quantidade':
      tags.push('valor', 'quantitativo')
      break
    case 'qualitativo':
      tags.push('escopo', 'especificação')
      break
    case 'reajuste':
      tags.push('índice', 'preços')
      break
    case 'repactuacao':
    case 'repactuacao_reequilibrio':
      tags.push('econômico', 'reequilíbrio')
      break
  }
  
  return tags
}