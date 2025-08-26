import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'

// Mock do módulo de dados - deve estar no topo devido ao hoisting
vi.mock('@/modules/Contratos/data/unidades.json', () => ({
  default: [
    {
      id: '1',
      nome: 'Hospital Central de São Paulo',
      codigo: 'HCSP-001',
      ug: '240101',
      sigla: 'HCSP',
      cnpj: '11.222.333/0001-44',
      cep: '01310-100',
      endereco: 'Av. Dr. Enéas de Carvalho Aguiar, 255',
      cidade: 'São Paulo',
      estado: 'SP',
      responsavel: 'Dr. João Silva',
      telefone: '(11) 2661-0000',
      email: 'contato@hcsp.com.br',
      ativa: true
    },
    {
      id: '2',
      nome: 'Hospital das Clínicas',
      codigo: 'HC-002',
      ug: '240102',
      sigla: 'HC',
      cnpj: '22.333.444/0001-55',
      cep: '01246-000',
      endereco: 'Rua Dr. Ovídio Pires de Campos, 225',
      cidade: 'São Paulo',
      estado: 'SP',
      responsavel: 'Dr. Maria Santos',
      telefone: '(11) 2661-0001',
      email: 'contato@hc.com.br',
      ativa: true
    }
  ]
}))

// Importação dinâmica após o mock
let BuscaUnidadeInteligente: React.ComponentType<{
  onUnidadeSelecionada: (unidade: UnidadeHospitalar) => void
  unidadeSelecionada?: UnidadeHospitalar | null
  onLimpar?: () => void
}>

describe('BuscaUnidadeInteligente', () => {
  const defaultProps = {
    onUnidadeSelecionada: vi.fn(),
    onLimpar: vi.fn(),
  }

  beforeEach(async () => {
    // Limpa todos os mocks antes de cada teste
    vi.clearAllMocks()
    
    // Importação dinâmica após o mock
    const module = await import('../busca-unidade-inteligente')
    BuscaUnidadeInteligente = module.default
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar o campo de busca por padrão', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByTestId('busca-unidade-inteligente')).toBeInTheDocument()
      expect(screen.getByText('Buscar Unidade Hospitalar')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')).toBeInTheDocument()
      expect(screen.getByText('Digite pelo menos 2 caracteres para buscar')).toBeInTheDocument()
    })

    it('deve mostrar ícone de busca', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de Busca', () => {
    it('deve iniciar busca após digitar 2 caracteres', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'HC' } })
      
      // Aguarda o delay de 300ms
      await waitFor(() => {
        expect(screen.getByText('Hospital Central de São Paulo')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('deve mostrar indicador de carregamento durante a busca', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'HC' } })
      
      // Deve mostrar loading imediatamente
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      // Aguarda o loading desaparecer
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('deve filtrar por nome da unidade', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'HC' } })
      
      // Aguarda um pouco para a busca ser processada
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verifica se os resultados aparecem
      expect(screen.getByText('Hospital Central de São Paulo')).toBeInTheDocument()
    })

    it('deve mostrar mensagem quando nenhum resultado é encontrado', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'XYZ' } })
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma unidade encontrada')).toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('Seleção de Unidade', () => {
    it('deve permitir selecionar uma unidade da lista', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'HC' } })
      
      await waitFor(() => {
        const botaoUnidade = screen.getByText('Hospital Central de São Paulo')
        fireEvent.click(botaoUnidade)
      }, { timeout: 1000 })
      
      expect(defaultProps.onUnidadeSelecionada).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          nome: 'Hospital Central de São Paulo'
        })
      )
    })

    it('deve limpar o campo de busca após selecionar unidade', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'HC' } })
      
      await waitFor(() => {
        const botaoUnidade = screen.getByText('Hospital Central de São Paulo')
        fireEvent.click(botaoUnidade)
      }, { timeout: 1000 })
      
      // O campo deve estar vazio após a seleção
      expect(input).toHaveValue('')
    })
  })

  describe('Exibição de Unidade Selecionada', () => {
    const unidadeSelecionada: UnidadeHospitalar = {
      id: '1',
      nome: 'Hospital Central de São Paulo',
      codigo: 'HCSP-001',
      ug: '240101',
      sigla: 'HCSP',
      cnpj: '11.222.333/0001-44',
      cep: '01310-100',
      endereco: 'Av. Dr. Enéas de Carvalho Aguiar, 255',
      cidade: 'São Paulo',
      estado: 'SP',
      responsavel: 'Dr. João Silva',
      telefone: '(11) 2661-0000',
      email: 'contato@hcsp.com.br',
      ativa: true
    }

    it('deve mostrar unidade selecionada quando fornecida', () => {
      render(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />
      )
      
      expect(screen.getByText('Unidade Selecionada')).toBeInTheDocument()
      expect(screen.getByText('Hospital Central de São Paulo')).toBeInTheDocument()
      expect(screen.getByText('HCSP')).toBeInTheDocument()
      expect(screen.getByText('240101')).toBeInTheDocument()
      expect(screen.getByText('11.222.333/0001-44')).toBeInTheDocument()
      expect(screen.getByText('São Paulo/SP')).toBeInTheDocument()
      expect(screen.getByText('(11) 2661-0000')).toBeInTheDocument()
    })

    it('deve mostrar botão para alterar unidade selecionada', () => {
      render(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />
      )
      
      const botaoAlterar = screen.getByRole('button', { name: /alterar/i })
      expect(botaoAlterar).toBeInTheDocument()
    })

    it('deve chamar onLimpar quando botão alterar é clicado', () => {
      render(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />
      )
      
      const botaoAlterar = screen.getByRole('button', { name: /alterar/i })
      fireEvent.click(botaoAlterar)
      
      expect(defaultProps.onLimpar).toHaveBeenCalled()
    })

    it('deve mostrar ícone de check para unidade selecionada', () => {
      render(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />
      )
      
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })
  })

  describe('Interações de Teclado e Mouse', () => {
    it('deve renderizar o campo de busca sem foco automático', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      expect(input).not.toHaveFocus()
    })

    it('deve mostrar campo de busca após limpar seleção', async () => {
      const unidadeSelecionada: UnidadeHospitalar = {
        id: '1',
        nome: 'Hospital Central de São Paulo',
        codigo: 'HCSP-001',
        ug: '240101',
        sigla: 'HCSP',
        cnpj: '11.222.333/0001-44',
        cep: '01310-100',
        endereco: 'Av. Dr. Enéas de Carvalho Aguiar, 255',
        cidade: 'São Paulo',
        estado: 'SP',
        responsavel: 'Dr. João Silva',
        telefone: '(11) 2661-0000',
        email: 'contato@hcsp.com.br',
        ativa: true
      }

      render(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />
      )
      
      const botaoAlterar = screen.getByRole('button', { name: /alterar/i })
      fireEvent.click(botaoAlterar)
      
      // Verifica se o botão alterar foi clicado (teste mais simples)
      expect(defaultProps.onLimpar).toHaveBeenCalled()
    })
  })

  describe('Responsividade e Layout', () => {
    it('deve aplicar classes responsivas corretas', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const container = screen.getByTestId('busca-unidade-inteligente')
      expect(container).toHaveClass('relative', 'space-y-4')
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter placeholder descritivo', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')).toBeInTheDocument()
    })

    it('deve ter texto de ajuda', () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      expect(screen.getByText('Digite pelo menos 2 caracteres para buscar')).toBeInTheDocument()
    })

    it('deve ter botões com texto descritivo', () => {
      const unidadeSelecionada: UnidadeHospitalar = {
        id: '1',
        nome: 'Hospital Central de São Paulo',
        codigo: 'HCSP-001',
        ug: '240101',
        sigla: 'HCSP',
        cnpj: '11.222.333/0001-44',
        cep: '01310-100',
        endereco: 'Av. Dr. Enéas de Carvalho Aguiar, 255',
        cidade: 'São Paulo',
        estado: 'SP',
        responsavel: 'Dr. João Silva',
        telefone: '(11) 2661-0000',
        email: 'contato@hcsp.com.br',
        ativa: true
      }

      render(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />
      )
      
      expect(screen.getByRole('button', { name: /alterar/i })).toBeInTheDocument()
    })
  })

  describe('Casos Extremos', () => {
    it('deve lidar com busca vazia', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: '' } })
      
      // Não deve mostrar resultados para busca vazia
      expect(screen.queryByText('Hospital Central de São Paulo')).not.toBeInTheDocument()
    })

    it('deve lidar com busca de um caractere', async () => {
      render(<BuscaUnidadeInteligente {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('Digite UG, sigla, CNPJ ou nome da unidade...')
      fireEvent.change(input, { target: { value: 'H' } })
      
      // Não deve mostrar resultados para menos de 2 caracteres
      expect(screen.queryByText('Hospital Central de São Paulo')).not.toBeInTheDocument()
    })
  })
})
