/**
 * ==========================================
 * COMPONENTE DE TABELA PARA PDF
 * ==========================================
 */

import { Text, View } from '@react-pdf/renderer'
import React from 'react'

import { estilosPadrao, CORES } from './estilos'

export interface ColunaTabela {
  chave: string
  titulo: string
  largura?: string | number // Ex: '30%', 100
  alinhamento?: 'left' | 'center' | 'right'
  formatador?: (valor: any) => string
}

interface TabelaProps {
  colunas: ColunaTabela[]
  dados: Record<string, any>[]
  mostrarCabecalho?: boolean
  zebrada?: boolean
}

/**
 * Renderiza tabela completa
 */
export const renderizarTabela = ({
  colunas,
  dados,
  mostrarCabecalho = true,
  zebrada = false,
}: TabelaProps) => {
  return React.createElement(
    View,
    { style: estilosPadrao.tabela },
    // Cabeçalho
    mostrarCabecalho &&
      React.createElement(
        View,
        { style: estilosPadrao.tabelaCabecalho },
        ...colunas.map((coluna) =>
          React.createElement(
            View,
            {
              key: coluna.chave,
              style: {
                ...estilosPadrao.tabelaCelulaCabecalho,
                width: coluna.largura || `${100 / colunas.length}%`,
                textAlign: coluna.alinhamento || 'left',
              },
            },
            React.createElement(Text, null, coluna.titulo),
          ),
        ),
      ),
    // Linhas de dados
    ...dados.map((linha, index) =>
      React.createElement(
        View,
        {
          key: index,
          style: {
            ...(index === dados.length - 1
              ? estilosPadrao.tabelaLinhaUltima
              : estilosPadrao.tabelaLinha),
            backgroundColor:
              zebrada && index % 2 === 1 ? CORES.fundoClaro : CORES.branco,
          },
        },
        ...colunas.map((coluna) => {
          const valor = linha[coluna.chave]
          const textoFormatado = coluna.formatador
            ? coluna.formatador(valor)
            : String(valor ?? '')

          return React.createElement(
            View,
            {
              key: `${index}-${coluna.chave}`,
              style: {
                ...estilosPadrao.tabelaCelula,
                width: coluna.largura || `${100 / colunas.length}%`,
                textAlign: coluna.alinhamento || 'left',
              },
            },
            React.createElement(Text, null, textoFormatado),
          )
        }),
      ),
    ),
  )
}

/**
 * Renderiza tabela de 2 colunas (label-valor)
 */
export const renderizarTabelaLabelValor = (
  dados: Array<{ label: string; valor: string | number }>,
) => {
  return React.createElement(
    View,
    { style: estilosPadrao.tabela },
    ...dados.map((item, index) =>
      React.createElement(
        View,
        {
          key: index,
          style:
            index === dados.length - 1
              ? estilosPadrao.tabelaLinhaUltima
              : estilosPadrao.tabelaLinha,
        },
        // Label
        React.createElement(
          View,
          {
            style: {
              ...estilosPadrao.tabelaCelula,
              width: '60%',
              fontWeight: 'bold',
            },
          },
          React.createElement(Text, null, item.label),
        ),
        // Valor
        React.createElement(
          View,
          {
            style: {
              ...estilosPadrao.tabelaCelula,
              width: '40%',
              textAlign: 'right',
            },
          },
          React.createElement(Text, null, String(item.valor)),
        ),
      ),
    ),
  )
}

/**
 * Renderiza tabela simples sem bordas
 */
export const renderizarTabelaSimples = (
  dados: Array<{ label: string; valor: string | number }>,
) => {
  return React.createElement(
    View,
    { style: { marginVertical: 8 } },
    ...dados.map((item, index) =>
      React.createElement(
        View,
        {
          key: index,
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
          },
        },
        React.createElement(
          Text,
          {
            style: {
              fontSize: 10,
              color: CORES.textoClaro,
            },
          },
          item.label,
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: 10,
              fontWeight: 'bold',
              color: CORES.texto,
            },
          },
          String(item.valor),
        ),
      ),
    ),
  )
}
