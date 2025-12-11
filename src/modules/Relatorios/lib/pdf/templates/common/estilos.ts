/**
 * ==========================================
 * ESTILOS PADRONIZADOS PARA PDF
 * ==========================================
 * Estilos reutilizáveis para templates @react-pdf/renderer
 */

import { StyleSheet } from '@react-pdf/renderer'

// ========== CORES DA MARCA CAC ==========

export const CORES = {
  // Principais (Identidade CAC)
  primaria: '#2a688f', // Azul escuro profissional (Primary)
  secundaria: '#42b9eb', // Azul claro vibrante (Secondary)
  texto: '#1e293b', // slate-800
  textoClaro: '#64748b', // slate-500
  textoMuitoClaro: '#94a3b8', // slate-400

  // Variações de azul CAC
  azulEscuro: '#1c4f6a', // Azul navy
  azulMedio: '#5ac8fa', // Azul médio
  azulClaro: '#7dd3fc', // Azul sky

  // Estados
  sucesso: '#10b981', // green-500
  aviso: '#f59e0b', // amber-500
  erro: '#ef4444', // red-500
  info: '#42b9eb', // Azul claro CAC

  // Fundo
  branco: '#ffffff',
  fundoClaro: '#f8fafc', // slate-50
  fundoMedio: '#f1f5f9', // slate-100
  borda: '#e2e8f0', // slate-200
  bordaClara: '#f1f5f9', // slate-100

  // Status de contratos (usando cores CAC)
  ativo: '#42b9eb', // Azul claro CAC
  vencendo: '#f59e0b', // Amber
  vencido: '#ef4444', // Red
  suspenso: '#6b7280', // Gray
  encerrado: '#9ca3af', // Gray light
}

// ========== FONTES ==========

export const FONTES = {
  tamanhos: {
    titulo: 18,
    subtitulo: 14,
    secao: 12,
    corpo: 10,
    pequeno: 8,
    muitoPequeno: 7,
  },
  pesos: {
    normal: 'normal',
    negrito: 'bold',
  },
}

// ========== ESPAÇAMENTOS ==========

export const ESPACAMENTOS = {
  // Margens da página
  margemPagina: {
    superior: 40,
    inferior: 40,
    esquerda: 40,
    direita: 40,
  },

  // Espaçamentos internos
  secao: 16,
  elemento: 8,
  linha: 4,
  pequeno: 2,
}

// ========== ESTILOS BASE ==========

export const estilosPadrao = StyleSheet.create({
  // Página
  pagina: {
    padding: ESPACAMENTOS.margemPagina.superior,
    backgroundColor: CORES.branco,
    fontFamily: 'Helvetica',
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.texto,
  },

  // Página com cabeçalho full-width (sem padding superior)
  paginaComCabecalhoFullWidth: {
    paddingTop: 0,
    paddingBottom: ESPACAMENTOS.margemPagina.inferior,
    paddingLeft: ESPACAMENTOS.margemPagina.esquerda,
    paddingRight: ESPACAMENTOS.margemPagina.direita,
    backgroundColor: CORES.branco,
    fontFamily: 'Helvetica',
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.texto,
  },

  // Containers
  container: {
    flex: 1,
  },

  linha: {
    flexDirection: 'row',
  },

  coluna: {
    flexDirection: 'column',
  },

  // Títulos
  titulo: {
    fontSize: FONTES.tamanhos.titulo,
    fontWeight: FONTES.pesos.negrito,
    color: CORES.primaria,
    marginBottom: ESPACAMENTOS.elemento,
  },

  subtitulo: {
    fontSize: FONTES.tamanhos.subtitulo,
    fontWeight: FONTES.pesos.negrito,
    color: CORES.texto,
    marginBottom: ESPACAMENTOS.elemento,
  },

  tituloSecao: {
    fontSize: FONTES.tamanhos.secao,
    fontWeight: FONTES.pesos.negrito,
    color: CORES.texto,
    marginBottom: ESPACAMENTOS.elemento,
    marginTop: ESPACAMENTOS.secao,
  },

  // Seções
  secao: {
    marginBottom: ESPACAMENTOS.secao,
  },

  secaoComBorda: {
    marginBottom: ESPACAMENTOS.secao,
    padding: ESPACAMENTOS.elemento,
    border: `1pt solid ${CORES.borda}`,
    borderRadius: 4,
  },

  secaoComFundo: {
    marginBottom: ESPACAMENTOS.secao,
    padding: ESPACAMENTOS.elemento,
    backgroundColor: CORES.fundoClaro,
    borderRadius: 4,
  },

  // Texto
  texto: {
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.texto,
    lineHeight: 1.5,
  },

  textoNegrito: {
    fontSize: FONTES.tamanhos.corpo,
    fontWeight: FONTES.pesos.negrito,
    color: CORES.texto,
  },

  textoSecundario: {
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.textoClaro,
  },

  textoPequeno: {
    fontSize: FONTES.tamanhos.pequeno,
    color: CORES.textoClaro,
  },

  textoMuitoPequeno: {
    fontSize: FONTES.tamanhos.muitoPequeno,
    color: CORES.textoMuitoClaro,
  },

  // Labels e valores
  label: {
    fontSize: FONTES.tamanhos.pequeno,
    color: CORES.textoClaro,
    marginBottom: ESPACAMENTOS.pequeno,
    textTransform: 'uppercase',
  },

  valor: {
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.texto,
    fontWeight: FONTES.pesos.negrito,
  },

  // Tabelas (base)
  tabela: {
    marginTop: ESPACAMENTOS.elemento,
    marginBottom: ESPACAMENTOS.elemento,
    border: `1pt solid ${CORES.borda}`,
    borderRadius: 4,
  },

  tabelaLinha: {
    flexDirection: 'row',
    borderBottom: `1pt solid ${CORES.borda}`,
  },

  tabelaLinhaUltima: {
    flexDirection: 'row',
  },

  tabelaCabecalho: {
    flexDirection: 'row',
    backgroundColor: CORES.fundoMedio,
    borderBottom: `1pt solid ${CORES.borda}`,
    fontWeight: FONTES.pesos.negrito,
  },

  tabelaCelula: {
    padding: ESPACAMENTOS.elemento,
    fontSize: FONTES.tamanhos.pequeno,
  },

  tabelaCelulaCabecalho: {
    padding: ESPACAMENTOS.elemento,
    fontSize: FONTES.tamanhos.pequeno,
    fontWeight: FONTES.pesos.negrito,
    color: CORES.texto,
  },

  // Cards de informação
  card: {
    padding: ESPACAMENTOS.elemento,
    border: `1pt solid ${CORES.borda}`,
    borderRadius: 4,
    marginBottom: ESPACAMENTOS.elemento,
  },

  cardDestaque: {
    padding: ESPACAMENTOS.elemento,
    backgroundColor: CORES.fundoClaro,
    borderLeft: `3pt solid ${CORES.primaria}`,
    marginBottom: ESPACAMENTOS.elemento,
  },

  // Badges e indicadores
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: FONTES.tamanhos.muitoPequeno,
    fontWeight: FONTES.pesos.negrito,
  },

  badgeSucesso: {
    backgroundColor: CORES.sucesso,
    color: CORES.branco,
  },

  badgeAviso: {
    backgroundColor: CORES.aviso,
    color: CORES.branco,
  },

  badgeErro: {
    backgroundColor: CORES.erro,
    color: CORES.branco,
  },

  badgeInfo: {
    backgroundColor: CORES.info,
    color: CORES.branco,
  },

  badgeNeutro: {
    backgroundColor: CORES.fundoMedio,
    color: CORES.texto,
  },

  // Dividers
  divisor: {
    borderBottom: `1pt solid ${CORES.borda}`,
    marginVertical: ESPACAMENTOS.elemento,
  },

  divisorGrosso: {
    borderBottom: `2pt solid ${CORES.borda}`,
    marginVertical: ESPACAMENTOS.secao,
  },

  // Listas
  lista: {
    marginLeft: ESPACAMENTOS.elemento,
  },

  itemLista: {
    flexDirection: 'row',
    marginBottom: ESPACAMENTOS.linha,
  },

  marcadorLista: {
    width: 12,
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.primaria,
  },

  conteudoLista: {
    flex: 1,
    fontSize: FONTES.tamanhos.corpo,
    color: CORES.texto,
  },

  // Grid (2 colunas)
  grid2Colunas: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.elemento,
  },

  coluna50: {
    width: '48%',
  },

  // Grid (3 colunas)
  grid3Colunas: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.elemento,
  },

  coluna33: {
    width: '31%',
  },

  // Cabeçalho
  cabecalho: {
    marginBottom: ESPACAMENTOS.secao * 2,
    borderBottom: `2pt solid ${CORES.primaria}`,
    paddingBottom: ESPACAMENTOS.elemento,
  },

  cabecalhoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Rodapé
  rodape: {
    position: 'absolute',
    bottom: ESPACAMENTOS.margemPagina.inferior,
    left: ESPACAMENTOS.margemPagina.esquerda,
    right: ESPACAMENTOS.margemPagina.direita,
    borderTop: `1pt solid ${CORES.borda}`,
    paddingTop: ESPACAMENTOS.elemento,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rodapeTexto: {
    fontSize: FONTES.tamanhos.pequeno,
    color: CORES.textoClaro,
  },

  // Imagens
  imagem: {
    maxWidth: '100%',
    objectFit: 'contain',
  },

  imagemPequena: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },

  imagemMedia: {
    width: 120,
    height: 120,
    objectFit: 'contain',
  },

  imagemGrande: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'contain',
  },

  // Gráficos
  grafico: {
    width: '100%',
    marginVertical: ESPACAMENTOS.elemento,
  },

  graficoMedio: {
    width: '100%',
    height: 200,
    marginVertical: ESPACAMENTOS.elemento,
  },

  graficoGrande: {
    width: '100%',
    height: 300,
    marginVertical: ESPACAMENTOS.elemento,
  },

  // Alertas
  alerta: {
    padding: ESPACAMENTOS.elemento,
    borderRadius: 4,
    marginBottom: ESPACAMENTOS.elemento,
    flexDirection: 'row',
    gap: ESPACAMENTOS.linha,
  },

  alertaInfo: {
    backgroundColor: '#dbeafe', // blue-100
    border: `1pt solid ${CORES.info}`,
  },

  alertaAviso: {
    backgroundColor: '#fef3c7', // amber-100
    border: `1pt solid ${CORES.aviso}`,
  },

  alertaErro: {
    backgroundColor: '#fee2e2', // red-100
    border: `1pt solid ${CORES.erro}`,
  },

  alertaSucesso: {
    backgroundColor: '#dcfce7', // green-100
    border: `1pt solid ${CORES.sucesso}`,
  },

  // Utilitários
  centralizar: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centralizarTexto: {
    textAlign: 'center',
  },

  alinharDireita: {
    textAlign: 'right',
  },

  espacamentoSuperior: {
    marginTop: ESPACAMENTOS.elemento,
  },

  espacamentoInferior: {
    marginBottom: ESPACAMENTOS.elemento,
  },

  semEspacamento: {
    margin: 0,
    padding: 0,
  },
})

// ========== HELPER: APLICAR COR DINÂMICA ==========

export const obterCorStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ativo: CORES.ativo,
    vigente: CORES.ativo,
    vencendo: CORES.vencendo,
    vencido: CORES.vencido,
    suspenso: CORES.suspenso,
    encerrado: CORES.encerrado,
  }

  return statusMap[status.toLowerCase()] || CORES.textoClaro
}
