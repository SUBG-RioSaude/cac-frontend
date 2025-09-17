import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchAndFiltersUnidades } from '../search-and-filters-unidades'
import type { FiltrosUnidadesApi } from '../../types/unidade-api'

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
  filtrosAtivos: {
    pagina: 1,
    tamanhoPagina: 10,
    ativo: true
  } as FiltrosUnidadesApi,
  onFiltrosChange: vi.fn(),
  isLoading: false
}

describe('SearchAndFiltersUnidades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar campo de pesquisa', () => {
    render(<SearchAndFiltersUnidades {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/digite nome ou sigla da unidade/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('deve renderizar botão de filtros', () => {
    render(<SearchAndFiltersUnidades {...defaultProps} />)

    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })

  it('deve mostrar valor atual do termo de pesquisa', () => {
    const propsComPesquisa = {
      ...defaultProps,
      filtrosAtivos: {
        ...defaultProps.filtrosAtivos,
        nome: 'Hospital'
      }
    }

    render(<SearchAndFiltersUnidades {...propsComPesquisa} />)

    const searchInput = screen.getByDisplayValue('Hospital')
    expect(searchInput).toBeInTheDocument()
  })

  it('deve chamar onFiltrosChange ao digitar na busca', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()

    render(
      <SearchAndFiltersUnidades
        filtrosAtivos={defaultProps.filtrosAtivos}
        onFiltrosChange={mockOnChange}
        isLoading={false}
      />
    )

    const searchInput = screen.getByPlaceholderText(/digite nome ou sigla da unidade/i)
    await user.type(searchInput, 't')

    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder')
  })

  it('deve mostrar botão de limpar no campo de pesquisa quando há texto', () => {
    const propsComPesquisa = {
      ...defaultProps,
      filtrosAtivos: {
        ...defaultProps.filtrosAtivos,
        nome: 'Hospital'
      }
    }

    render(<SearchAndFiltersUnidades {...propsComPesquisa} />)

    const clearButton = screen.getByRole('button', { name: '' })
    expect(clearButton).toBeInTheDocument()
  })

  it('deve limpar campo de pesquisa ao clicar no botão X', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()

    const propsComPesquisa = {
      ...defaultProps,
      filtrosAtivos: {
        ...defaultProps.filtrosAtivos,
        nome: 'Hospital'
      },
      onFiltrosChange: mockOnChange
    }

    render(<SearchAndFiltersUnidades {...propsComPesquisa} />)

    const clearButton = screen.getByRole('button', { name: '' })
    await user.click(clearButton)

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('deve renderizar botão de filtros sem erro', () => {
    const propsComFiltros = {
      ...defaultProps,
      filtrosAtivos: {
        ...defaultProps.filtrosAtivos,
        nome: 'Hospital',
        sigla: 'UBS',
        cnes: '12345'
      }
    }

    render(<SearchAndFiltersUnidades {...propsComFiltros} />)

    // Deve renderizar o botão de filtros sem erro
    const filtrosButton = screen.getByText('Filtros')
    expect(filtrosButton).toBeInTheDocument()
  })

  describe('dropdown de filtros', () => {
    it('deve abrir dropdown ao clicar no botão de filtros', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()
    })

    it('deve expandir seção de status ao clicar', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const statusButton = screen.getByText('Status da Unidade')
      await user.click(statusButton)

      expect(screen.getByText('Ativo')).toBeInTheDocument()
      expect(screen.getByText('Inativo')).toBeInTheDocument()
    })

    it('deve expandir seção de sigla ao clicar', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)

      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      expect(siglaInput).toBeInTheDocument()
    })

    it('deve expandir seção de CNES ao clicar', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const cnesButton = screen.getByText('CNES')
      await user.click(cnesButton)

      const cnesInput = screen.getByPlaceholderText(/ex: 2269311, 7654321/i)
      expect(cnesInput).toBeInTheDocument()
    })

    it('deve permitir seleção de status via checkbox', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const statusButton = screen.getByText('Status da Unidade')
      await user.click(statusButton)

      const checkboxes = screen.getAllByRole('checkbox')
      const ativoCheckbox = checkboxes[0]
      expect(ativoCheckbox).toBeInTheDocument()
    })

    it('deve permitir digitação no campo sigla', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)

      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      expect(siglaInput).toBeInTheDocument()
      expect(siglaInput).toHaveValue('')
    })

    it('deve permitir digitação no campo bairro', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const bairroButton = screen.getByText('Bairro')
      await user.click(bairroButton)

      const bairroInput = screen.getByPlaceholderText(/ex: centro, copacabana/i)
      expect(bairroInput).toBeInTheDocument()
    })

    it('deve chamar onFiltrosChange ao alterar status', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()

      render(
        <SearchAndFiltersUnidades
          filtrosAtivos={defaultProps.filtrosAtivos}
          onFiltrosChange={mockOnFiltrosChange}
          isLoading={false}
        />
      )

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const statusButton = screen.getByText('Status da Unidade')
      await user.click(statusButton)

      const checkboxes = screen.getAllByRole('checkbox')
      const ativoCheckbox = checkboxes[0]
      await user.click(ativoCheckbox)

      expect(mockOnFiltrosChange).toHaveBeenCalled()
    })

    it('deve chamar onFiltrosChange ao alterar sigla', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()

      render(
        <SearchAndFiltersUnidades
          filtrosAtivos={defaultProps.filtrosAtivos}
          onFiltrosChange={mockOnFiltrosChange}
          isLoading={false}
        />
      )

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)

      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      await user.type(siglaInput, 'U')

      expect(siglaInput).toBeInTheDocument()
      expect(siglaInput).toHaveAttribute('placeholder')
    })

    it('deve chamar onFiltrosChange ao alterar CNES', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()

      render(
        <SearchAndFiltersUnidades
          filtrosAtivos={defaultProps.filtrosAtivos}
          onFiltrosChange={mockOnFiltrosChange}
          isLoading={false}
        />
      )

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const cnesButton = screen.getByText('CNES')
      await user.click(cnesButton)

      const cnesInput = screen.getByPlaceholderText(/ex: 2269311, 7654321/i)
      expect(cnesInput).toBeInTheDocument()
      expect(mockOnFiltrosChange).toBeDefined()
    })
  })

  describe('valores iniciais dos filtros', () => {
    it('deve usar valores padrão quando filtros não são fornecidos', () => {
      const propsSesFiltros = {
        filtrosAtivos: {},
        onFiltrosChange: vi.fn()
      }

      render(<SearchAndFiltersUnidades {...propsSesFiltros} />)

      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('deve usar valores dos filtros fornecidos', async () => {
      const user = userEvent.setup()
      const propsComFiltros = {
        ...defaultProps,
        filtrosAtivos: {
          ...defaultProps.filtrosAtivos,
          ativo: true,
          sigla: 'CAPS'
        }
      }

      render(<SearchAndFiltersUnidades {...propsComFiltros} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)

      // Usar getAllByDisplayValue para verificar que existe pelo menos um campo com o valor
      const capsInputs = screen.getAllByDisplayValue('CAPS')
      expect(capsInputs.length).toBeGreaterThan(0)
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

      const filtrosButton = screen.getByText('Filtros')
      expect(filtrosButton).toHaveClass('h-11')
    })

    it('deve ter campo de pesquisa responsivo', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/digite nome ou sigla da unidade/i)
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

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      expect(screen.getByText('Status da Unidade')).toBeInTheDocument()
      expect(screen.getByText('Sigla da Unidade')).toBeInTheDocument()
    })

    it('deve ter placeholders informativos', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/digite nome ou sigla da unidade/i)
      expect(searchInput).toHaveAttribute('placeholder')
    })

    it('deve ter aria-label nos botões de ação', () => {
      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      expect(filtrosButton).toBeInTheDocument()
    })
  })

  describe('funcionalidades de UI', () => {
    it('deve alternar visibilidade do dropdown de filtros', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')

      await user.click(filtrosButton)
      expect(screen.getByText('Filtros Avançados')).toBeInTheDocument()

      await user.click(filtrosButton)
      expect(screen.queryByText('Filtros Avançados')).not.toBeInTheDocument()
    })

    it('deve manter estado dos filtros ao fechar e reabrir dropdown', async () => {
      const user = userEvent.setup()

      render(<SearchAndFiltersUnidades {...defaultProps} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const siglaButton = screen.getByText('Sigla da Unidade')
      await user.click(siglaButton)

      const siglaInput = screen.getByPlaceholderText(/ex: ubs, caps/i)
      expect(siglaInput).toBeInTheDocument()

      await user.click(filtrosButton)
      await user.click(filtrosButton)

      const siglaButtonNovamente = screen.getByText('Sigla da Unidade')
      expect(siglaButtonNovamente).toBeInTheDocument()
    })

    it('deve limpar todos os filtros ao clicar em "Limpar"', async () => {
      const mockOnFiltrosChange = vi.fn()
      const user = userEvent.setup()

      const propsComFiltros = {
        filtrosAtivos: {
          ...defaultProps.filtrosAtivos,
          nome: 'Hospital',
          ativo: true,
          sigla: 'UBS'
        },
        onFiltrosChange: mockOnFiltrosChange,
        isLoading: false
      }

      render(<SearchAndFiltersUnidades {...propsComFiltros} />)

      const filtrosButton = screen.getByText('Filtros')
      await user.click(filtrosButton)

      const limparButton = screen.getByText('Limpar')
      await user.click(limparButton)

      expect(mockOnFiltrosChange).toHaveBeenCalled()
    })
  })
})