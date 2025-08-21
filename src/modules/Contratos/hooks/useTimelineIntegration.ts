import { useCallback } from 'react'
import type { 
  TimelineEntry
} from '@/modules/Contratos/types/timeline'
import type { AlteracaoContratualForm } from '@/modules/Contratos/types/alteracoes-contratuais'
import { TIPOS_ADITIVO_CONFIG } from '@/modules/Contratos/types/alteracoes-contratuais'
import type { DocumentoContrato, StatusDocumento } from '@/modules/Contratos/types/documento-contrato'

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

  /**
   * Cria entrada na timeline quando um documento é adicionado, modificado ou tem status alterado
   */
  const criarEntradaDocumento = useCallback((
    documento: DocumentoContrato,
    acao: 'adicionado' | 'status_alterado' | 'link_atualizado' | 'observacao_adicionada',
    autor: { id: string; nome: string; tipo: string },
    dadosAdicionais?: { statusAnterior?: StatusDocumento; linkAnterior?: string }
  ) => {
    try {
      const acaoLabels = {
        adicionado: {
          titulo: `Documento Adicionado - ${documento.nome}`,
          descricao: `Novo documento ${documento.categoria} foi adicionado: ${documento.descricao}`,
          prioridade: documento.categoria === 'obrigatorio' ? 'alta' : 'media' as const
        },
        status_alterado: {
          titulo: `Status Alterado - ${documento.nome}`,
          descricao: `Status do documento alterado ${dadosAdicionais?.statusAnterior ? `de "${dadosAdicionais.statusAnterior}" ` : ''}para "${documento.status}". ${documento.observacoes ? `Observações: ${documento.observacoes}` : ''}`,
          prioridade: documento.status === 'com_pendencia' ? 'alta' : 'media' as const
        },
        link_atualizado: {
          titulo: `Link Atualizado - ${documento.nome}`,
          descricao: `Link externo do documento foi ${documento.linkExterno ? 'adicionado/atualizado' : 'removido'}. ${documento.linkExterno ? `Novo link: ${documento.linkExterno}` : ''}`,
          prioridade: 'baixa' as const
        },
        observacao_adicionada: {
          titulo: `Observações Atualizadas - ${documento.nome}`,
          descricao: `Observações do documento foram atualizadas: ${documento.observacoes || 'Observações removidas'}`,
          prioridade: 'baixa' as const
        }
      }

      const config = acaoLabels[acao]
      
      const entrada: TimelineEntry = {
        id: `doc_${acao}_${Date.now()}_${documento.id}`,
        contratoId,
        tipo: 'manual',
        categoria: 'documento',
        titulo: config.titulo,
        descricao: config.descricao,
        dataEvento: new Date().toISOString(),
        autor: {
          id: autor.id,
          nome: autor.nome,
          tipo: autor.tipo as 'usuario' | 'fiscal' | 'gestor' | 'fornecedor' | 'sistema'
        },
        status: 'ativo',
        prioridade: config.prioridade as 'baixa' | 'media' | 'alta' | 'critica',
        metadata: {
          documentoId: documento.id,
          tipoDocumento: documento.tipo.nome,
          categoria: documento.categoria,
          statusAtual: documento.status,
          linkExterno: documento.linkExterno,
          acao
        },
        tags: ['documento', documento.categoria, documento.status, acao],
        criadoEm: new Date().toISOString()
      }

      onAdicionarEntrada?.(entrada)
      return entrada

    } catch (error) {
      console.error('Erro ao criar entrada de documento na timeline:', error)
      return null
    }
  }, [contratoId, onAdicionarEntrada])

  const criarEntradaChecklist = useCallback((
    documentoNome: string,
    status: 'entregue' | 'pendente' | 'nao_aplicavel',
    autor: { id: string; nome: string; tipo: string }
  ) => {
    try {
      const statusLabels = {
        entregue: 'marcado como Entregue',
        pendente: 'marcado como Pendente',
        nao_aplicavel: 'marcado como Não Aplicável'
      };

      const entrada: TimelineEntry = {
        id: `checklist_${Date.now()}_${documentoNome.replace(/\s/g, '_')}`,
        contratoId,
        tipo: 'marco_sistema',
        categoria: 'documento',
        titulo: `Checklist: ${documentoNome}`,
        descricao: `O documento '${documentoNome}' foi ${statusLabels[status]}.`,
        dataEvento: new Date().toISOString(),
        autor: {
          id: autor.id,
          nome: autor.nome,
          tipo: autor.tipo as 'usuario' | 'sistema',
        },
        status: 'ativo',
        prioridade: 'media',
        tags: ['checklist', 'documento', status],
        criadoEm: new Date().toISOString(),
      };

      onAdicionarEntrada?.(entrada);
      return entrada;

    } catch (error) {
      console.error('Erro ao criar entrada de checklist na timeline:', error);
      return null;
    }
  }, [contratoId, onAdicionarEntrada]);

  return {
    criarEntradaAlteracao,
    criarMarcosAlteracao,
    atualizarStatusAlteracao,
    criarEntradaDocumento,
    criarEntradaChecklist
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