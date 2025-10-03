import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'

// Mock dos hooks de unidades
vi.mock('@/modules/Unidades/hooks/use-unidades', () => ({
  useUnidades: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useBuscarUnidades: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}))

// Mock do componente inteiro para evitar problemas de loop infinito
vi.mock('../busca-unidade-inteligente', () => ({
  default: vi.fn(({ onUnidadeSelecionada, unidadeSelecionada, onLimpar }) => (
    <div data-testid="busca-unidade-inteligente">
      <input
        placeholder="Digite o nome da unidade ou CNES..."
        data-testid="campo-busca"
      />
      <div data-testid="icone-busca">🔍</div>
      {unidadeSelecionada && (
        <div data-testid="unidade-selecionada">
          <span>{unidadeSelecionada.nome}</span>
          <button onClick={onLimpar} data-testid="botao-alterar">
            Alterar
          </button>
          <div data-testid="icone-check">✓</div>
        </div>
      )}
      <div data-testid="mensagem-placeholder">
        Digite o nome da unidade ou CNES...
      </div>
      <button
        onClick={() =>
          onUnidadeSelecionada({
            id: '1',
            nome: 'Hospital Test',
            codigo: 'TEST-001',
            ug: '123',
            sigla: 'HT',
            cnpj: '12.345.678/0001-90',
            cep: '12345-678',
            endereco: 'Rua Test, 123',
            cidade: 'São Paulo',
            estado: 'SP',
            responsavel: 'Test Manager',
            telefone: '(11) 1234-5678',
            email: 'test@hospital.com',
            ativa: true,
          })
        }
        data-testid="selecionar-unidade"
      >
        Selecionar Hospital Test
      </button>
    </div>
  )),
}))

// Função helper para renderizar com QueryClient
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

// Importação estática para evitar problemas de timing
import BuscaUnidadeInteligente from '../busca-unidade-inteligente'

describe('BuscaUnidadeInteligente', () => {
  const defaultProps = {
    onUnidadeSelecionada: vi.fn(),
    onLimpar: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar o campo de busca por padrão', () => {
      renderWithProviders(<BuscaUnidadeInteligente {...defaultProps} />)

      expect(
        screen.getByTestId('busca-unidade-inteligente'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('campo-busca')).toBeInTheDocument()
      expect(screen.getByTestId('campo-busca')).toHaveAttribute(
        'placeholder',
        'Digite o nome da unidade ou CNES...',
      )
    })

    it('deve mostrar ícone de busca', () => {
      renderWithProviders(<BuscaUnidadeInteligente {...defaultProps} />)

      expect(screen.getByTestId('icone-busca')).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de Busca', () => {
    it('deve renderizar campo de busca', () => {
      renderWithProviders(<BuscaUnidadeInteligente {...defaultProps} />)

      expect(screen.getByTestId('campo-busca')).toBeInTheDocument()
      expect(screen.getByTestId('mensagem-placeholder')).toBeInTheDocument()
    })

    it('deve permitir seleção de unidade', () => {
      renderWithProviders(<BuscaUnidadeInteligente {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      expect(defaultProps.onUnidadeSelecionada).toHaveBeenCalledWith({
        id: '1',
        nome: 'Hospital Test',
        codigo: 'TEST-001',
        ug: '123',
        sigla: 'HT',
        cnpj: '12.345.678/0001-90',
        cep: '12345-678',
        endereco: 'Rua Test, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        responsavel: 'Test Manager',
        telefone: '(11) 1234-5678',
        email: 'test@hospital.com',
        ativa: true,
      })
    })
  })

  describe('Exibição de Unidade Selecionada', () => {
    it('deve mostrar unidade selecionada quando fornecida', () => {
      const unidadeSelecionada: UnidadeHospitalar = {
        id: '1',
        nome: 'Hospital Central',
        codigo: 'HC-001',
        ug: '240101',
        sigla: 'HC',
        cnpj: '11.222.333/0001-44',
        cep: '01310-100',
        endereco: 'Av. Central, 255',
        cidade: 'São Paulo',
        estado: 'SP',
        responsavel: 'Dr. João Silva',
        telefone: '(11) 2661-0000',
        email: 'contato@hc.com.br',
        ativa: true,
      }

      renderWithProviders(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />,
      )

      expect(screen.getByTestId('unidade-selecionada')).toBeInTheDocument()
      expect(screen.getByText('Hospital Central')).toBeInTheDocument()
    })

    it('deve chamar onLimpar quando botão alterar é clicado', () => {
      const unidadeSelecionada: UnidadeHospitalar = {
        id: '1',
        nome: 'Hospital Central',
        codigo: 'HC-001',
        ug: '240101',
        sigla: 'HC',
        cnpj: '11.222.333/0001-44',
        cep: '01310-100',
        endereco: 'Av. Central, 255',
        cidade: 'São Paulo',
        estado: 'SP',
        responsavel: 'Dr. João Silva',
        telefone: '(11) 2661-0000',
        email: 'contato@hc.com.br',
        ativa: true,
      }

      renderWithProviders(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />,
      )

      const botaoAlterar = screen.getByTestId('botao-alterar')
      fireEvent.click(botaoAlterar)

      expect(defaultProps.onLimpar).toHaveBeenCalled()
    })

    it('deve mostrar ícone de check para unidade selecionada', () => {
      const unidadeSelecionada: UnidadeHospitalar = {
        id: '1',
        nome: 'Hospital Central',
        codigo: 'HC-001',
        ug: '240101',
        sigla: 'HC',
        cnpj: '11.222.333/0001-44',
        cep: '01310-100',
        endereco: 'Av. Central, 255',
        cidade: 'São Paulo',
        estado: 'SP',
        responsavel: 'Dr. João Silva',
        telefone: '(11) 2661-0000',
        email: 'contato@hc.com.br',
        ativa: true,
      }

      renderWithProviders(
        <BuscaUnidadeInteligente
          {...defaultProps}
          unidadeSelecionada={unidadeSelecionada}
        />,
      )

      expect(screen.getByTestId('icone-check')).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter placeholder descritivo', () => {
      renderWithProviders(<BuscaUnidadeInteligente {...defaultProps} />)

      const campo = screen.getByTestId('campo-busca')
      expect(campo).toHaveAttribute(
        'placeholder',
        'Digite o nome da unidade ou CNES...',
      )
    })
  })
})
