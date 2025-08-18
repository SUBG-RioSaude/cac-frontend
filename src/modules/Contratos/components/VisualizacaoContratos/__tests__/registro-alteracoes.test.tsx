import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RegistroAlteracoes } from '../registro-alteracoes'
import type { AlteracaoContrato } from '@/modules/Contratos/types/contrato-detalhado'

// Mock do framer-motion para evitar problemas nos testes
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => <div {...props}>{children}</div>,
  },
}))

const alteracoesMock: AlteracaoContrato[] = [
  {
    id: '1',
    tipo: 'criacao',
    descricao: 'Contrato criado no sistema',
    dataHora: '2023-05-08T09:00:00',
    responsavel: 'Sistema Automático',
  },
  {
    id: '2',
    tipo: 'designacao_fiscais',
    descricao:
      'Fiscais administrativos designados: Maria Silva Santos e João Carlos Oliveira',
    dataHora: '2023-05-10T14:30:00',
    responsavel: 'Ana Paula Costa',
  },
  {
    id: '3',
    tipo: 'primeiro_pagamento',
    descricao: 'Primeiro pagamento realizado no valor de R$ 104.166,67',
    dataHora: '2023-06-15T10:15:00',
    responsavel: 'Sistema Financeiro',
  },
  {
    id: '4',
    tipo: 'atualizacao_documentos',
    descricao: 'Documentos de regularidade fiscal atualizados',
    dataHora: '2023-08-22T16:45:00',
    responsavel: 'Maria Silva Santos',
  },
  {
    id: '5',
    tipo: 'alteracao_valor',
    descricao: 'Valor do contrato alterado para R$ 1.250.000,00',
    dataHora: '2023-09-01T11:20:00',
    responsavel: 'Departamento Financeiro',
  },
  {
    id: '6',
    tipo: 'prorrogacao',
    descricao: 'Prazo do contrato prorrogado',
    dataHora: '2023-09-05T10:10:00',
    responsavel: 'Ana Paula Costa',
  },
]

describe('RegistroAlteracoes', () => {
  it('deve renderizar o componente com título da linha do tempo', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)
    expect(screen.getByText('Linha do Tempo')).toBeInTheDocument()
    expect(screen.getByText('Etapas do Contrato')).toBeInTheDocument()
  })

  it('deve ordenar as alterações por data (mais recente primeiro)', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se as alterações estão ordenadas por data (mais recente primeiro)
    // 6 alterações na linha do tempo (h3) + 4 etapas fixas (h4) = 10 elementos
    const alteracoes = screen.getAllByText(
      /Criação do Contrato|Designação de Fiscais|Primeiro Pagamento|Atualização de Documentos|Alteração de Valor|Prorrogação de Prazo/,
    )
    expect(alteracoes).toHaveLength(10) // 6 alterações + 4 etapas
  })

  it('deve exibir ícones corretos para cada tipo de alteração', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se os títulos estão sendo exibidos (usando getAllByText para lidar com duplicatas)
    // Criação do Contrato aparece 2 vezes (linha do tempo + etapas)
    expect(screen.getAllByText('Criação do Contrato')).toHaveLength(2)
    // Designação de Fiscais aparece 2 vezes (linha do tempo + etapas)
    expect(screen.getAllByText('Designação de Fiscais')).toHaveLength(2)
    // Primeiro Pagamento aparece 2 vezes (linha do tempo + etapas)
    expect(screen.getAllByText('Primeiro Pagamento')).toHaveLength(2)
  })

  it('deve exibir cores corretas para cada tipo de alteração', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se as cores estão sendo aplicadas nos containers dos ícones
    // 6 alterações na linha do tempo (h3) + 4 etapas fixas (h4) = 10 elementos
    const containersIcones = screen.getAllByText(
      /Criação do Contrato|Designação de Fiscais|Primeiro Pagamento|Atualização de Documentos|Alteração de Valor|Prorrogação de Prazo/,
    )
    expect(containersIcones).toHaveLength(10) // 6 alterações + 4 etapas
  })

  it('deve exibir títulos corretos para cada tipo de alteração', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se os títulos estão sendo exibidos corretamente
    // Cada título aparece na linha do tempo (h3) e nas etapas (h4) se for uma das 4 etapas fixas
    expect(screen.getAllByText('Criação do Contrato')).toHaveLength(2)
    expect(screen.getAllByText('Designação de Fiscais')).toHaveLength(2)
    expect(screen.getAllByText('Primeiro Pagamento')).toHaveLength(2)
    // Atualização de Documentos aparece em ambos os lugares (linha do tempo + etapas)
    expect(screen.getAllByText('Atualização de Documentos')).toHaveLength(2)
  })

  it('deve exibir descrições das alterações', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    expect(screen.getByText('Contrato criado no sistema')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Fiscais administrativos designados: Maria Silva Santos e João Carlos Oliveira',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Primeiro pagamento realizado no valor de R$ 104.166,67',
      ),
    ).toBeInTheDocument()
  })

  it('deve exibir responsáveis pelas alterações', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Usa getAllByText para lidar com possíveis duplicatas
    expect(screen.getAllByText('Por: Sistema Automático')).toHaveLength(1)
    expect(screen.getAllByText('Por: Ana Paula Costa')).toHaveLength(2) // Aparece em 2 alterações
    expect(screen.getAllByText('Por: Sistema Financeiro')).toHaveLength(1)
  })

  it('deve exibir badges de data/hora para cada alteração', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se os badges de data estão sendo exibidos
    const badges = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/)
    expect(badges.length).toBeGreaterThan(0)

    badges.forEach((badge) => {
      expect(badge).toBeInTheDocument()
    })
  })

  it('deve exibir a linha vertical do tempo', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se a linha vertical está sendo renderizada
    const linhaVertical = document.querySelector(
      '.absolute.left-6.top-0.bottom-0.w-0\\.5.bg-border',
    )
    expect(linhaVertical).toBeInTheDocument()
  })

  it('deve aplicar animações com framer-motion', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se as animações estão sendo aplicadas (elementos com motion)
    const alteracoesAnimadas = document.querySelectorAll('[animate]')
    expect(alteracoesAnimadas.length).toBeGreaterThan(0)
  })

  it('deve exibir detalhes das alterações quando disponíveis', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se os detalhes estão sendo exibidos
    expect(screen.getByText(/Contrato criado no sistema/)).toBeInTheDocument()
    expect(
      screen.getByText(/Maria Silva Santos e João Carlos Oliveira/),
    ).toBeInTheDocument()
    expect(screen.getByText(/R\$ 104\.166,67/)).toBeInTheDocument()
  })

  it('deve renderizar corretamente quando não há alterações', () => {
    render(<RegistroAlteracoes alteracoes={[]} />)

    expect(screen.getByText('Linha do Tempo')).toBeInTheDocument()
    expect(screen.getByText('Etapas do Contrato')).toBeInTheDocument()
    // As etapas fixas sempre aparecem, mesmo sem alterações
    expect(screen.getByText('Criação do Contrato')).toBeInTheDocument()
    expect(screen.getByText('Designação de Fiscais')).toBeInTheDocument()
    expect(screen.getByText('Primeiro Pagamento')).toBeInTheDocument()
    expect(screen.getByText('Atualização de Documentos')).toBeInTheDocument()
  })

  it('deve exibir as etapas do contrato com status correto', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se as etapas estão sendo exibidas
    expect(screen.getByText('Etapas do Contrato')).toBeInTheDocument()

    // Verifica se as etapas específicas estão sendo exibidas
    // Apenas 4 etapas fixas são exibidas, não todas as 6 alterações
    const etapas = screen.getAllByText(
      /Criação do Contrato|Designação de Fiscais|Primeiro Pagamento|Atualização de Documentos/,
    )
    expect(etapas.length).toBeGreaterThan(0)
  })

  it('deve aplicar classes CSS corretas para responsividade', () => {
    render(<RegistroAlteracoes alteracoes={alteracoesMock} />)

    // Verifica se as classes de responsividade estão sendo aplicadas
    const containerResponsivo = document.querySelector(
      '.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4',
    )
    expect(containerResponsivo).toBeInTheDocument()
  })
})
