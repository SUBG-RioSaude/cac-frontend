/**
 * ==========================================
 * COMPONENTE DE CABEÇALHO PARA PDF
 * ==========================================
 */

import { Text, View, Image } from '@react-pdf/renderer'
import React from 'react'

import { estilosPadrao, CORES } from './estilos'
import { formatarDataHora } from '../../pdf-utils'

interface CabecalhoProps {
  titulo: string
  subtitulo?: string
  dataGeracao: string
  emitidoPor?: string
}

/**
 * Renderiza cabeçalho padrão do relatório
 * Layout: Barra azul full-width no topo com logos juntas à esquerda
 */
export const renderizarCabecalho = ({
  titulo,
  subtitulo,
  dataGeracao,
  emitidoPor,
}: CabecalhoProps) => {
  return React.createElement(
    View,
    {
      style: {
        width: '100%',
        marginBottom: 20,
      },
    },
    // Barra azul superior full-width (com margens negativas para compensar padding da página)
    React.createElement(
      View,
      {
        style: {
          backgroundColor: CORES.primaria,
          marginLeft: -40, // Compensa padding da página
          marginRight: -40, // Compensa padding da página
          width: undefined, // Remove width fixo
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 70, // 40 (margem negativa) + 30 (padding desejado)
          paddingRight: 70, // 40 (margem negativa) + 30 (padding desejado)
        },
      },
      // Container de conteúdo
      React.createElement(
        View,
        {
          style: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        },
        // Lado esquerdo: Logos juntas
        React.createElement(
          View,
          {
            style: {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            },
          },
          React.createElement(Image, {
            src: '/logo certa.png',
            style: { width: 'auto', height: 35, objectFit: 'contain' },
          }),
          React.createElement(Image, {
            src: '/sus_logo.png',
            style: { width: 'auto', height: 35, objectFit: 'contain' },
          }),
        ),
        // Lado direito: Título e informações
        React.createElement(
          View,
          {
            style: {
              flex: 1,
              alignItems: 'flex-end',
              marginLeft: 20,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontSize: 11,
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'right',
              },
            },
            titulo,
          ),
          subtitulo &&
            React.createElement(
              Text,
              {
                style: {
                  fontSize: 8,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: 2,
                  textAlign: 'right',
                },
              },
              subtitulo,
            ),
        ),
      ),
    ),
    // Linha de informações abaixo da barra azul
    React.createElement(
      View,
      {
        style: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: 30,
          paddingRight: 30,
          paddingTop: 8,
          borderBottom: `1pt solid ${CORES.bordaClara}`,
          paddingBottom: 8,
        },
      },
      emitidoPor &&
        React.createElement(
          Text,
          {
            style: {
              fontSize: 7,
              color: CORES.textoClaro,
            },
          },
          `Emitido por: ${emitidoPor}`,
        ),
      React.createElement(
        Text,
        {
          style: {
            fontSize: 7,
            color: CORES.textoClaro,
          },
        },
        `Gerado em: ${formatarDataHora(dataGeracao)}`,
      ),
    ),
  )
}

/**
 * Cabeçalho simples sem borda
 */
export const renderizarCabecalhoSimples = (titulo: string) => {
  return React.createElement(
    View,
    { style: { marginBottom: 16 } },
    React.createElement(
      Text,
      {
        style: {
          fontSize: 16,
          fontWeight: 'bold',
          color: CORES.primaria,
        },
      },
      titulo,
    ),
  )
}
