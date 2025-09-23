import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TabelaFornecedores } from '../tabela-fornecedores'
import type {
  Fornecedor,
  PaginacaoParamsFornecedor,
} from '../../types/fornecedor'

// Mock do store
vi.mock('../../store/fornecedores-store', () => ({
  useFornecedoresStore: vi.fn(() => ({
    fornecedoresSelecionados: [],
    selecionarFornecedor: vi.fn(),
    selecionarTodosFornecedores: vi.fn(),
  })),
}))

// Mock do framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    tr: ({ children, ...props }: React.ComponentProps<'tr'>) => (
      <tr {...props}>{children}</tr>
    ),
    td: ({ children, ...props }: React.ComponentProps<'td'>) => (
      <td {...props}>{children}</td>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock do DropdownMenu para garantir que o conteúdo seja renderizado
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <div onClick={onClick} role="menuitem">
      {children}
    </div>
  ),
}))

const mockFornecedores: Fornecedor[] = [
  {
    id: '1',
    razaoSocial: 'Empresa Teste LTDA',
    cnpj: '11222333000181',
    contratosAtivos: 5,
    status: 'ativo',
    valorTotalContratos: 150000.0,
    endereco: {
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234-567',
    },
    contato: {
      telefone: '(11) 3333-4444',
      email: 'contato@empresa.com',
      responsavel: 'João Silva',
    },
    dataUltimaAtualizacao: '2024-01-15',
  },
  {
    id: '2',
    razaoSocial: 'Outra Empresa SA',
    cnpj: '22333444000192',
    contratosAtivos: 3,
    status: 'inativo',
    valorTotalContratos: 75000.0,
    endereco: {
      logradouro: 'Av. Outra',
      numero: '456',
      bairro: 'Vila Nova',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      cep: '20000-000',
    },
    contato: {
      telefone: '(21) 4444-5555',
      email: 'contato@outra.com',
      responsavel: 'Maria Santos',
    },
    dataUltimaAtualizacao: '2024-01-10',
  },
]

const mockPaginacao: PaginacaoParamsFornecedor = {
  pagina: 1,
  itensPorPagina: 10,
  total: 2,
}

const mockHandlers = {
  onPaginacaoChange: vi.fn(),
  onAbrirFornecedor: vi.fn(),
}

describe('TabelaFornecedores', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a tabela com fornecedores', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    expect(screen.getByText('Empresa Teste LTDA')).toBeInTheDocument()
    expect(screen.getByText('Outra Empresa SA')).toBeInTheDocument()

    // Verifica CNPJs (versão mobile e desktop)
    const cnpjs1 = screen.getAllByText('11.222.333/0001-81')
    expect(cnpjs1).toHaveLength(2)

    const cnpjs2 = screen.getAllByText('22.333.444/0001-92')
    expect(cnpjs2).toHaveLength(2)
  })

  it('deve exibir informações corretas dos fornecedores', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    // Verifica dados do primeiro fornecedor
    expect(screen.getByText('Empresa Teste LTDA')).toBeInTheDocument()

    const cnpjs1 = screen.getAllByText('11.222.333/0001-81')
    expect(cnpjs1).toHaveLength(2)

    const contratos1 = screen.getAllByText('5')
    expect(contratos1).toHaveLength(2)

    const valores1 = screen.getAllByText('R$ 150.000,00')
    expect(valores1).toHaveLength(2)

    const enderecos1 = screen.getAllByText('São Paulo - SP')
    expect(enderecos1).toHaveLength(2)

    // Verifica dados do segundo fornecedor
    expect(screen.getByText('Outra Empresa SA')).toBeInTheDocument()

    const cnpjs2 = screen.getAllByText('22.333.444/0001-92')
    expect(cnpjs2).toHaveLength(2)

    const contratos2 = screen.getAllByText('3')
    expect(contratos2).toHaveLength(2)

    const valores2 = screen.getAllByText('R$ 75.000,00')
    expect(valores2).toHaveLength(2)

    const enderecos2 = screen.getAllByText('Rio de Janeiro - RJ')
    expect(enderecos2).toHaveLength(2)
  })

  it('deve exibir badges de status corretos', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    const statusAtivo = screen.getAllByText('Ativo')
    expect(statusAtivo).toHaveLength(2) // Versão mobile e desktop

    const statusInativo = screen.getAllByText('Inativo')
    expect(statusInativo).toHaveLength(2) // Versão mobile e desktop
  })

  it('deve exibir informações de endereço quando disponíveis', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    const enderecos1 = screen.getAllByText('São Paulo - SP')
    expect(enderecos1).toHaveLength(2) // Versão mobile e desktop

    const enderecos2 = screen.getAllByText('Rio de Janeiro - RJ')
    expect(enderecos2).toHaveLength(2) // Versão mobile e desktop
  })

  it('deve exibir mensagem quando não há fornecedores', () => {
    render(
      <TabelaFornecedores
        fornecedores={[]}
        paginacao={{ ...mockPaginacao, total: 0 }}
        {...mockHandlers}
      />,
    )

    // Quando não há fornecedores, o componente não exibe mensagem específica
    // Apenas mostra "0 fornecedores encontrados" no header
    expect(screen.getByText('0 fornecedores encontrados')).toBeInTheDocument()
  })

  it('deve exibir informações de paginação corretas', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    // O componente mostra "Mostrando 1 a 2 de 2 fornecedores"
    expect(
      screen.getByText('Mostrando 1 a 2 de 2 fornecedores'),
    ).toBeInTheDocument()
  })

  it('deve chamar onAbrirFornecedor ao clicar no botão abrir', async () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    const botoesAbrir = screen.getAllByLabelText('Abrir fornecedor')
    expect(botoesAbrir).toHaveLength(4) // 2 fornecedores × 2 versões (mobile + desktop)

    fireEvent.click(botoesAbrir[0])

    await waitFor(() => {
      expect(mockHandlers.onAbrirFornecedor).toHaveBeenCalledWith(
        mockFornecedores[0],
      )
    })
  })

  it('deve chamar onAbrirFornecedor ao clicar no menu de ações', async () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    // Encontra e clica na opção "Abrir" do dropdown (com o mock, ela está sempre visível)
    const opcoesAbrir = screen.getAllByText('Abrir')
    expect(opcoesAbrir).toHaveLength(4) // 2 fornecedores × 2 versões (mobile + desktop)

    fireEvent.click(opcoesAbrir[0])

    await waitFor(() => {
      expect(mockHandlers.onAbrirFornecedor).toHaveBeenCalledWith(
        mockFornecedores[0],
      )
    })
  })

  it('deve formatar valores monetários corretamente', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    const valoresMonetarios = screen.getAllByText('R$ 150.000,00')
    expect(valoresMonetarios).toHaveLength(2) // Versão mobile e desktop

    const valoresMonetarios2 = screen.getAllByText('R$ 75.000,00')
    expect(valoresMonetarios2).toHaveLength(2) // Versão mobile e desktop
  })

  it('deve formatar CNPJ corretamente', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    const cnpjs = screen.getAllByText('11.222.333/0001-81')
    expect(cnpjs).toHaveLength(2) // Versão mobile e desktop

    const cnpjs2 = screen.getAllByText('22.333.444/0001-92')
    expect(cnpjs2).toHaveLength(2) // Versão mobile e desktop
  })

  it('deve exibir endereço formatado corretamente', () => {
    render(
      <TabelaFornecedores
        fornecedores={mockFornecedores}
        paginacao={mockPaginacao}
        {...mockHandlers}
      />,
    )

    const enderecos1 = screen.getAllByText('São Paulo - SP')
    expect(enderecos1).toHaveLength(2) // Versão mobile e desktop

    const enderecos2 = screen.getAllByText('Rio de Janeiro - RJ')
    expect(enderecos2).toHaveLength(2) // Versão mobile e desktop
  })
})
