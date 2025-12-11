/**
 * ==========================================
 * COMPONENTE DE SEÇÃO PARA PDF
 * ==========================================
 */

import { Text, View } from '@react-pdf/renderer'
import React from 'react'

import { estilosPadrao, CORES } from './estilos'

interface SecaoProps {
  titulo: string
  children: React.ReactNode | React.ReactNode[]
  numeracao?: string // Ex: "1.", "2.1"
  comFundo?: boolean
  comBorda?: boolean
}

/**
 * Renderiza seção com título
 */
export const renderizarSecao = ({
  titulo,
  children,
  numeracao,
  comFundo = false,
  comBorda = false,
}: SecaoProps) => {
  let estiloSecao = estilosPadrao.secao

  if (comFundo) {
    estiloSecao = estilosPadrao.secaoComFundo
  } else if (comBorda) {
    estiloSecao = estilosPadrao.secaoComBorda
  }

  return React.createElement(
    View,
    { style: estiloSecao },
    // Título da seção
    React.createElement(
      Text,
      { style: estilosPadrao.tituloSecao },
      numeracao ? `${numeracao} ${titulo}` : titulo,
    ),
    // Conteúdo
    ...(Array.isArray(children) ? children : [children]),
  )
}

/**
 * Renderiza subseção (título menor)
 */
export const renderizarSubsecao = (titulo: string, children: React.ReactNode) => {
  return React.createElement(
    View,
    { style: { marginBottom: 12 } },
    React.createElement(
      Text,
      {
        style: {
          fontSize: 11,
          fontWeight: 'bold',
          color: CORES.texto,
          marginBottom: 6,
        },
      },
      titulo,
    ),
    children,
  )
}

/**
 * Renderiza card de informação destacada
 */
export const renderizarCard = (titulo: string, conteudo: React.ReactNode) => {
  return React.createElement(
    View,
    { style: estilosPadrao.cardDestaque },
    React.createElement(
      Text,
      {
        style: {
          fontSize: 10,
          fontWeight: 'bold',
          color: CORES.primaria,
          marginBottom: 4,
        },
      },
      titulo,
    ),
    conteudo,
  )
}

/**
 * Renderiza grupo de informações (2 colunas)
 */
export const renderizarGrupoInfo = (
  items: Array<{ label: string; valor: string }>,
) => {
  return React.createElement(
    View,
    { style: estilosPadrao.grid2Colunas },
    ...items.map((item, index) =>
      React.createElement(
        View,
        {
          key: index,
          style: {
            ...estilosPadrao.coluna50,
            marginBottom: 8,
          },
        },
        React.createElement(
          Text,
          { style: estilosPadrao.label },
          item.label,
        ),
        React.createElement(
          Text,
          { style: estilosPadrao.valor },
          item.valor,
        ),
      ),
    ),
  )
}

/**
 * Renderiza lista com marcadores
 */
export const renderizarLista = (items: string[]) => {
  return React.createElement(
    View,
    { style: estilosPadrao.lista },
    ...items.map((item, index) =>
      React.createElement(
        View,
        {
          key: index,
          style: estilosPadrao.itemLista,
        },
        React.createElement(
          Text,
          { style: estilosPadrao.marcadorLista },
          '•',
        ),
        React.createElement(
          Text,
          { style: estilosPadrao.conteudoLista },
          item,
        ),
      ),
    ),
  )
}

/**
 * Renderiza divisor de seção
 */
export const renderizarDivisor = (grosso = false) => {
  return React.createElement(View, {
    style: grosso ? estilosPadrao.divisorGrosso : estilosPadrao.divisor,
  })
}
