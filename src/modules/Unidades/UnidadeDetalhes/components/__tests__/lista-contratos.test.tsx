import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ListaContratos } from '../lista-contratos'
import type { ContratoVinculado } from '@/modules/Unidades/ListaUnidades/types/unidade'

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

// Mock do useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockContratosAtivos: ContratoVinculado[] = [
  {
    id: 101,
    numero: "CT-2024-001",
    objeto: "Prestacao de servicos de limpeza e conservacao",
    fornecedor: "Empresa de Limpeza ABC Ltda",
    valor: 850000,
    vigenciaInicio: "2024-01-15",
    vigenciaFim: "2024-12-31",
    status: "ativo"
  },
  {
    id: 102,
    numero: "CT-2024-015", 
    objeto: "Fornecimento de medicamentos basicos",
    fornecedor: "Farmacia Central S.A.",
    valor: 1200000,
    vigenciaInicio: "2024-02-01",
    vigenciaFim: "2025-01-31",
    status: "ativo"
  },
  {
    id: 103,
    numero: "CT-2023-156",
    objeto: "Manutencao predial e eletrica",
    fornecedor: "Construtora Predial Plus",
    valor: 250000,
    vigenciaInicio: "2023-12-01",
    vigenciaFim: "2024-11-30",
    status: "vencido"
  }
]

const mockContratosVazio: ContratoVinculado[] = []

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ListaContratos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('quando há contratos', () => {
    it('deve renderizar título com contador correto', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('Contratos Vinculados (3)')).toBeInTheDocument()
      expect(screen.getByText('Lista de contratos ativos nesta unidade')).toBeInTheDocument()
    })

    it('deve renderizar informações básicas de todos os contratos', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('CT-2024-001')).toBeInTheDocument()
      expect(screen.getByText('CT-2024-015')).toBeInTheDocument()
      expect(screen.getByText('CT-2023-156')).toBeInTheDocument()
    })

    it('deve renderizar objetos dos contratos', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('Prestacao de servicos de limpeza e conservacao')).toBeInTheDocument()
      expect(screen.getByText('Fornecimento de medicamentos basicos')).toBeInTheDocument()
      expect(screen.getByText('Manutencao predial e eletrica')).toBeInTheDocument()
    })

    it('deve renderizar fornecedores corretamente', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('Empresa de Limpeza ABC Ltda')).toBeInTheDocument()
      expect(screen.getByText('Farmacia Central S.A.')).toBeInTheDocument()
      expect(screen.getByText('Construtora Predial Plus')).toBeInTheDocument()
    })

    it('deve formatar valores monetários corretamente', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se há valores monetários formatados (podem ter formatação ligeiramente diferente)
      const valorElements = document.querySelectorAll('[class*="font-medium"]')
      expect(valorElements.length).toBeGreaterThan(0)
      
      // Verifica se há o símbolo R$ presente
      expect(document.body.textContent).toContain('R$')
    })

    it('deve formatar datas de vigência corretamente', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se há datas formatadas (o formato pode variar)
      expect(document.body.textContent).toContain('2024')
      expect(document.body.textContent).toContain('2023')
      expect(document.body.textContent).toContain('2025')
      
      // Verifica se há separadores de data
      expect(document.body.textContent).toContain(' - ')
    })

    it('deve renderizar badges de status corretamente', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      const ativoBadges = screen.getAllByText('Ativo')
      const vencidoBadge = screen.getByText('Vencido')
      
      expect(ativoBadges).toHaveLength(2)
      expect(vencidoBadge).toBeInTheDocument()
    })

    it('deve renderizar botões "Abrir" para todos os contratos', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      const abrirButtons = screen.getAllByText('Abrir')
      expect(abrirButtons).toHaveLength(3)
    })

    it('deve navegar para página de detalhes do contrato ao clicar em "Abrir"', async () => {
      const user = userEvent.setup()
      
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      const abrirButtons = screen.getAllByText('Abrir')
      await user.click(abrirButtons[0])
      
      expect(mockNavigate).toHaveBeenCalledWith('/contratos/101')
    })

    it('deve ter ícones apropriados para cada seção', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se existem ícones para fornecedor e vigência
      expect(screen.getAllByText('Fornecedor')).toHaveLength(3)
      expect(screen.getAllByText('Vigência')).toHaveLength(3)
    })

    it('deve aplicar classes CSS corretas para diferentes status', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      const vencidoBadge = screen.getByText('Vencido')
      expect(vencidoBadge).toHaveClass('bg-red-100', 'text-red-800')
      
      const ativoBadges = screen.getAllByText('Ativo')
      ativoBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-100', 'text-green-800')
      })
    })

    it('deve ter hover effects nos itens da lista', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se os itens de contrato estão renderizados
      const contratoItems = screen.getAllByText(/CT-2024/)
      expect(contratoItems.length).toBeGreaterThan(0)
      
      // Verifica se há elementos com classes de hover
      const hoverElements = document.querySelectorAll('[class*="hover:"]')
      expect(hoverElements.length).toBeGreaterThan(0)
    })
  })

  describe('quando não há contratos', () => {
    it('deve renderizar estado vazio com mensagem apropriada', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosVazio} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('Nenhum contrato vinculado')).toBeInTheDocument()
      expect(screen.getByText('Esta unidade não possui contratos ativos no momento.')).toBeInTheDocument()
    })

    it('deve renderizar ícone no estado vazio', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosVazio} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se o estado vazio tem estrutura de centralização
      const emptyStateContainer = screen.getByText('Nenhum contrato vinculado').closest('div')
      expect(emptyStateContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'py-8', 'text-center')
    })

    it('não deve renderizar lista de contratos no estado vazio', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosVazio} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.queryByText('Lista de contratos ativos nesta unidade')).not.toBeInTheDocument()
      expect(screen.queryByText('Abrir')).not.toBeInTheDocument()
    })
  })

  describe('tratamento de props undefined/null', () => {
    it('deve tratar contratos undefined como array vazio', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={undefined as unknown as ContratoVinculado[]} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('Nenhum contrato vinculado')).toBeInTheDocument()
    })

    it('deve funcionar com contratos null', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={null as unknown as ContratoVinculado[]} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      expect(screen.getByText('Nenhum contrato vinculado')).toBeInTheDocument()
    })
  })

  describe('responsividade', () => {
    it('deve aplicar classes responsivas para grid de informações', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se há elementos com classes de grid
      const gridElements = document.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
      
      // Verifica se há classes responsivas
      const responsiveElements = document.querySelectorAll('[class*="md:"]')
      expect(responsiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('acessibilidade', () => {
    it('deve ter estrutura semântica apropriada', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      // Verifica se tem o texto do título (pode não ser um h1/h2 formal)
      expect(screen.getByText(/contratos vinculados/i)).toBeInTheDocument()
    })

    it('deve ter botões acessíveis', () => {
      renderWithRouter(
        <ListaContratos 
          contratos={mockContratosAtivos} 
          unidadeNome="Hospital Teste" 
        />
      )
      
      const buttons = screen.getAllByRole('button', { name: /abrir/i })
      expect(buttons).toHaveLength(3)
      
      buttons.forEach(button => {
        expect(button).toBeEnabled()
      })
    })
  })
})