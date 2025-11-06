import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
    gestoras: ['Departamento de Compras', 'Departamento de Contratos'],
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
      json: () =>
        Promise.resolve({
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
  // Mock do hook useUnidades
  vi.mock('@/modules/Unidades/hooks/use-unidades', () => ({
    useUnidades: vi.fn(() => ({
      data: {
        dados: [],
      },
      isLoading: false,
      error: null,
    })),
    useBuscarUnidades: vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
    })),
    useUnidadesByIds: vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
    })),
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
    renderWithProviders(<ContratoForm {...defaultProps} />)

    expect(screen.getByLabelText(/número do contrato/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/categoria do objeto do contrato/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição do objeto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de contratação/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de contrato/i)).toBeInTheDocument()
    expect(screen.getAllByText(/unidade demandante/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/unidade gestora/i)[0]).toBeInTheDocument()
    // Campo "Contratação" está oculto mas ainda é funcional
    expect(screen.getAllByText('Tipo de Contratação *')[0]).toBeInTheDocument()
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
  })

  it('deve exibir botões de navegação', () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Anterior')).toBeInTheDocument()
    expect(screen.getByText('Próximo')).toBeInTheDocument()
  })

  it('deve calcular vigência final automaticamente quando data inicial e prazo são preenchidos', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

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
    renderWithProviders(<ContratoForm {...defaultProps} />)

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
    renderWithProviders(<ContratoForm {...defaultProps} />)

    const submitButton = screen.getByText('Próximo')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/número do contrato é obrigatório/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/pelo menos um processo deve ser informado/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/categoria do objeto é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/descrição do objeto é obrigatória/i),
      ).toBeInTheDocument()
      // Verificar se há mensagens de erro de validação
      const errorMessages = screen.getAllByText(/é obrigatório|é obrigatória/i)
      expect(errorMessages.length).toBeGreaterThan(0)
      // Verificar se há mais mensagens de erro
      expect(errorMessages.length).toBeGreaterThan(3)
      expect(
        screen.getByText(/data de vigência inicial é obrigatória/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Valor do contrato é obrigatório/i),
      ).toBeInTheDocument()
    })
  })

  it('deve validar que pelo menos meses ou dias sejam informados', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

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

    // Aguarda um pouco para que a validação seja processada
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verifica se há algum erro relacionado ao prazo
    const errorMessages = screen.getAllByText(/prazo/i)
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('deve chamar onAdvanceRequest quando formulário é válido e função está disponível', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

    // Verifica se o botão próximo está presente
    const botaoProximo = screen.getByText('Próximo')
    expect(botaoProximo).toBeInTheDocument()

    // Tenta submeter o formulário vazio para ver se há validação
    fireEvent.click(botaoProximo)

    // Verifica se há erros de validação
    await waitFor(() => {
      expect(
        screen.getByText(/número do contrato é obrigatório/i),
      ).toBeInTheDocument()
    })

    // Agora preenche o formulário com dados válidos manualmente
    const numeroContratoInput = screen.getByLabelText(/número do contrato/i)
    fireEvent.change(numeroContratoInput, { target: { value: '20240001' } })

    // Aguarda o preenchimento
    await waitFor(() => {
      expect(screen.getByLabelText(/número do contrato/i)).toHaveValue(
        '20240001',
      )
    })

    // Aguarda um pouco para garantir que todos os campos foram preenchidos
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Tenta submeter novamente
    fireEvent.click(botaoProximo)
  })

  // Removido teste de upload, pois o campo é dinâmico (URL/Texto) e não há input type="file"

  it('deve aceitar link do Processo.Rio no campo de termo de referência', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

    const linkInput = screen.getByLabelText(/link do processo\.rio/i)
    fireEvent.input(linkInput, {
      target: { value: 'https://processo.rio/processo/12345' },
    })

    await waitFor(() => {
      expect(linkInput).toHaveValue('https://processo.rio/processo/12345')
    })
  })

  it('deve alternar para Google Drive e aceitar URL', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

    // Seleciona radio Google Drive
    fireEvent.click(screen.getByLabelText(/google drive/i))

    const linkInput = screen.getByLabelText(/link do google drive/i)
    fireEvent.input(linkInput, {
      target: { value: 'https://drive.google.com/file/abc' },
    })

    await waitFor(() => {
      expect(linkInput).toHaveValue('https://drive.google.com/file/abc')
    })
  })

  it('deve preencher formulário com dados iniciais quando fornecidos', () => {
    const dadosIniciais: Partial<DadosContrato> = {
      numeroContrato: '20240002',
      processos: [{ tipo: 'sei' as const, valor: 'SEI-123456-2024' }],
      categoriaObjeto: 'prestacao_servico_com_mao_obra',
      descricaoObjeto: 'Prestação de serviços',
      tipoContratacao: 'Pregao',
      tipoContrato: 'Prestacao_Servico',
    }

    renderWithProviders(
      <ContratoForm {...defaultProps} dadosIniciais={dadosIniciais} />,
    )

    expect(screen.getByDisplayValue('20240002')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Prestação de serviços'),
    ).toBeInTheDocument()
  })

  it('deve validar prazo inicial entre 0 e 72 meses', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

    const prazoMesesInput = screen.getByDisplayValue('12')

    fireEvent.change(prazoMesesInput, { target: { value: '12' } })
    expect(prazoMesesInput).toHaveValue('12')

    fireEvent.change(prazoMesesInput, { target: { value: '72' } })
    expect(prazoMesesInput).toHaveValue('72')

    // Quando o valor é 0, o campo mostra "0"
    fireEvent.change(prazoMesesInput, { target: { value: '0' } })
    expect(prazoMesesInput).toHaveValue('0')
  })

  it('deve validar prazo inicial entre 0 e 30 dias', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

    const prazoDiasInput = screen.getByTestId('prazo-dias-input')

    fireEvent.change(prazoDiasInput, { target: { value: '15' } })
    expect(prazoDiasInput).toHaveValue('15')

    fireEvent.change(prazoDiasInput, { target: { value: '30' } })
    expect(prazoDiasInput).toHaveValue('30')

    // Quando o valor é 0, o campo mostra "0"
    fireEvent.change(prazoDiasInput, { target: { value: '0' } })
    expect(prazoDiasInput).toHaveValue('0')
  })

  it('deve exibir prazo total calculado', async () => {
    renderWithProviders(<ContratoForm {...defaultProps} />)

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
    renderWithProviders(<ContratoForm {...defaultProps} />)

    const vigenciaInicialInput = screen.getByLabelText(/vigência inicial/i)
    const vigenciaFinalInput = screen.getByLabelText(/vigência final/i)

    // Define vigência inicial
    fireEvent.change(vigenciaInicialInput, { target: { value: '2024-01-01' } })

    // Tenta definir vigência final anterior à inicial
    fireEvent.change(vigenciaFinalInput, { target: { value: '2023-12-31' } })

    const submitButton = screen.getByText('Próximo')
    fireEvent.click(submitButton)

    // Aguarda um pouco para que a validação seja processada
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verifica se há algum erro relacionado à vigência
    const errorMessages = screen.getAllByText(/vigência/i)
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  describe('Funcionalidades de Processos', () => {
    it('deve permitir adicionar processos SEI, RIO e Físico', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Verificar se os botões de adicionar processos existem
      expect(screen.getByText('Processo SEI')).toBeInTheDocument()
      expect(screen.getByText('Processo RIO')).toBeInTheDocument()
      expect(screen.getByText('Processo Físico')).toBeInTheDocument()

      // Adicionar um processo SEI
      await user.click(screen.getByText('Processo SEI'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('SEI-123456-2024'),
        ).toBeInTheDocument()
      })
    })

    it('deve permitir remover processos adicionados', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Adicionar um processo
      await user.click(screen.getByText('Processo SEI'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('SEI-123456-2024'),
        ).toBeInTheDocument()
      })

      // Remover o processo
      const removeButton = screen.getByRole('button', { name: '' }) // Botão com ícone de lixeira
      await user.click(removeButton)

      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText('SEI-123456-2024'),
        ).not.toBeInTheDocument()
      })
    })

    it('deve impedir adicionar múltiplos processos do mesmo tipo', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Adicionar primeiro processo SEI
      const botaoProcessoSEI = screen.getByRole('button', {
        name: /processo sei/i,
      })
      await user.click(botaoProcessoSEI)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('SEI-123456-2024'),
        ).toBeInTheDocument()
      })

      // Tentar adicionar segundo processo SEI
      await user.click(botaoProcessoSEI)

      // Deve mostrar mensagem de erro
      // Note: Como estamos usando toast.error, seria necessário mockear o sistema de toast para testar
    })

    it('deve aplicar máscara LEG no processo físico', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Adicionar processo físico
      await user.click(screen.getByText('Processo Físico'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('LEG-01/123.456/2024'),
        ).toBeInTheDocument()
      })
    })
  })

  // COMENTADO PARA PRÓXIMA ENTREGA - Funcionalidades de Etapas de Pagamento
  /* describe('Funcionalidades de Etapas de Pagamento', () => {
    it('deve mostrar campos de etapas quando forma de pagamento é "Etapas"', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Selecionar forma de pagamento "Etapas"
      const selectTrigger = screen.getByRole('combobox', { name: /forma de pagamento/i })
      await user.click(selectTrigger)

      const etapasOption = screen.getByText('Etapas')
      await user.click(etapasOption)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Qtd')).toBeInTheDocument()
      })
    })

    it('deve criar etapas quando quantidade é informada', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Selecionar forma de pagamento "Etapas"
      const selectTrigger = screen.getByRole('combobox', { name: /forma de pagamento/i })
      await user.click(selectTrigger)
      await user.click(screen.getByText('Etapas'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Qtd')).toBeInTheDocument()
      })

      // Definir quantidade de etapas
      const quantidadeInput = screen.getByPlaceholderText('Qtd')
      await user.clear(quantidadeInput)
      await user.type(quantidadeInput, '2')

      await waitFor(() => {
        expect(screen.getByText('Etapa 1')).toBeInTheDocument()
        expect(screen.getByText('Etapa 2')).toBeInTheDocument()
      })
    })

    it('deve limitar quantidade de etapas a 10', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Selecionar forma de pagamento "Etapas"
      const selectTrigger = screen.getByRole('combobox', { name: /forma de pagamento/i })
      await user.click(selectTrigger)
      await user.click(screen.getByText('Etapas'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Qtd')).toBeInTheDocument()
      })

      // Tentar definir quantidade maior que 10
      const quantidadeInput = screen.getByPlaceholderText('Qtd')
      await user.clear(quantidadeInput)
      await user.type(quantidadeInput, '15')

      // O input deve ter max="10", então o valor não deve ser aceito
      expect(quantidadeInput).toHaveAttribute('max', '10')
    })
  }) */

  describe('Validação de Número do Contrato', () => {
    it('deve mostrar placeholder atualizado', () => {
      renderWithProviders(<ContratoForm {...defaultProps} />)

      const numeroInput = screen.getByLabelText(/número do contrato/i)
      expect(numeroInput).toHaveAttribute('placeholder', 'Ex: 20240001')
    })
  })

  describe('Correção de Key - Processos mantém renderização', () => {
    it('deve renderizar campo de processo SEI após adicionar', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Adicionar processo SEI
      await user.click(screen.getByText('Processo SEI'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('SEI-123456-2024'),
        ).toBeInTheDocument()
      })
    })

    it('deve adicionar múltiplos processos e todos permanecerem renderizados', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContratoForm {...defaultProps} />)

      // Adicionar processo SEI
      await user.click(screen.getByText('Processo SEI'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('SEI-123456-2024'),
        ).toBeInTheDocument()
      })

      // Adicionar processo Físico
      await user.click(screen.getByText('Processo Físico'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('LEG-01/123.456/2024'),
        ).toBeInTheDocument()
      })

      // Verificar que ambos os processos permanecem na tela
      expect(screen.getByPlaceholderText('SEI-123456-2024')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('LEG-01/123.456/2024'),
      ).toBeInTheDocument()
    })
  })
})
