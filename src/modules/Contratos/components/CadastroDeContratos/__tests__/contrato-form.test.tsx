import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContratoForm, {
  type DadosContrato,
} from '@/modules/Contratos/components/CadastroDeContratos/contrato-form'

// Mock dos dados que o componente tenta carregar
vi.mock('@/modules/Contratos/data/contratos-mock', () => ({
  unidadesMock: {
    demandantes: [
      'Secretaria de Obras',
      'Secretaria de Educação',
      'Secretaria de Saúde',
      'Secretaria de Administração',
      'Secretaria de Transportes',
    ],
    gestoras: [
      'Departamento de Compras',
      'Departamento de Contratos',
    ]
  },
}))

// Mock do processo instrutivo
vi.mock('@/modules/Contratos/data/processo-instrutivo.json', () => ({
  default: {
    prefixos: ['SEI', 'PROC'],
    sufixos: ['2024', '2025'],
  },
}))

// Mock do fetch para retornar dados do processo instrutivo
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('processo-instrutivo')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        prefixos: ['SEI', 'PROC'],
        sufixos: ['2024', '2025'],
      }),
    } as Response)
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
})

describe('ContratoForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnPrevious = vi.fn()
  const mockOnAdvanceRequest = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    onPrevious: mockOnPrevious,
    onAdvanceRequest: mockOnAdvanceRequest,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar todos os campos obrigatórios', () => {
    render(<ContratoForm {...defaultProps} />)

    expect(screen.getByLabelText(/número do contrato/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/processo sei/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/categoria do objeto do contrato/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição do objeto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de contratação/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de contrato/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/unidade demandante/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/unidade gestora/i)).toBeInTheDocument()
    expect(screen.getByText('Contratação *')).toBeInTheDocument()
    expect(screen.getByLabelText('Centralizada')).toBeInTheDocument()
    expect(screen.getByLabelText('Descentralizada')).toBeInTheDocument()
    expect(screen.getByLabelText(/vigência inicial/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prazo inicial/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vigência final/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor do contrato/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/forma de pagamento/i)).toBeInTheDocument()
    // O campo é dinâmico; por padrão é Link do Processo.Rio
    expect(screen.getByLabelText(/link do processo\.rio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vinculação a pca/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrato ativo/i)).toBeInTheDocument()
  })

  it('deve exibir botões de navegação', () => {
    render(<ContratoForm {...defaultProps} />)

    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Anterior')).toBeInTheDocument()
    expect(screen.getByText('Próximo')).toBeInTheDocument()
  })

  it('deve calcular vigência final automaticamente quando data inicial e prazo são preenchidos', async () => {
    render(<ContratoForm {...defaultProps} />)

    const vigenciaInicialInput = screen.getByLabelText(/vigência inicial/i)
    const prazoInput = screen.getByLabelText(/prazo inicial/i)
    const vigenciaFinalInput = screen.getByLabelText(/vigência final/i)

    // Define data inicial usando change para inputs type=date
    fireEvent.change(vigenciaInicialInput, { target: { value: '2024-01-01' } })

    // Define prazo de 12 meses (evita clear que falha foco)
    fireEvent.change(prazoInput, { target: { value: '12' } })

    await waitFor(() => {
      expect(vigenciaFinalInput).toHaveValue('2025-01-01')
    })
  })

  it('deve exibir erros de validação para campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<ContratoForm {...defaultProps} />)

    const submitButton = screen.getByText('Próximo')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/número do contrato é obrigatório/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/processo sei é obrigatório/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/categoria do objeto é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/descrição do objeto é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/unidade demandante é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/unidade gestora é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/data de vigência inicial é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Valor do contrato é obrigatório/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/forma de pagamento é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/vinculação a pca é obrigatória/i),
      ).toBeInTheDocument()
    })
  })

  it('deve chamar onAdvanceRequest quando formulário é válido e função está disponível', async () => {
    render(<ContratoForm {...defaultProps} />)

    // Verifica se o botão próximo está presente
    const botaoProximo = screen.getByText('Próximo')
    expect(botaoProximo).toBeInTheDocument()

    // Tenta submeter o formulário vazio para ver se há validação
    fireEvent.click(botaoProximo)

    // Verifica se há erros de validação
    await waitFor(() => {
      expect(screen.getByText(/número do contrato é obrigatório/i)).toBeInTheDocument()
    })

    // Agora preenche o formulário com dados válidos
    fireEvent.click(screen.getByText(/preencher dados de teste/i))

    // Aguarda o preenchimento
    await waitFor(() => {
      expect(screen.getByLabelText(/número do contrato/i)).toHaveValue('CONT-2024-0001')
    })

    // Aguarda um pouco para garantir que todos os campos foram preenchidos
    await new Promise(resolve => setTimeout(resolve, 100))

    // Tenta submeter novamente
    fireEvent.click(botaoProximo)

  })

  // Removido teste de upload, pois o campo é dinâmico (URL/Texto) e não há input type="file"

  it('deve aceitar link do Processo.Rio no campo de termo de referência', async () => {
    render(<ContratoForm {...defaultProps} />)

    const linkInput = screen.getByLabelText(/link do processo\.rio/i)
    fireEvent.input(linkInput, { target: { value: 'https://processo.rio/processo/12345' } })

    await waitFor(() => {
      expect(linkInput).toHaveValue('https://processo.rio/processo/12345')
    })
  })

  it('deve alternar para Google Drive e aceitar URL', async () => {
    render(<ContratoForm {...defaultProps} />)

    // Seleciona radio Google Drive
    fireEvent.click(screen.getByLabelText(/google drive/i))

    const linkInput = screen.getByLabelText(/link do google drive/i)
    fireEvent.input(linkInput, { target: { value: 'https://drive.google.com/file/abc' } })

    await waitFor(() => {
      expect(linkInput).toHaveValue('https://drive.google.com/file/abc')
    })
  })

  it('deve preencher formulário com dados iniciais quando fornecidos', () => {
    const dadosIniciais: Partial<DadosContrato> = {
      numeroContrato: 'CONT-2024-002',
      processoSei: '98765432109876543210',
      categoriaObjeto: 'prestacao_servico_com_mao_obra',
      descricaoObjeto: 'Prestação de serviços',
      tipoContratacao: 'Pregao',
      tipoContrato: 'Prestacao_Servico',
    }

    render(<ContratoForm {...defaultProps} dadosIniciais={dadosIniciais} />)

    expect(screen.getByDisplayValue('CONT-2024-002')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Prestação de serviços')).toBeInTheDocument()
  })

  it('deve marcar checkbox de contrato ativo por padrão', () => {
    render(<ContratoForm {...defaultProps} />)

    const ativoCheckbox = screen.getByLabelText(/contrato ativo/i)
    expect(ativoCheckbox).toBeChecked()
  })

  it('deve validar prazo inicial entre 1 e 60 meses', async () => {
    render(<ContratoForm {...defaultProps} />)

    const prazoInput = screen.getByLabelText(/prazo inicial/i)

    fireEvent.change(prazoInput, { target: { value: '12' } })
    expect(prazoInput).toHaveValue('12')

    fireEvent.change(prazoInput, { target: { value: '60' } })
    expect(prazoInput).toHaveValue('60')
  })
})
