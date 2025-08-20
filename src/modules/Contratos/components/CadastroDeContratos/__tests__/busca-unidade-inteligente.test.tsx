import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BuscaUnidadeInteligente from '../busca-unidade-inteligente'
import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'

// Mock dos dados de unidades
vi.mock('@/modules/Contratos/data/unidades.json', () => ({
  default: [
    {
      id: '1',
      nome: 'Hospital Albert Einstein',
      sigla: 'HAE',
      ug: '123456',
      cnpj: '12.345.678/0001-90',
      codigo: 'HAE001',
      endereco: 'Av. Albert Einstein, 627',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 2151-1234',
      email: 'contato@einstein.br'
    },
    {
      id: '2',
      nome: 'Hospital Sírio-Libanês',
      sigla: 'HSL',
      ug: '789012',
      cnpj: '98.765.432/0001-10',
      codigo: 'HSL001',
      endereco: 'Rua Dona Adma Jafet, 91',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 3394-5000',
      email: 'contato@siriolibanes.com.br'
    },
    {
      id: '3',
      nome: 'Hospital das Clínicas',
      sigla: 'HC',
      ug: '345678',
      cnpj: '45.678.901/0001-23',
      codigo: 'HC001',
      endereco: 'Av. Dr. Enéas de Carvalho Aguiar, 255',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 2661-0000',
      email: 'contato@hc.fm.usp.br'
    }
  ]
}))

const mockUnidade: UnidadeHospitalar = {
  id: '1',
  nome: 'Hospital Albert Einstein',
  sigla: 'HAE',
  ug: '123456',
  cnpj: '12.345.678/0001-90',
  codigo: 'HAE001',
  endereco: 'Av. Albert Einstein, 627',
  cidade: 'São Paulo',
  estado: 'SP',
  telefone: '(11) 2151-1234',
  email: 'contato@einstein.br'
}

const defaultProps = {
  onUnidadeSelecionada: vi.fn(),
  onLimpar: vi.fn()
}

describe('BuscaUnidadeInteligente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar o campo de busca inicialmente', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByLabelText('Buscar Unidade Hospitalar')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')).toBeInTheDocument()
      expect(screen.getByText('Digite pelo menos 2 caracteres para buscar')).toBeInTheDocument()
    })

    it('deve mostrar o ícone de busca', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de Busca', () => {
    it('deve iniciar busca após digitar 2 caracteres', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      // Aguardar o delay de 300ms
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        expect(screen.getByText('Hospital Sírio-Libanês')).toBeInTheDocument()
      })
    })

    it('deve mostrar indicador de carregamento durante a busca', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      // Deve mostrar carregamento imediatamente
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      // Aguardar o delay
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('deve filtrar por nome da unidade', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'Einstein' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        expect(screen.queryByText('Hospital Sírio-Libanês')).not.toBeInTheDocument()
      })
    })

    it('deve filtrar por sigla', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HSL' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Sírio-Libanês')).toBeInTheDocument()
        expect(screen.queryByText('Hospital Albert Einstein')).not.toBeInTheDocument()
      })
    })

    it('deve filtrar por UG', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: '123456' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        expect(screen.queryByText('Hospital Sírio-Libanês')).not.toBeInTheDocument()
      })
    })

    it('deve filtrar por CNPJ', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: '12.345.678' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        expect(screen.queryByText('Hospital Sírio-Libanês')).not.toBeInTheDocument()
      })
    })

    it('deve filtrar por código', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HAE001' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        expect(screen.queryByText('Hospital Sírio-Libanês')).not.toBeInTheDocument()
      })
    })

    it('deve mostrar mensagem quando nenhum resultado é encontrado', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'XYZ' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma unidade encontrada')).toBeInTheDocument()
        expect(screen.getByText('Tente buscar por UG, sigla, CNPJ ou nome da unidade')).toBeInTheDocument()
      })
    })

    it('deve mostrar contador de resultados quando há mais de 5 unidades', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'Hospital' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('3 unidades encontradas')).toBeInTheDocument()
      })
    })
  })

  describe('Seleção de Unidade', () => {
    it('deve permitir selecionar uma unidade da lista', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        const botaoUnidade = screen.getByText('Hospital Albert Einstein')
        fireEvent.click(botaoUnidade)
        
        expect(defaultProps.onUnidadeSelecionada).toHaveBeenCalledWith(expect.objectContaining({
          id: '1',
          nome: 'Hospital Albert Einstein',
          sigla: 'HAE'
        }))
      })
    })

    it('deve limpar o campo de busca após selecionar unidade', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        const botaoUnidade = screen.getByText('Hospital Albert Einstein')
        fireEvent.click(botaoUnidade)
        
        expect(inputBusca).toHaveValue('')
      })
    })

    it('deve ocultar resultados após selecionar unidade', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        
        const botaoUnidade = screen.getByText('Hospital Albert Einstein')
        fireEvent.click(botaoUnidade)
        
        expect(screen.queryByText('Hospital Albert Einstein')).not.toBeInTheDocument()
      })
    })
  })

  describe('Exibição de Unidade Selecionada', () => {
    it('deve mostrar unidade selecionada quando fornecida', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} unidadeSelecionada={mockUnidade} />)
      
      expect(screen.getByText('Unidade Selecionada')).toBeInTheDocument()
      expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
      expect(screen.getByText('HAE')).toBeInTheDocument()
      expect(screen.getByText('UG: 123456')).toBeInTheDocument()
      expect(screen.getByText('CNPJ: 12.345.678/0001-90')).toBeInTheDocument()
      expect(screen.getByText('São Paulo/SP')).toBeInTheDocument()
      expect(screen.getByText('(11) 2151-1234')).toBeInTheDocument()
    })

    it('deve mostrar botão para alterar unidade selecionada', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} unidadeSelecionada={mockUnidade} />)
      
      const botaoAlterar = screen.getByText('Alterar')
      expect(botaoAlterar).toBeInTheDocument()
    })

    it('deve chamar onLimpar quando botão alterar é clicado', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} unidadeSelecionada={mockUnidade} />)
      
      const botaoAlterar = screen.getByText('Alterar')
      fireEvent.click(botaoAlterar)
      
      expect(defaultProps.onLimpar).toHaveBeenCalledTimes(1)
    })

    it('deve mostrar ícone de check para unidade selecionada', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} unidadeSelecionada={mockUnidade} />)
      
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })
  })

  describe('Destaque de Texto', () => {
    it('deve destacar o termo de busca nos resultados', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'Einstein' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        const textoDestacado = screen.getByText((content, element) => {
          return element?.textContent?.includes('Einstein') && element.querySelector('mark') !== null
        })
        expect(textoDestacado).toBeInTheDocument()
      })
    })

    it('deve destacar múltiplos termos de busca', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'Hospital' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        const elementosDestacados = screen.getAllByText((content, element) => {
          return element?.querySelector('mark') !== null
        })
        expect(elementosDestacados.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Interações de Teclado e Mouse', () => {
    it('deve focar no campo de busca automaticamente', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      expect(inputBusca).toHaveFocus()
    })

    it('deve focar no campo de busca após limpar seleção', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} unidadeSelecionada={mockUnidade} />)
      
      const botaoAlterar = screen.getByText('Alterar')
      fireEvent.click(botaoAlterar)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      expect(inputBusca).toHaveFocus()
    })

    it('deve fechar resultados ao clicar fora do componente', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Albert Einstein')).toBeInTheDocument()
        
        // Simular clique fora
        fireEvent.mouseDown(document.body)
        
        expect(screen.queryByText('Hospital Albert Einstein')).not.toBeInTheDocument()
      })
    })
  })

  describe('Estados de Carregamento', () => {
    it('deve mostrar spinner durante busca', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      
      // Deve mostrar carregamento imediatamente
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      // Aguardar o delay
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('deve cancelar busca anterior quando novo termo é digitado', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      
      // Primeira busca
      fireEvent.change(inputBusca, { target: { value: 'HA' } })
      vi.advanceTimersByTime(100)
      
      // Segunda busca (deve cancelar a primeira)
      fireEvent.change(inputBusca, { target: { value: 'HSL' } })
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Hospital Sírio-Libanês')).toBeInTheDocument()
        expect(screen.queryByText('Hospital Albert Einstein')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsividade e Layout', () => {
    it('deve aplicar classes responsivas corretas', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const container = screen.getByTestId('busca-unidade-inteligente')
      expect(container).toHaveClass('relative', 'space-y-4')
    })

    it('deve limitar altura máxima dos resultados', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'Hospital' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        const containerResultados = screen.getByText('Hospital Albert Einstein').closest('.max-h-80')
        expect(containerResultados).toBeInTheDocument()
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter label associado ao campo de busca', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByLabelText('Buscar Unidade Hospitalar')
      expect(inputBusca).toBeInTheDocument()
    })

    it('deve ter placeholder descritivo', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      expect(inputBusca).toBeInTheDocument()
    })

    it('deve ter texto de ajuda', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByText('Digite pelo menos 2 caracteres para buscar')).toBeInTheDocument()
    })

    it('deve ter botões com texto descritivo', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} unidadeSelecionada={mockUnidade} />)
      
      const botaoAlterar = screen.getByText('Alterar')
      expect(botaoAlterar).toBeInTheDocument()
    })
  })

  describe('Casos Extremos', () => {
    it('deve lidar com busca vazia', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: '' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.queryByText('Hospital Albert Einstein')).not.toBeInTheDocument()
      })
    })

    it('deve lidar com busca de um caractere', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(inputBusca, { target: { value: 'H' } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.queryByText('Hospital Albert Einstein')).not.toBeInTheDocument()
      })
    })

    it('deve lidar com termos de busca muito longos', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const inputBusca = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      const termoLongo = 'a'.repeat(100)
      fireEvent.change(inputBusca, { target: { value: termoLongo } })
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma unidade encontrada')).toBeInTheDocument()
      })
    })
  })
})
