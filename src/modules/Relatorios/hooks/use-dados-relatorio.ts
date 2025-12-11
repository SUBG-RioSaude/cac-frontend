/**
 * ==========================================
 * HOOK: USE-DADOS-RELATORIO
 * ==========================================
 * Busca e agrega dados de contratos para geração de relatórios
 */

import { useQuery } from '@tanstack/react-query'

import type { ContratoRelatorio, TipoRelatorio } from '../types/relatorio'
import { enriquecerMultiplosContratos } from '../lib/calculos/indicadores-contrato'
import { getContratoDetalhado } from '@/modules/Contratos/services/contratos-service'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato'
import { logger } from '@/lib/logger'

// ========== TIPOS ==========

export interface OpcoesConsultaDados {
  idsContratos: string[]
  tipo: TipoRelatorio
  enabled?: boolean
  contratosBase?: any[] // Contratos já carregados da lista (para usar como fallback)
}

export interface ResultadoDadosRelatorio {
  contratos: ContratoRelatorio[]
  isLoading: boolean
  isError: boolean
  erro: Error | null
}

// ========== TRANSFORMAÇÃO DE DADOS ==========

/**
 * Transforma contrato da API para formato de relatório
 */
const transformarContratoParaRelatorio = (
  contratoAPI: ContratoDetalhado,
  contratoBase?: any, // Contrato da lista (com empresaRazaoSocial correto)
): ContratoRelatorio => {
  // Debug: verificar dados do fornecedor
  logger.info(`📋 Transformando contrato ${contratoAPI.numeroContrato}:`, {
    empresaRazaoSocial: contratoAPI.empresaRazaoSocial,
    fornecedorRazaoSocial: contratoAPI.fornecedor?.razaoSocial,
    empresaCnpj: contratoAPI.fornecedor?.cnpj,
    contratoBaseRazaoSocial: contratoBase?.empresaRazaoSocial,
    contratoBaseCnpj: contratoBase?.empresaCnpj,
  })

  if (!contratoAPI.fornecedor) {
    console.warn(
      `⚠️ Contrato ${contratoAPI.numeroContrato}: fornecedor não encontrado`,
    )
  } else if (!contratoAPI.fornecedor.razaoSocial) {
    console.warn(
      `⚠️ Contrato ${contratoAPI.numeroContrato}: razão social do fornecedor está vazia`,
    )
  }

  // PRIORIDADE: contratoBase (da lista) > contratoAPI detalhado > fallbacks
  const contratadaFinal = {
    id: contratoAPI.empresaId || contratoBase?.empresaId || '0',
    razaoSocial:
      contratoBase?.empresaRazaoSocial || // 1º: Usar da lista (sempre correto)
      contratoBase?.contratada?.razaoSocial || // 2º: Alternativa da lista
      contratoAPI.empresaRazaoSocial || // 3º: API detalhada
      (contratoAPI as any).contratada?.razaoSocial ||
      contratoAPI.fornecedor?.razaoSocial ||
      'Não informado',
    cnpj:
      contratoBase?.empresaCnpj || // 1º: Usar da lista
      contratoBase?.contratada?.cnpj || // 2º: Alternativa da lista
      contratoAPI.empresaCnpj || // 3º: API detalhada
      (contratoAPI as any).contratada?.cnpj ||
      contratoAPI.fornecedor?.cnpj ||
      '',
    email: (contratoAPI.fornecedor as any)?.email || null,
    telefone: (contratoAPI.fornecedor as any)?.telefone || null,
  }

  console.log(
    `✅ Contratada final para ${contratoAPI.numeroContrato}:`,
    contratadaFinal,
  )

  return {
    // Identificação
    id: contratoAPI.id,
    numeroContrato: contratoAPI.numeroContrato,
    processoSei: contratoAPI.processoSei || null,
    objeto: contratoAPI.objeto,
    tipoContrato: contratoAPI.tipoContrato || 'Contrato',
    status: contratoAPI.status || 'ativo',

    // Contratada
    contratada: contratadaFinal,

    // Valores financeiros
    valores: {
      global: contratoAPI.valorGlobal || 0,
      empenhado: contratoAPI.valorEmpenhado || 0,
      saldo: 0, // Será calculado
      percentualExecutado: 0, // Será calculado
    },

    // Vigência
    vigencia: {
      inicial: contratoAPI.vigenciaInicial,
      final: contratoAPI.vigenciaFinal,
      prazoMeses: 0, // Será calculado
      diasRestantes: 0, // Será calculado
      percentualTemporal: 0, // Será calculado
      statusVigencia: 'vigente', // Será calculado
    },

    // Empenhos
    empenhos:
      contratoAPI.empenhos?.map((emp: any) => ({
        id: emp.id,
        numero: emp.numero,
        data: emp.data,
        valor: emp.valor,
        unidadeNome: emp.unidade?.nome || 'Não informado',
        unidadeId: emp.unidade?.id || 0,
      })) || [],

    // Alterações contratuais
    alteracoes:
      contratoAPI.alteracoes?.map((alt: any) => ({
        id: alt.id,
        tipo: alt.tipo,
        descricao: alt.descricao,
        data: alt.data,
        valor: alt.valor || null,
      })) || [],

    // Documentos
    documentos:
      contratoAPI.documentos?.map((doc: any) => ({
        id: doc.id,
        descricao: doc.descricao,
        entregue: doc.entregue || false,
        dataEntrega: doc.dataEntrega || null,
        obrigatorio: doc.obrigatorio || false,
      })) || [],

    // Unidades
    unidades: {
      demandantePrincipal: contratoAPI.unidadeDemandante
        ? {
            id: contratoAPI.unidadeDemandante.id,
            nome: contratoAPI.unidadeDemandante.nome,
          }
        : null,
      gestoraPrincipal: contratoAPI.unidadeGestora
        ? {
            id: contratoAPI.unidadeGestora.id,
            nome: contratoAPI.unidadeGestora.nome,
          }
        : null,
    },

    // Responsáveis
    responsaveis: {
      gestores:
        contratoAPI.gestores?.map((gestor: any) => ({
          id: gestor.id,
          nome: gestor.nome,
          cargo: gestor.cargo || null,
          matricula: gestor.matricula || null,
        })) || [],
      fiscais:
        contratoAPI.fiscais?.map((fiscal: any) => ({
          id: fiscal.id,
          nome: fiscal.nome,
          cargo: fiscal.cargo || null,
          matricula: fiscal.matricula || null,
        })) || [],
    },
  }
}

// ========== BUSCA DE DADOS ==========

/**
 * Busca dados de múltiplos contratos para o relatório
 */
const buscarDadosContratos = async (
  idsContratos: string[],
  contratosBase?: any[], // Contratos da lista para usar como fallback
): Promise<ContratoRelatorio[]> => {
  try {
    console.log('🔍 Buscando dados detalhados para contratos:', idsContratos)
    console.log('📦 Contratos base disponíveis:', contratosBase?.length || 0)

    // Criar mapa de contratos base por ID para lookup rápido
    const mapaContratosBase = new Map<string, any>()
    if (contratosBase) {
      contratosBase.forEach((contrato) => {
        mapaContratosBase.set(contrato.id, contrato)
        console.log(`📋 Contrato base ${contrato.id}:`, {
          numeroContrato: contrato.numeroContrato,
          empresaRazaoSocial: contrato.empresaRazaoSocial,
          empresaCnpj: contrato.empresaCnpj,
        })
      })
    }

    // Busca todos os contratos em paralelo
    const promessas = idsContratos.map((id) => getContratoDetalhado(id))
    const resultados = await Promise.allSettled(promessas)

    // Filtra resultados bem-sucedidos
    const contratos: ContratoRelatorio[] = []

    resultados.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        const contratoBase = mapaContratosBase.get(idsContratos[index])
        console.log(`🔄 Fazendo merge para contrato ${idsContratos[index]}`)

        const contratoTransformado = transformarContratoParaRelatorio(
          resultado.value,
          contratoBase, // Passa contrato da lista como fallback
        )
        contratos.push(contratoTransformado)
      } else {
        console.error(
          `Erro ao buscar contrato ID ${idsContratos[index]}:`,
          resultado.reason,
        )
      }
    })

    if (contratos.length === 0) {
      throw new Error('Nenhum contrato foi carregado com sucesso')
    }

    console.log('✅ Contratos transformados com sucesso:', contratos.length)

    // Enriquece contratos com indicadores calculados
    return enriquecerMultiplosContratos(contratos)
  } catch (erro) {
    console.error('Erro ao buscar dados dos contratos:', erro)
    throw erro
  }
}

// ========== HOOK PRINCIPAL ==========

/**
 * Hook para buscar dados de contratos para relatórios
 */
export const useDadosRelatorio = ({
  idsContratos,
  tipo,
  enabled = true,
  contratosBase, // Contratos da lista para usar como fallback
}: OpcoesConsultaDados): ResultadoDadosRelatorio => {
  const {
    data: contratos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dados-relatorio', tipo, idsContratos],
    queryFn: () => buscarDadosContratos(idsContratos, contratosBase), // Passa contratos base
    enabled: enabled && idsContratos.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antigamente cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  })

  return {
    contratos,
    isLoading,
    isError,
    erro: error as Error | null,
  }
}

/**
 * Hook para buscar dados de um único contrato
 */
export const useDadosContratoUnico = (idContrato: string) => {
  return useDadosRelatorio({
    idsContratos: [idContrato],
    tipo: 'execucao',
    enabled: !!idContrato,
  })
}

/**
 * Hook para pré-carregar dados de contratos (prefetch)
 */
export const usePrefetchDadosRelatorio = () => {
  // TODO: Implementar prefetch com queryClient.prefetchQuery
  return {
    prefetchContratos: async (idsContratos: string[]) => {
      // Implementar quando necessário
      console.log('Prefetch para:', idsContratos)
    },
  }
}
