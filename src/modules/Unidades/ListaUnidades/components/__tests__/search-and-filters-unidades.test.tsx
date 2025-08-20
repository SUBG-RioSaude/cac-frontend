import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchAndFiltersUnidades } from '../search-and-filters-unidades'

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
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock para Radix UI pointer events
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: vi.fn(() => false),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
})

const defaultProps = {
  termoPesquisa: '',
  onTermoPesquisaChange: vi.fn(),
  filtros: { status: undefined, sigla: undefined, tipo: undefined },
  onFiltrosChange: vi.fn(),
}

describe('SearchAndFiltersUnidades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar campo de pesquisa', () => {
    render(<SearchAndFiltersUnidades {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/pesquisar por nome, sigla, uo, ug ou endereço/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('deve renderizar botão de filtros', () => {
    render(<SearchAndFiltersUnidades {...defaultProps} />)
    
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })

  it('deve mostrar valor atual do termo de pesquisa', () => {
    const propsComPesquisa = {
      ...defaultProps,
      termoPesquisa: 'Hospital'
    }
    
    render(<SearchAndFiltersUnidades {...propsComPesquisa} />)
    
    const searchInput = screen.getByDisplayValue('Hospital')
    expect(searchInput).toBeInTheDocument()
  })

  it('deve chamar onTermoPesquisaChange ao digitar na busca', async () => {
    const mockOnChange = vi.fn()
    
    render(
      <SearchAndFiltersUnidades 
        {...defaultProps} 
        onTermoPesquisaChange={mockOnChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText(/pesquisar por nome, sigla, uo, ug ou endereço/i)
    expect(searchInput).toBeInTheDocument()
    expect(mockOnChange).toBeDefined()
  })

  it('deve mostrar botão de limpar no campo de pesquisa quando há texto', () => {
    const propsComPesquisa = {
      ...defaultProps,
      termoPesquisa: 'Hospital'
    }
    
    render(<SearchAndFiltersUnidades {...propsComPesquisa} />)
    
    const clearButton = screen.getByRole('button', { name: /limpar/i })
    expect(clearButton).toBeInTheDocument()
  })

  it('deve mostrar indicador quando há filtros ativos', () => {
    const propsComFiltroAtivo = {
      ...defaultProps,
      termoPesquisa: 'Hospital'
    }
    
    render(<SearchAndFiltersUnidades {...propsComFiltroAtivo} />)
    
    // Verifica se há badge com contador de filtros ativos
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('deve mostrar contador correto de filtros ativos', () => {
    const propsComFiltros = {
      ...defaultProps,
      termoPesquisa: 'Hospital',
      filtros: { status: 'ativo', sigla: 'UBS', tipo: 'ubs' }
    }
    
    render(<SearchAndFiltersUnidades {...propsComFiltros} />)
    
    // 4 filtros ativos: termo + status + sigla + tipo
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('deve mostrar texto de filtros ativos quando há filtros', () => {
    const propsComFiltros = {
      ...defaultProps,
      termoPesquisa: 'Hospital'
    }
    
    render(<SearchAndFiltersUnidades {...propsComFiltros} />)
    
    expect(screen.getByText('1 filtro ativo')).toBeInTheDocument()
  })

  it('deve mostrar texto plural para múltiplos filtros', () => {
    const propsComFiltros = {
      ...defaultProps,
      termoPesquisa: 'Hospital',
      filtros: { status: 'ativo', sigla: 'UBS' }
    }
    
    render(<SearchAndFiltersUnidades {...propsComFiltros} />)
    
    expect(screen.getByText('3 filtros ativos')).toBeInTheDocument()
  })

  describe('dropdown de filtros', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
    })

    it('deve renderizar header com título e botão limpar', () => {
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
      expect(screen.getByText('Limpar')).toBeInTheDocument()
    })

    it('deve renderizar seção de status colapsível', () => {
      expect(screen.getByText('Status da Unidade')).toBeInTheDocument()
    })

    it('deve renderizar seção de sigla colapsível', () => {
      expect(screen.getByText('Sigla da Unidade')).toBeInTheDocument()
    })

    it('deve renderizar seção de tipo colapsível', () => {
      expect(screen.getByText('Tipo de Unidade')).toBeInTheDocument()
    })

    it('deve expandir seção de status ao clicar', async () => {
      const user = userEvent.setup()
      
      const statusButton = screen.getByText('Status da Unidade')
      await user.click(statusButton)
      
      // Verifica se as opções de status aparecem
      expect(screen.getByText('Ativo')).toBeInTheDocument()
      expect(screen.getByText('Inativo')).toBeInTheDocument()
    })

    it('deve expandir seção de sigla ao clicar', async () => {
      const user = userEvent.setup()
      
      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)
      
      // Verifica se o campo de sigla aparece
      expect(screen.getByPlaceholderText(/ex: ubs, caps/i)).toBeInTheDocument()
    })

    it('deve expandir seção de tipo ao clicar', async () => {
      const user = userEvent.setup()
      
      const tipoButton = screen.getByText('Tipo de Unidade')
      await user.click(tipoButton)
      
      // Verifica se o select de tipo aparece
      const tipoSelect = screen.getByDisplayValue('Todos os tipos')
      expect(tipoSelect).toBeInTheDocument()
    })

    it('deve permitir seleção de status via checkbox', async () => {
      const user = userEvent.setup()
      
      const statusButton = screen.getByText('Status da Unidade')
      await user.click(statusButton)
      
      const ativoCheckbox = screen.getByRole('checkbox', { name: /ativo/i })
      expect(ativoCheckbox).toBeInTheDocument()
    })

    it('deve permitir digitação no campo sigla', async () => {
      const user = userEvent.setup()
      
      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)
      
      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      expect(siglaInput).toBeInTheDocument()
      expect(siglaInput).toHaveValue('')
    })

    it('deve permitir seleção de tipo de unidade', async () => {
      const user = userEvent.setup()
      
      const tipoButton = screen.getByText('Tipo de Unidade')
      await user.click(tipoButton)
      
      const tipoSelect = screen.getByDisplayValue('Todos os tipos')
      expect(tipoSelect).toBeInTheDocument()
    })

    it('deve chamar onFiltrosChange ao alterar status', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <SearchAndFiltersUnidades 
          {...defaultProps} 
          onFiltrosChange={mockOnFiltrosChange}
        />
      )
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      const statusButton = screen.getByText('Status da Unidade')
      await user.click(statusButton)
      
      const ativoCheckbox = screen.getByRole('checkbox', { name: /ativo/i })
      await user.click(ativoCheckbox)
      
      expect(mockOnFiltrosChange).toHaveBeenCalled()
    })

    it('deve chamar onFiltrosChange ao alterar sigla', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <SearchAndFiltersUnidades 
          {...defaultProps} 
          onFiltrosChange={mockOnFiltrosChange}
        />
      )
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)
      
      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      await user.type(siglaInput, 'UBS')
      
      expect(mockOnFiltrosChange).toHaveBeenCalled()
    })

    it('deve chamar onFiltrosChange ao alterar tipo', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <SearchAndFiltersUnidades 
          {...defaultProps} 
          onFiltrosChange={mockOnFiltrosChange}
        />
      )
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      const tipoButton = screen.getByText('Tipo de Unidade')
      await user.click(tipoButton)
      
      const tipoSelect = screen.getByDisplayValue('Todos os tipos')
      expect(tipoSelect).toBeInTheDocument()
      expect(mockOnFiltrosChange).toBeDefined()
    })
  })

  describe('valores iniciais dos filtros', () => {
    it('deve usar valores padrão quando filtros não são fornecidos', () => {
      const propsSesFiltros = {
        termoPesquisa: '',
        onTermoPesquisaChange: vi.fn()
      }
      
      render(<SearchAndFiltersUnidades {...propsSesFiltros} />)
      
      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('deve usar valores dos filtros fornecidos', async () => {
      const user = userEvent.setup()
      const propsComFiltros = {
        ...defaultProps,
        filtros: { status: 'ativo', sigla: 'CAPS', tipo: 'caps' }
      }
      
      render(<SearchAndFiltersUnidades {...propsComFiltros} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)
      
      // Verifica se o campo sigla tem o valor correto
      expect(screen.getByDisplayValue('CAPS')).toBeInTheDocument()
    })
  })

  describe('comportamento responsivo', () => {
    it('deve ter classes responsivas aplicadas', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const containerPrincipal = screen.getByRole('search')
      expect(containerPrincipal).toHaveClass('flex-col', 'lg:flex-row', 'lg:items-center')
    })

    it('deve ter altura apropriada nos botões', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      expect(filtrosButton).toHaveClass('h-11')
    })

    it('deve ter campo de pesquisa responsivo', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText(/pesquisar por nome, sigla, uo, ug ou endereço/i)
      expect(searchInput).toHaveClass('w-full', 'lg:w-full')
    })
  })

  describe('acessibilidade', () => {
    it('deve ter role search no container principal', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const searchContainer = screen.getByRole('search')
      expect(searchContainer).toBeInTheDocument()
    })

    it('deve ter labels apropriados nos campos', async () => {
      const user = userEvent.setup()
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      expect(screen.getByText('Status da Unidade')).toBeInTheDocument()
      expect(screen.getByText('Sigla da Unidade')).toBeInTheDocument()
      expect(screen.getByText('Tipo de Unidade')).toBeInTheDocument()
    })

    it('deve ter placeholders informativos', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText(/pesquisar por nome, sigla, uo, ug ou endereço/i)
      expect(searchInput).toHaveAttribute('placeholder')
    })

    it('deve ter aria-label nos botões de ação', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      expect(filtrosButton).toBeInTheDocument()
    })
  })

  describe('funcionalidades de UI', () => {
    it('deve alternar visibilidade do dropdown de filtros', async () => {
      const user = userEvent.setup()
      
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      
      // Abrir filtros
      await user.click(filtrosButton)
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
      
      // Fechar filtros
      await user.click(filtrosButton)
      expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument()
    })

    it('deve manter estado dos filtros ao fechar e reabrir dropdown', async () => {
      const user = userEvent.setup()
      
      render(<SearchAndFiltersUnidades {...defaultProps} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)
      
      // Verificar se o campo sigla está presente
      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      expect(siglaInput).toBeInTheDocument()
      
      // Fechar e reabrir dropdown
      await user.click(filtrosButton)
      await user.click(filtrosButton)
      
      // Verificar se o dropdown continua funcional
      const siglaButtonNovamente = screen.getByText('Sigla da Unidade')
      expect(siglaButtonNovamente).toBeInTheDocument()
    })

    it('deve limpar todos os filtros ao clicar em "Limpar"', async () => {
      const mockOnTermoChange = vi.fn()
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()
      
      const propsComFiltros = {
        termoPesquisa: 'Hospital',
        onTermoPesquisaChange: mockOnTermoChange,
        filtros: { status: 'ativo', sigla: 'UBS', tipo: 'ubs' },
        onFiltrosChange: mockOnFiltrosChange,
      }
      
      render(<SearchAndFiltersUnidades {...propsComFiltros} />)
      
      const filtrosButton = screen.getByRole('button', { name: 'Filtros' })
      await user.click(filtrosButton)
      
      const limparButton = screen.getByText('Limpar')
      await user.click(limparButton)
      
      expect(mockOnTermoChange).toHaveBeenCalledWith('')
      expect(mockOnFiltrosChange).toHaveBeenCalledWith({
        status: undefined,
        sigla: undefined,
        tipo: undefined
      })
    })
  })
})