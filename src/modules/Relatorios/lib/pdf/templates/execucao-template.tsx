/**
 * ==========================================
 * TEMPLATE DE RELATÓRIO DE EXECUÇÃO
 * ==========================================
 * Template completo para relatório de execução contratual
 */

import React from 'react'
import { Document, Page, View, Text, Image } from '@react-pdf/renderer'

import type { DadosRelatorio, ContratoRelatorio } from '../../types/relatorio'
import { estilosPadrao, CORES } from './common/estilos'
import { renderizarCabecalho } from './common/cabecalho'
import { renderizarRodape } from './common/rodape'
import { renderizarSecao, renderizarGrupoInfo, renderizarDivisor } from './common/secao'
import { renderizarTabela, renderizarTabelaLabelValor, type ColunaTabela } from './common/tabela'
import {
  formatarMoeda,
  formatarData,
  formatarCNPJ,
  formatarPercentual,
  valorOuPadrao,
  truncarTexto,
} from '../pdf-utils'

interface ExecucaoTemplateProps {
  dados: DadosRelatorio
  emitidoPor?: string
}

/**
 * Template principal de Relatório de Execução (Consolidado)
 */
export const GerarRelatorioExecucao: React.FC<ExecucaoTemplateProps> = ({ dados, emitidoPor }) => {
  const contratos = dados.contratos

  if (!contratos || contratos.length === 0) {
    return (
      <Document>
        <Page size="A4" style={estilosPadrao.pagina}>
          <Text>Nenhum contrato selecionado</Text>
        </Page>
      </Document>
    )
  }

  // Modo consolidado: múltiplos contratos em uma página
  if (contratos.length > 1) {
    return (
      <Document>
        <Page size="A4" style={estilosPadrao.paginaComCabecalhoFullWidth}>
          {/* Cabeçalho */}
          {renderizarCabecalho({
            titulo: 'RELATÓRIO CONSOLIDADO DE EXECUÇÃO CONTRATUAL',
            subtitulo: `${contratos.length} contratos selecionados`,
            dataGeracao: dados.dataGeracao,
            emitidoPor,
          })}

          {/* Resumo Executivo */}
          {renderizarSecaoResumoExecutivo(contratos)}

          {/* Tabela Consolidada */}
          {renderizarTabelaConsolidada(contratos)}

          {/* Rodapé */}
          {renderizarRodape({
            numeroPagina: 1,
            totalPaginas: 1,
            textoAdicional: 'Sistema CAC - Gestão de Contratos',
          })}
        </Page>
      </Document>
    )
  }

  // Modo detalhado: um único contrato com 3 páginas
  const contrato = contratos[0]

  return (
    <Document>
      {/* Página 1: Informações Principais */}
      <Page size="A4" style={estilosPadrao.paginaComCabecalhoFullWidth}>
        {/* Cabeçalho */}
        {renderizarCabecalho({
          titulo: 'RELATÓRIO DE EXECUÇÃO CONTRATUAL',
          subtitulo: contrato.numeroContrato,
          dataGeracao: dados.dataGeracao,
          emitidoPor,
        })}

        {/* Seção 1: Identificação do Contrato */}
        {renderizarSecaoIdentificacao(contrato)}

        {/* Seção 2: Informações Financeiras */}
        {renderizarSecaoFinanceira(contrato, dados.graficos?.execucaoFinanceira)}

        {/* Seção 3: Cronograma de Vigência */}
        {renderizarSecaoCronograma(contrato, dados.graficos?.execucaoTemporal)}

        {/* Rodapé */}
        {renderizarRodape({
          numeroPagina: 1,
          totalPaginas: 3,
          textoAdicional: 'Sistema CAC - Gestão de Contratos',
        })}
      </Page>

      {/* Página 2: Empenhos e Alterações */}
      <Page size="A4" style={estilosPadrao.pagina}>
        {/* Seção 4: Controle de Empenhos */}
        {renderizarSecaoEmpenhos(contrato)}

        {/* Seção 5: Alterações Contratuais */}
        {renderizarSecaoAlteracoes(contrato)}

        {/* Rodapé */}
        {renderizarRodape({
          numeroPagina: 2,
          totalPaginas: 3,
          textoAdicional: 'Sistema CAC - Gestão de Contratos',
        })}
      </Page>

      {/* Página 3: Documentos e Responsáveis */}
      <Page size="A4" style={estilosPadrao.pagina}>
        {/* Seção 6: Documentação */}
        {renderizarSecaoDocumentos(contrato)}

        {/* Seção 7: Unidades e Responsáveis */}
        {renderizarSecaoResponsaveis(contrato)}

        {/* Rodapé */}
        {renderizarRodape({
          numeroPagina: 3,
          totalPaginas: 3,
          textoAdicional: 'Sistema CAC - Gestão de Contratos',
        })}
      </Page>
    </Document>
  )
}

// ========== SEÇÕES DO RELATÓRIO ==========

/**
 * Seção 1: Identificação do Contrato
 */
const renderizarSecaoIdentificacao = (contrato: ContratoRelatorio) => {
  return renderizarSecao({
    titulo: 'IDENTIFICAÇÃO DO CONTRATO',
    numeracao: '1.',
    children: [
      renderizarGrupoInfo([
        { label: 'Número do Contrato', valor: contrato.numeroContrato },
        { label: 'Processo SEI', valor: valorOuPadrao(contrato.processoSei) },
        { label: 'Tipo de Contrato', valor: contrato.tipoContrato || '-' },
        { label: 'Status', valor: contrato.status },
      ]),
      renderizarDivisor(),
      <View key="objeto" style={{ marginTop: 8 }}>
        <Text style={estilosPadrao.label}>OBJETO DO CONTRATO</Text>
        <Text style={estilosPadrao.texto}>{contrato.objeto}</Text>
      </View>,
      renderizarDivisor(),
      <View key="contratada" style={{ marginTop: 8 }}>
        <Text style={estilosPadrao.label}>CONTRATADA</Text>
        <Text style={estilosPadrao.textoNegrito}>
          {contrato.contratada.razaoSocial}
        </Text>
        <Text style={estilosPadrao.textoPequeno}>
          CNPJ: {formatarCNPJ(contrato.contratada.cnpj)}
        </Text>
        {contrato.contratada.email && (
          <Text style={estilosPadrao.textoPequeno}>
            Email: {contrato.contratada.email}
          </Text>
        )}
        {contrato.contratada.telefone && (
          <Text style={estilosPadrao.textoPequeno}>
            Telefone: {contrato.contratada.telefone}
          </Text>
        )}
      </View>,
    ],
  })
}

/**
 * Seção 2: Informações Financeiras
 */
const renderizarSecaoFinanceira = (
  contrato: ContratoRelatorio,
  graficoUrl?: string,
) => {
  const valores = contrato.valores

  return renderizarSecao({
    titulo: 'INFORMAÇÕES FINANCEIRAS',
    numeracao: '2.',
    children: [
      renderizarTabelaLabelValor([
        { label: 'Valor Global', valor: formatarMoeda(valores.global) },
        { label: 'Valor Empenhado', valor: formatarMoeda(valores.empenhado) },
        { label: 'Saldo Atual', valor: formatarMoeda(valores.saldo) },
        {
          label: 'Percentual Executado',
          valor: formatarPercentual(valores.percentualExecutado),
        },
      ]),
      graficoUrl && (
        <View key="grafico" style={{ marginTop: 16 }}>
          <Text style={estilosPadrao.label}>EXECUÇÃO FINANCEIRA</Text>
          <Image src={graficoUrl} style={estilosPadrao.graficoMedio} />
        </View>
      ),
      <View
        key="analise"
        style={{
          ...estilosPadrao.cardDestaque,
          marginTop: 16,
        }}
      >
        <Text style={estilosPadrao.textoPequeno}>
          <Text style={{ fontWeight: 'bold' }}>Análise: </Text>
          {valores.percentualExecutado < 50
            ? 'Execução em fase inicial. Acompanhamento necessário para garantir cumprimento do cronograma.'
            : valores.percentualExecutado < 80
              ? 'Execução em andamento normal. Acompanhar evolução dos empenhos.'
              : 'Execução avançada. Atentar para saldo remanescente e prazos finais.'}
        </Text>
      </View>,
    ],
  })
}

/**
 * Seção 3: Cronograma de Vigência
 */
const renderizarSecaoCronograma = (
  contrato: ContratoRelatorio,
  graficoUrl?: string,
) => {
  const vigencia = contrato.vigencia

  return renderizarSecao({
    titulo: 'CRONOGRAMA DE VIGÊNCIA',
    numeracao: '3.',
    children: [
      renderizarGrupoInfo([
        { label: 'Data Inicial', valor: formatarData(vigencia.inicial) },
        { label: 'Data Final', valor: formatarData(vigencia.final) },
        { label: 'Prazo Total', valor: `${vigencia.prazoMeses} meses` },
        { label: 'Dias Restantes', valor: `${vigencia.diasRestantes} dias` },
      ]),
      <View key="progresso" style={{ marginTop: 16 }}>
        <Text style={estilosPadrao.label}>PROGRESSO TEMPORAL</Text>
        <View
          style={{
            height: 20,
            backgroundColor: CORES.fundoMedio,
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: 4,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${vigencia.percentualTemporal}%`,
              backgroundColor: CORES.primaria,
            }}
          />
        </View>
        <Text style={{ ...estilosPadrao.textoPequeno, marginTop: 4 }}>
          {formatarPercentual(vigencia.percentualTemporal)} do prazo decorrido
        </Text>
      </View>,
      graficoUrl && (
        <View key="grafico" style={{ marginTop: 16 }}>
          <Image src={graficoUrl} style={estilosPadrao.graficoMedio} />
        </View>
      ),
    ],
  })
}

/**
 * Seção 4: Controle de Empenhos
 */
const renderizarSecaoEmpenhos = (contrato: ContratoRelatorio) => {
  if (!contrato.empenhos || contrato.empenhos.length === 0) {
    return renderizarSecao({
      titulo: 'CONTROLE DE EMPENHOS',
      numeracao: '4.',
      children: (
        <Text style={estilosPadrao.textoSecundario}>
          Nenhum empenho registrado para este contrato.
        </Text>
      ),
    })
  }

  const colunas: ColunaTabela[] = [
    { chave: 'numero', titulo: 'Número', largura: '25%' },
    {
      chave: 'data',
      titulo: 'Data',
      largura: '20%',
      formatador: formatarData,
    },
    {
      chave: 'valor',
      titulo: 'Valor',
      largura: '25%',
      alinhamento: 'right',
      formatador: formatarMoeda,
    },
    { chave: 'unidadeNome', titulo: 'Unidade', largura: '30%' },
  ]

  const totalEmpenhado = contrato.empenhos.reduce(
    (sum, emp) => sum + emp.valor,
    0,
  )

  return renderizarSecao({
    titulo: 'CONTROLE DE EMPENHOS',
    numeracao: '4.',
    children: [
      renderizarTabela({
        colunas,
        dados: contrato.empenhos,
        zebrada: true,
      }),
      <View key="total" style={{ marginTop: 8, alignItems: 'flex-end' }}>
        <Text style={estilosPadrao.textoNegrito}>
          Total Empenhado: {formatarMoeda(totalEmpenhado)}
        </Text>
      </View>,
    ],
  })
}

/**
 * Seção 5: Alterações Contratuais
 */
const renderizarSecaoAlteracoes = (contrato: ContratoRelatorio) => {
  if (!contrato.alteracoes || contrato.alteracoes.length === 0) {
    return renderizarSecao({
      titulo: 'ALTERAÇÕES CONTRATUAIS',
      numeracao: '5.',
      children: (
        <Text style={estilosPadrao.textoSecundario}>
          Nenhuma alteração registrada para este contrato.
        </Text>
      ),
    })
  }

  return renderizarSecao({
    titulo: 'ALTERAÇÕES CONTRATUAIS',
    numeracao: '5.',
    children: contrato.alteracoes.map((alteracao, index) => (
      <View key={index} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={estilosPadrao.textoNegrito}>{alteracao.tipo}</Text>
          <Text style={estilosPadrao.textoPequeno}>
            {formatarData(alteracao.data)}
          </Text>
        </View>
        <Text style={{ ...estilosPadrao.texto, marginTop: 4 }}>
          {alteracao.descricao}
        </Text>
        {alteracao.valor && (
          <Text style={estilosPadrao.textoPequeno}>
            Valor: {formatarMoeda(alteracao.valor)}
          </Text>
        )}
        {index < contrato.alteracoes.length - 1 && renderizarDivisor()}
      </View>
    )),
  })
}

/**
 * Seção 6: Documentação
 */
const renderizarSecaoDocumentos = (contrato: ContratoRelatorio) => {
  if (!contrato.documentos || contrato.documentos.length === 0) {
    return renderizarSecao({
      titulo: 'DOCUMENTAÇÃO',
      numeracao: '6.',
      children: (
        <Text style={estilosPadrao.textoSecundario}>
          Nenhum documento registrado.
        </Text>
      ),
    })
  }

  const colunas: ColunaTabela[] = [
    { chave: 'descricao', titulo: 'Documento', largura: '50%' },
    {
      chave: 'entregue',
      titulo: 'Status',
      largura: '20%',
      alinhamento: 'center',
      formatador: (val) => (val ? '✓ Entregue' : '✗ Pendente'),
    },
    {
      chave: 'dataEntrega',
      titulo: 'Data',
      largura: '30%',
      formatador: (val) => (val ? formatarData(val) : '-'),
    },
  ]

  const totalEntregues = contrato.documentos.filter((d) => d.entregue).length
  const percentualConclusao =
    (totalEntregues / contrato.documentos.length) * 100

  return renderizarSecao({
    titulo: 'DOCUMENTAÇÃO',
    numeracao: '6.',
    children: [
      renderizarTabela({
        colunas,
        dados: contrato.documentos,
        zebrada: true,
      }),
      <View key="status" style={{ marginTop: 8 }}>
        <Text style={estilosPadrao.texto}>
          <Text style={{ fontWeight: 'bold' }}>Status: </Text>
          {totalEntregues} de {contrato.documentos.length} documentos entregues
          ({formatarPercentual(percentualConclusao)})
        </Text>
      </View>,
    ],
  })
}

/**
 * Seção 7: Unidades e Responsáveis
 */
const renderizarSecaoResponsaveis = (contrato: ContratoRelatorio) => {
  return renderizarSecao({
    titulo: 'UNIDADES E RESPONSÁVEIS',
    numeracao: '7.',
    children: [
      <View key="unidades">
        <Text style={estilosPadrao.label}>UNIDADES</Text>
        {contrato.unidades.demandantePrincipal && (
          <Text style={estilosPadrao.texto}>
            <Text style={{ fontWeight: 'bold' }}>Demandante: </Text>
            {contrato.unidades.demandantePrincipal.nome}
          </Text>
        )}
        {contrato.unidades.gestoraPrincipal && (
          <Text style={estilosPadrao.texto}>
            <Text style={{ fontWeight: 'bold' }}>Gestora: </Text>
            {contrato.unidades.gestoraPrincipal.nome}
          </Text>
        )}
      </View>,
      renderizarDivisor(),
      <View key="gestores" style={{ marginTop: 8 }}>
        <Text style={estilosPadrao.label}>GESTORES DO CONTRATO</Text>
        {contrato.responsaveis.gestores.length > 0 ? (
          contrato.responsaveis.gestores.map((gestor, idx) => (
            <Text key={idx} style={estilosPadrao.texto}>
              • {gestor.nome}
              {gestor.cargo && ` - ${gestor.cargo}`}
              {gestor.matricula && ` (Mat: ${gestor.matricula})`}
            </Text>
          ))
        ) : (
          <Text style={estilosPadrao.textoSecundario}>
            Nenhum gestor designado
          </Text>
        )}
      </View>,
      renderizarDivisor(),
      <View key="fiscais" style={{ marginTop: 8 }}>
        <Text style={estilosPadrao.label}>FISCAIS DO CONTRATO</Text>
        {contrato.responsaveis.fiscais.length > 0 ? (
          contrato.responsaveis.fiscais.map((fiscal, idx) => (
            <Text key={idx} style={estilosPadrao.texto}>
              • {fiscal.nome}
              {fiscal.cargo && ` - ${fiscal.cargo}`}
              {fiscal.matricula && ` (Mat: ${fiscal.matricula})`}
            </Text>
          ))
        ) : (
          <Text style={estilosPadrao.textoSecundario}>
            Nenhum fiscal designado
          </Text>
        )}
      </View>,
    ],
  })
}

/**
 * Seção: Resumo Executivo Consolidado
 */
const renderizarSecaoResumoExecutivo = (contratos: ContratoRelatorio[]) => {
  // Calcular totalizações
  const totalGlobal = contratos.reduce((sum, c) => sum + c.valores.global, 0)
  const totalEmpenhado = contratos.reduce((sum, c) => sum + c.valores.empenhado, 0)
  const totalSaldo = contratos.reduce((sum, c) => sum + c.valores.saldo, 0)
  const percentualExecutado = totalGlobal > 0 ? (totalEmpenhado / totalGlobal) * 100 : 0

  // Contadores de status
  const statusCounts = contratos.reduce(
    (acc, c) => {
      const status = c.status.toLowerCase()
      if (status === 'ativo') acc.vigentes++
      else if (status === 'vencendo') acc.vencendo++
      else if (status === 'vencido') acc.vencidos++
      else acc.outros++
      return acc
    },
    { vigentes: 0, vencendo: 0, vencidos: 0, outros: 0 },
  )

  return renderizarSecao({
    titulo: 'RESUMO EXECUTIVO',
    numeracao: '1.',
    children: [
      // Cards de Totalizações Financeiras
      <View
        key="cards-financeiros"
        style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#f0f9ff',
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>
            VALOR GLOBAL TOTAL
          </Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
            {formatarMoeda(totalGlobal)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#f0fdf4',
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>
            VALOR EMPENHADO
          </Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
            {formatarMoeda(totalEmpenhado)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fefce8',
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>
            SALDO TOTAL
          </Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
            {formatarMoeda(totalSaldo)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#f5f3ff',
            padding: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>
            % EXECUTADO
          </Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
            {formatarPercentual(percentualExecutado)}
          </Text>
        </View>
      </View>,
      // Status dos Contratos
      <View key="status-info" style={{ marginTop: 8 }}>
        <Text style={estilosPadrao.textoPequeno}>
          <Text style={{ fontWeight: 'bold' }}>Status: </Text>
          {statusCounts.vigentes} vigentes
          {statusCounts.vencendo > 0 && `, ${statusCounts.vencendo} vencendo`}
          {statusCounts.vencidos > 0 && `, ${statusCounts.vencidos} vencidos`}
          {statusCounts.outros > 0 && `, ${statusCounts.outros} outros`}
        </Text>
      </View>,
    ],
  })
}

/**
 * Tabela Consolidada de Contratos
 */
const renderizarTabelaConsolidada = (contratos: ContratoRelatorio[]) => {
  // Debug: Logar dados dos contratos
  console.log('🎨 Renderizando tabela consolidada com contratos:', contratos.length)
  contratos.forEach((c, index) => {
    console.log(`📄 Contrato ${index + 1}:`, {
      numeroContrato: c.numeroContrato,
      contratada: c.contratada,
      contratadaRazaoSocial: c.contratada?.razaoSocial,
    })
  })

  // Transformar dados para ter chaves únicas
  const dadosTransformados = contratos.map((c) => {
    const razaoSocial = c.contratada?.razaoSocial || 'Não informado'
    console.log(`🔄 Transformando ${c.numeroContrato} - Razão Social: "${razaoSocial}"`)

    return {
      numeroContrato: c.numeroContrato,
      contratadaNome: truncarTexto(razaoSocial, 40),
      valorGlobal: formatarMoeda(c.valores.global),
      valorEmpenhado: formatarMoeda(c.valores.empenhado),
      valorSaldo: formatarMoeda(c.valores.saldo),
      percentualExec: formatarPercentual(c.valores.percentualExecutado),
      status: c.status,
    }
  })

  console.log('✅ Dados transformados para tabela:', dadosTransformados)

  const colunas: ColunaTabela[] = [
    { chave: 'numeroContrato', titulo: 'Contrato', largura: '12%' },
    { chave: 'contratadaNome', titulo: 'Contratada', largura: '23%' },
    {
      chave: 'valorGlobal',
      titulo: 'Valor Global',
      largura: '13%',
      alinhamento: 'right',
    },
    {
      chave: 'valorEmpenhado',
      titulo: 'Empenhado',
      largura: '13%',
      alinhamento: 'right',
    },
    {
      chave: 'valorSaldo',
      titulo: 'Saldo',
      largura: '13%',
      alinhamento: 'right',
    },
    {
      chave: 'percentualExec',
      titulo: 'Exec %',
      largura: '10%',
      alinhamento: 'center',
    },
    {
      chave: 'status',
      titulo: 'Status',
      largura: '16%',
      alinhamento: 'center',
    },
  ]

  return renderizarSecao({
    titulo: 'CONTRATOS SELECIONADOS',
    numeracao: '2.',
    children: renderizarTabela({
      colunas,
      dados: dadosTransformados,
      zebrada: true,
    }),
  })
}

export default GerarRelatorioExecucao
