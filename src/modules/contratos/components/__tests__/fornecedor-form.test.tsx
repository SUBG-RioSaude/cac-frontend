import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FornecedorForm, {
  type DadosFornecedor,
} from '@/modules/Contratos/components/CadastroDeContratos/fornecedor-form'

// Mock dos componentes de ícone
vi.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon">🗑️</div>,
  Plus: () => <div data-testid="plus-icon">➕</div>,
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">▲</div>,
  Check: () => <div data-testid="check-icon">✓</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">▼</div>,
  ChevronUp: () => <div data-testid="chevron-up-icon">▲</div>,
  Building2: () => <div data-testid="building-icon">🏢</div>,
  MapPin: () => <div data-testid="map-pin-icon">📍</div>,
  Phone: () => <div data-testid="phone-icon">📞</div>,
  Mail: () => <div data-testid="mail-icon">✉️</div>,
  Zap: () => <div data-testid="zap-icon">⚡</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">➡️</div>,
  X: () => <div data-testid="x-icon">❌</div>,
}))

describe('FornecedorForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnAdvanceRequest = vi.fn()
  const mockOnCancel = vi.fn()

  const dadosIniciais: Partial<DadosFornecedor> = {
    cnpj: '11222333000181', // CNPJ válido sem formatação (como vem da API)
    razaoSocial: 'Empresa Teste',
    inscricaoEstadual: '123456789',
    inscricaoMunicipal: '987654321',
    endereco: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    ativo: true,
    contatos: [
      {
        id: '1',
        nome: 'João Silva',
        valor: '(11) 99999-9999',
        tipo: 'Celular',
        ativo: true,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar todos os campos obrigatórios', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/inscrição estadual/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/inscrição municipal/i)).toBeInTheDocument()
    })

    it('deve renderizar botão de próximo', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      expect(
        screen.getByRole('button', { name: /próximo/i }),
      ).toBeInTheDocument()
    })

    it('deve renderizar botão de preenchimento rápido', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      expect(
        screen.getByRole('button', { name: /preencher dados de teste/i }),
      ).toBeInTheDocument()
    })

    it('deve renderizar botão de cancelar quando onCancel é fornecido', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(
        screen.getByRole('button', { name: /cancelar/i }),
      ).toBeInTheDocument()
    })

    it('deve preencher campos com dados iniciais', () => {
      render(
        <FornecedorForm
          onSubmit={mockOnSubmit}
          dadosIniciais={dadosIniciais}
        />,
      )

      expect(screen.getByDisplayValue('11.222.333/0001-81')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Empresa Teste')).toBeInTheDocument()
    })
  })

  describe('Preenchimento Rápido', () => {
    it('deve preencher todos os campos ao clicar no botão de preenchimento rápido', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const botaoPreenchimento = screen.getByRole('button', {
        name: /preencher dados de teste/i,
      })

      await user.click(botaoPreenchimento)

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('11.222.333/0001-81'),
        ).toBeInTheDocument()
        expect(
          screen.getByDisplayValue('Empresa de Limpeza Exemplo LTDA'),
        ).toBeInTheDocument()
        expect(screen.getByDisplayValue('12.345.67-8')).toBeInTheDocument()
        expect(screen.getByDisplayValue('12.345.678-9')).toBeInTheDocument()
        expect(
          screen.getByDisplayValue('Rua das Flores, 123'),
        ).toBeInTheDocument()
        expect(screen.getByDisplayValue('Centro')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Rio de Janeiro')).toBeInTheDocument()
        expect(screen.getByDisplayValue('20040-020')).toBeInTheDocument()
      })
    })

    it('deve preencher contatos de teste', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const botaoPreenchimento = screen.getByRole('button', {
        name: /preencher dados de teste/i,
      })

      await user.click(botaoPreenchimento)

      await waitFor(() => {
        expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
        expect(screen.getByDisplayValue('joao@empresa.com')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Maria Santos')).toBeInTheDocument()
        expect(screen.getByDisplayValue('(21) 9 9999-8888')).toBeInTheDocument()
      })
    })
  })

  describe('Validação', () => {
    it('deve mostrar erro para campos obrigatórios vazios', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const botaoProximo = screen.getByRole('button', { name: /próximo/i })
      await user.click(botaoProximo)

      await waitFor(() => {
        expect(screen.getByText(/cnpj é obrigatório/i)).toBeInTheDocument()
        expect(
          screen.getByText(/razão social é obrigatória/i),
        ).toBeInTheDocument()
      })
    })

    it('deve validar campo CNPJ vazio', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      // Tentar submeter o formulário sem preencher o CNPJ
      const botaoProximo = screen.getByRole('button', { name: /próximo/i })
      await user.click(botaoProximo)

      await waitFor(() => {
        expect(screen.getByText(/cnpj é obrigatório/i)).toBeInTheDocument()
      })
    })
  })

  describe('Gerenciamento de Contatos', () => {
    it('deve adicionar novo contato', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const botaoAdicionarContato = screen.getByRole('button', {
        name: /adicionar contato/i,
      })

      await user.click(botaoAdicionarContato)

      await waitFor(() => {
        const nomeInputs = screen.getAllByLabelText(/nome do contato/i)
        expect(nomeInputs).toHaveLength(1)
      })
    })

    it('deve remover contato existente', async () => {
      const user = userEvent.setup()
      render(
        <FornecedorForm
          onSubmit={mockOnSubmit}
          dadosIniciais={dadosIniciais}
        />,
      )

      // Esperar carregar o contato inicial
      await waitFor(() => {
        expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
      })

      const botaoRemover = screen.getByTestId('trash-icon').closest('button')
      expect(botaoRemover).toBeInTheDocument()

      await user.click(botaoRemover!)

      await waitFor(() => {
        expect(screen.queryByDisplayValue('João Silva')).not.toBeInTheDocument()
      })
    })
  })

  describe('Submissão do Formulário', () => {
    it('deve chamar onSubmit com dados corretos quando não há onAdvanceRequest', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      // Preencher dados rapidamente
      const botaoPreenchimento = screen.getByRole('button', {
        name: /preencher dados de teste/i,
      })
      await user.click(botaoPreenchimento)

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('11.222.333/0001-81'),
        ).toBeInTheDocument()
      })

      const botaoProximo = screen.getByRole('button', { name: /próximo/i })
      await user.click(botaoProximo)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          cnpj: '11222333000181', // CNPJ limpo (sem formatação)
          razaoSocial: 'Empresa de Limpeza Exemplo LTDA',
          estadoIE: 'RJ',
          inscricaoEstadual: '12.345.67-8',
          inscricaoMunicipal: '12.345.678-9',
          endereco: 'Rua das Flores, 123',
          numero: '123',
          complemento: 'Sala 101',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '20040-020',
          ativo: true,
          contatos: [
            {
              id: '1',
              nome: 'João Silva',
              valor: 'joao@empresa.com',
              tipo: 'Email',
              ativo: true,
            },
            {
              id: '2',
              nome: 'Maria Santos',
              valor: '(21) 9 9999-8888',
              tipo: 'Celular',
              ativo: true,
            },
          ],
        })
      })
    })

    it('deve chamar onAdvanceRequest quando fornecido', async () => {
      const user = userEvent.setup()
      render(
        <FornecedorForm
          onSubmit={mockOnSubmit}
          onAdvanceRequest={mockOnAdvanceRequest}
        />,
      )

      // Preencher dados rapidamente
      const botaoPreenchimento = screen.getByRole('button', {
        name: /preencher dados de teste/i,
      })
      await user.click(botaoPreenchimento)

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('11.222.333/0001-81'),
        ).toBeInTheDocument()
      })

      const botaoProximo = screen.getByRole('button', { name: /próximo/i })
      await user.click(botaoProximo)

      await waitFor(() => {
        expect(mockOnAdvanceRequest).toHaveBeenCalled()
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })

    it('deve chamar onCancel ao clicar no botão cancelar', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const botaoCancelar = screen.getByRole('button', { name: /cancelar/i })
      await user.click(botaoCancelar)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para todos os campos', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const cnpjInput = screen.getByLabelText(/cnpj/i)
      const razaoSocialInput = screen.getByLabelText(/razão social/i)

      // Verificar se os campos existem
      expect(cnpjInput).toBeInTheDocument()
      expect(razaoSocialInput).toBeInTheDocument()

      // Verificar se os campos têm labels apropriados
      expect(cnpjInput).toHaveAttribute('id', 'cnpj')
      expect(razaoSocialInput).toHaveAttribute('id', 'razaoSocial')
    })

    it('deve ter botões com textos descritivos', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(
        screen.getByRole('button', { name: /próximo/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancelar/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /preencher dados de teste/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Estados do Formulário', () => {
    it('deve marcar checkbox de ativo como verdadeiro por padrão', () => {
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const checkboxAtivo = screen.getByRole('checkbox', {
        name: /fornecedor ativo/i,
      })
      expect(checkboxAtivo).toBeChecked()
    })

    it('deve permitir alterar estado ativo', async () => {
      const user = userEvent.setup()
      render(<FornecedorForm onSubmit={mockOnSubmit} />)

      const checkboxAtivo = screen.getByRole('checkbox', {
        name: /fornecedor ativo/i,
      })
      expect(checkboxAtivo).toBeChecked()

      await user.click(checkboxAtivo)
      expect(checkboxAtivo).not.toBeChecked()
    })
  })
})
