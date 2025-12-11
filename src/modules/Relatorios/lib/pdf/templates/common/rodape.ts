/**
 * ==========================================
 * COMPONENTE DE RODAPÉ PARA PDF
 * ==========================================
 */

import { Text, View } from '@react-pdf/renderer'
import React from 'react'

import { estilosPadrao } from './estilos'

interface RodapeProps {
  numeroPagina: number
  totalPaginas: number
  textoAdicional?: string
}

/**
 * Renderiza rodapé com número de página
 */
export const renderizarRodape = ({
  numeroPagina,
  totalPaginas,
  textoAdicional,
}: RodapeProps) => {
  return React.createElement(
    View,
    {
      style: estilosPadrao.rodape,
      fixed: true, // Fixo em todas as páginas
    },
    // Texto esquerdo
    React.createElement(
      View,
      { style: { flex: 1 } },
      textoAdicional &&
        React.createElement(
          Text,
          { style: estilosPadrao.rodapeTexto },
          textoAdicional,
        ),
    ),
    // Número da página
    React.createElement(
      View,
      null,
      React.createElement(
        Text,
        { style: estilosPadrao.rodapeTexto },
        `Página ${numeroPagina} de ${totalPaginas}`,
      ),
    ),
  )
}

/**
 * Rodapé simples apenas com número de página
 */
export const renderizarRodapeSimples = (
  numeroPagina: number,
  totalPaginas: number,
) => {
  return React.createElement(
    View,
    {
      style: {
        ...estilosPadrao.rodape,
        justifyContent: 'center',
      },
      fixed: true,
    },
    React.createElement(
      Text,
      { style: estilosPadrao.rodapeTexto },
      `${numeroPagina} / ${totalPaginas}`,
    ),
  )
}
