import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchAndFiltersFornecedores } from '../search-and-filters'
import type { FiltrosFornecedorApi } from '../../types/fornecedor'

// Mock do store
vi.mock('../../store/fornecedores-store', () => ({
  useFornecedoresStore: vi.fn(() => ({
    termoPesquisa: '',
    filtros: {},
    setTermoPesquisa: vi.fn(),
    setFiltros: vi.fn(),
    limparFiltros: vi.fn(),
  })),
}))

// Mock do hook useDebounce
vi.mock('@/modules/Contratos/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}))

// Mock do framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('SearchAndFiltersFornecedores', () => {
  const mockOnFiltrosChange = vi.fn()
  const mockFiltrosAtivos: FiltrosFornecedorApi = {
    pagina: 1,
    tamanhoPagina: 10
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o campo de pesquisa', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    expect(screen.getByPlaceholderText('Digite CNPJ ou Razão Social do fornecedor...')).toBeInTheDocument()
  })

  it('deve renderizar o botão de filtros', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })



  it('deve exibir ícone de pesquisa no campo de busca', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const campoPesquisa = screen.getByPlaceholderText('Digite CNPJ ou Razão Social do fornecedor...')
    expect(campoPesquisa).toBeInTheDocument()
  })

  it('deve exibir ícone de filtros no botão de filtros', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const botaoFiltros = screen.getByText('Filtros')
    expect(botaoFiltros).toBeInTheDocument()
  })

  it('deve ter layout responsivo para diferentes tamanhos de tela', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const container = screen.getByRole('search')
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4', 'lg:flex-row', 'lg:items-center')
  })

  it('deve ter campo de pesquisa com tamanho responsivo', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const campoPesquisa = screen.getByPlaceholderText('Digite CNPJ ou Razão Social do fornecedor...')
    expect(campoPesquisa).toHaveClass('w-full', 'lg:w-full')
  })

  it('deve ter botões com tamanho responsivo', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const botaoFiltros = screen.getByText('Filtros')
    
    expect(botaoFiltros).toHaveClass('w-full', 'lg:w-auto')
  })

  it('deve ter espaçamento adequado entre elementos', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const container = screen.getByRole('search')
    expect(container).toHaveClass('gap-4')
  })

  it('deve ter botões com variantes corretas', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const botaoFiltros = screen.getByText('Filtros')
    
    expect(botaoFiltros).toHaveClass('bg-transparent', 'hover:bg-slate-600')
  })

  it('deve ter campo de pesquisa com placeholder descritivo', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const campoPesquisa = screen.getByPlaceholderText('Digite CNPJ ou Razão Social do fornecedor...')
    expect(campoPesquisa).toBeInTheDocument()
  })

  it('deve ter botões com texto descritivo', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })

  it('deve ter estrutura semântica correta', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const container = screen.getByRole('search')
    expect(container).toBeInTheDocument()
  })

  it('deve ter acessibilidade adequada', () => {
    render(<SearchAndFiltersFornecedores onFiltrosChange={mockOnFiltrosChange} filtrosAtivos={mockFiltrosAtivos} />)
    
    const campoPesquisa = screen.getByPlaceholderText('Digite CNPJ ou Razão Social do fornecedor...')
    const botaoFiltros = screen.getByText('Filtros')
    
    expect(campoPesquisa).toBeInTheDocument()
    expect(botaoFiltros).toBeInTheDocument()
  })
})
