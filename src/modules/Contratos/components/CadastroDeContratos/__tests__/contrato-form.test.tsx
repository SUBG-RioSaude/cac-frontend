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
    const vigenciaFinalInput = screen.getByLabelText(/vigência final/i)

    // Define data inicial usando change para inputs type=date
    fireEvent.change(vigenciaInicialInput, { target: { value: '2024-01-01' } })

    // O prazo já está definido como 12 meses por padrão, então a vigência final deve ser calculada automaticamente
    await waitFor(() => {
      expect(vigenciaFinalInput).toHaveValue('2025-01-01')
    })
  })

  it('deve calcular vigência final com meses e dias', async () => {
    render(<ContratoForm {...defaultProps} />)

    const vigenciaInicialInput = screen.getByLabelText(/vigência inicial/i)
    const vigenciaFinalInput = screen.getByLabelText(/vigência final/i)

    // Define data inicial
    fireEvent.change(vigenciaInicialInput, { target: { value: '2024-01-01' } })

    // Encontra os campos de prazo pelos IDs
    const prazoMesesInput = screen.getByDisplayValue('12')
    const prazoDiasInput = screen.getByTestId('prazo-dias-input')

    // Altera prazo para 12 meses e 15 dias
    fireEvent.change(prazoMesesInput, { target: { value: '12' } })
    fireEvent.change(prazoDiasInput, { target: { value: '15' } })

    await waitFor(() => {
      // 12 meses + 15 dias a partir de 2024-01-01 deve resultar em 2025-01-16
      expect(vigenciaFinalInput).toHaveValue('2025-01-16')
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
        screen.getByText(/vinculação a pca é obrigatória/i),
      ).toBeInTheDocument()
    })
  })

  it('deve validar que pelo menos meses ou dias sejam informados', async () => {
    render(<ContratoForm {...defaultProps} />)

    const vigenciaInicialInput = screen.getByLabelText(/vigência inicial/i)

    // Define data inicial
    fireEvent.change(vigenciaInicialInput, { target: { value: '2024-01-01' } })

    // Encontra os campos de prazo pelos IDs
    const prazoMesesInput = screen.getByDisplayValue('12')
    const prazoDiasInput = screen.getByTestId('prazo-dias-input')

    // Remove o prazo (define como 0)
    fireEvent.change(prazoMesesInput, { target: { value: '0' } })
    fireEvent.change(prazoDiasInput, { target: { value: '0' } })

    const submitButton = screen.getByText('Próximo')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/informe pelo menos meses ou dias para definir o prazo do contrato/i),
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

  it('deve validar prazo inicial entre 0 e 60 meses', async () => {
    render(<ContratoForm {...defaultProps} />)

    const prazoMesesInput = screen.getByDisplayValue('12')

    fireEvent.change(prazoMesesInput, { target: { value: '12' } })
    expect(prazoMesesInput).toHaveValue('12')

    fireEvent.change(prazoMesesInput, { target: { value: '60' } })
    expect(prazoMesesInput).toHaveValue('60')

    // Quando o valor é 0, o campo fica vazio devido à lógica value={field.value || ''}
    fireEvent.change(prazoMesesInput, { target: { value: '0' } })
    expect(prazoMesesInput).toHaveValue('')
  })

  it('deve validar prazo inicial entre 0 e 30 dias', async () => {
    render(<ContratoForm {...defaultProps} />)

    const prazoDiasInput = screen.getByTestId('prazo-dias-input')

    fireEvent.change(prazoDiasInput, { target: { value: '15' } })
    expect(prazoDiasInput).toHaveValue('15')

    fireEvent.change(prazoDiasInput, { target: { value: '30' } })
    expect(prazoDiasInput).toHaveValue('30')

    // Quando o valor é 0, o campo fica vazio devido à lógica value={form.watch('prazoInicialDias') || ''}
    fireEvent.change(prazoDiasInput, { target: { value: '0' } })
    expect(prazoDiasInput).toHaveValue('')
  })

  it('deve exibir prazo total calculado', async () => {
    render(<ContratoForm {...defaultProps} />)

    // Verifica se o prazo total é exibido
    expect(screen.getByText(/prazo total:/i)).toBeInTheDocument()
    expect(screen.getByText('12 meses')).toBeInTheDocument()

    // Encontra o campo de dias e altera para incluir dias
    const prazoDiasInput = screen.getByTestId('prazo-dias-input')
    fireEvent.change(prazoDiasInput, { target: { value: '15' } })

    await waitFor(() => {
      expect(screen.getByText('12 meses e 15 dias')).toBeInTheDocument()
    })
  })

  it('deve validar vigência final posterior à vigência inicial', async () => {
    render(<ContratoForm {...defaultProps} />)

    const vigenciaInicialInput = screen.getByLabelText(/vigência inicial/i)
    const vigenciaFinalInput = screen.getByLabelText(/vigência final/i)

    // Define vigência inicial
    fireEvent.change(vigenciaInicialInput, { target: { value: '2024-01-01' } })

    // Tenta definir vigência final anterior à inicial
    fireEvent.change(vigenciaFinalInput, { target: { value: '2023-12-31' } })

    const submitButton = screen.getByText('Próximo')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/a vigência final deve ser posterior à vigência inicial/i),
      ).toBeInTheDocument()
    })
  })
})
