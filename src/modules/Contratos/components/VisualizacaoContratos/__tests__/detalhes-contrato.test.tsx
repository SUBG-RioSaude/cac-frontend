import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/test-utils'
import { DetalhesContrato } from '../detalhes-contrato'
import { contratoDetalhadoMock } from '@/modules/Contratos/data/contratos-mock'

// Mock dos hooks de React Query
vi.mock('@/modules/Empresas/hooks/use-empresas', () => ({
  useEmpresa: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null
  }))
}))

vi.mock('@/modules/Unidades/hooks/use-unidades', () => ({
  useUnidadesByIds: vi.fn(() => ({
    data: {},
    isLoading: false,
    error: null
  }))
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
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Centralizado')).toBeInTheDocument()
  })

  it('deve exibir informações dos responsáveis na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se as informações dos responsáveis estão sendo exibidas
    expect(screen.getByText('Maria Silva Santos')).toBeInTheDocument()
    expect(screen.getByText('João Carlos Oliveira')).toBeInTheDocument()
    expect(screen.getByText('Ana Paula Costa')).toBeInTheDocument()
  })

  it('deve exibir informações de contato dos responsáveis na aba Visão Geral', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se os contatos dos responsáveis estão sendo exibidos
    expect(
      screen.getByText('maria.santos@prefeitura.gov.br'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('joao.oliveira@prefeitura.gov.br'),
    ).toBeInTheDocument()
    expect(screen.getByText('ana.costa@prefeitura.gov.br')).toBeInTheDocument()
  })

  it('deve exibir as abas disponíveis', () => {
    render(<DetalhesContrato contrato={contratoDetalhadoMock} />)

    // Verifica se as abas estão sendo exibidas
    expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    expect(screen.getByText('Fornecedor')).toBeInTheDocument()
    expect(screen.getByText('Unidades')).toBeInTheDocument()
  })
})
