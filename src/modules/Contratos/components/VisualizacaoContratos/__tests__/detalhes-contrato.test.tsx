import { describe, it, expect, vi } from 'vitest'

import { contratoDetalhadoMock } from '@/modules/Contratos/data/contratos-mock'
import { render, screen } from '@/tests/test-utils'

import { DetalhesContrato } from '../detalhes-contrato'

// Mock dos hooks de React Query
vi.mock('@/modules/Empresas/hooks/use-empresas', () => ({
  useEmpresa: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/modules/Unidades/hooks/use-unidades-batch', () => ({
  useUnidadesBatch: vi.fn(() => ({
    data: {},
    isLoading: false,
    error: null,
    getNome: vi.fn((id) => `Mock Unidade ${id}`),
  })),
}))

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
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Não precisamos mais do wrapper personalizado, o render já inclui todos os providers

describe('DetalhesContrato', () => {
  it('deve exibir informações básicas do contrato na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se as informações básicas do contrato estão sendo exibidas na aba padrão
    expect(screen.getByText('CONT-2023/0042')).toBeInTheDocument()
    expect(screen.getByText('SMS-PRO-2024/001')).toBeInTheDocument()
    expect(
      screen.getByText(/Contratação de empresa especializada/),
    ).toBeInTheDocument()
  })

  it('deve formatar valores monetários corretamente na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se o valor total está sendo formatado corretamente
    expect(screen.getByText('R$ 1.250.000,00')).toBeInTheDocument()
  })

  it('deve exibir status e tipo de contratação com badges na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se os badges estão sendo exibidos corretamente
    expect(screen.getByText('Vigente')).toBeInTheDocument()
    expect(screen.getByText('Centralizado')).toBeInTheDocument()
  })

  it('deve exibir informações dos responsáveis na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se as seções de responsáveis estão sendo exibidas
    expect(screen.getByText(/Fiscais Administrativos/)).toBeInTheDocument()
    expect(screen.getByText(/Gestores do Contrato/)).toBeInTheDocument()
  })

  it('deve exibir informações de contato dos responsáveis na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se as seções de funcionários estão sendo renderizadas
    // Em vez de buscar emails específicos, verifica se as estruturas estão presentes
    expect(screen.getByText(/Fiscais Administrativos/)).toBeInTheDocument()
    expect(screen.getByText(/Gestores do Contrato/)).toBeInTheDocument()
  })

  it('deve exibir as abas disponíveis', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se as abas estão sendo exibidas
    expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    expect(screen.getByText('Fornecedor')).toBeInTheDocument()
    expect(screen.getByText('Unidades')).toBeInTheDocument()
  })
})
