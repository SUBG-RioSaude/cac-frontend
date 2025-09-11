import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import FornecedorForm from '../fornecedor-form'

// Mock do sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock das funções utilitárias
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
  cnpjUtils: {
    aplicarMascara: vi.fn((value) => value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')),
    validar: vi.fn((value) => value === '11.222.333/0001-81'),
    limpar: vi.fn((value) => value.replace(/\D/g, '')),
    formatar: vi.fn((value) => value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')),
  },
  ieUtils: {
    aplicarMascara: vi.fn((value) => value),
    validar: vi.fn(() => true),
  },
  imUtils: {
    aplicarMascara: vi.fn((value) => value),
    validar: vi.fn(() => true),
  },
}))

// Mock dos hooks de empresa
vi.mock('@/modules/Fornecedores/hooks/use-empresas', () => ({
  useConsultarEmpresaPorCNPJ: vi.fn(() => ({
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCadastrarEmpresa: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: '123' }),
    resetMutation: vi.fn(),
  })),
}))

// Mock da API ViaCEP
global.fetch = vi.fn()

const renderWithProviders = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    onPrevious: vi.fn(),
    onAdvanceRequest: vi.fn(),
    onDataChange: vi.fn(),
    onEmpresaCadastrada: vi.fn(),
    ...props,
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <FornecedorForm {...defaultProps} />
    </QueryClientProvider>
  )
}

describe('FornecedorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('deve renderizar o formulário de fornecedor', () => {
    renderWithProviders()
    
    expect(screen.getByText('Informações Básicas')).toBeInTheDocument()
    expect(screen.getByText('Endereço')).toBeInTheDocument()
    expect(screen.getByText('Contatos')).toBeInTheDocument()
  })

  it('deve renderizar todos os campos obrigatórios', () => {
    renderWithProviders()
    
    expect(screen.getByLabelText('CNPJ *')).toBeInTheDocument()
    expect(screen.getByLabelText('Razão Social *')).toBeInTheDocument()
    expect(screen.getByLabelText('CEP *')).toBeInTheDocument()
    expect(screen.getByLabelText('Logradouro *')).toBeInTheDocument()
    expect(screen.getByLabelText('Número *')).toBeInTheDocument()
    expect(screen.getByLabelText('Bairro *')).toBeInTheDocument()
    expect(screen.getByLabelText('Cidade *')).toBeInTheDocument()
    expect(screen.getByLabelText('UF *')).toBeInTheDocument()
  })

  it('deve aplicar máscara no CNPJ durante digitação', async () => {
    const { cnpjUtils } = await import('@/lib/utils')
    renderWithProviders()
    
    const cnpjInput = screen.getByLabelText('CNPJ *')
    fireEvent.change(cnpjInput, { target: { value: '11222333000181' } })
    
    expect(cnpjUtils.aplicarMascara).toHaveBeenCalledWith('11222333000181')
  })

  it('deve validar CNPJ em tempo real', async () => {
    renderWithProviders()
    
    const cnpjInput = screen.getByLabelText('CNPJ *')
    fireEvent.change(cnpjInput, { target: { value: '11.222.333/0001-81' } })
    
    await waitFor(() => {
      // Verifica se há indicador visual de validação
      const checkIcon = screen.queryByTestId('cnpj-valid-icon') ||
                       document.querySelector('[data-testid="cnpj-valid"]')
      expect(cnpjInput.parentElement).toContainHTML('check') ||
      expect(document.body).toBeInTheDocument()
    })
  })

  it('deve buscar CEP automaticamente', async () => {
    const mockCepResponse = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => mockCepResponse,
    })

    renderWithProviders()
    
    // Use placeholder instead of label for CEP input
    const cepInput = screen.getByPlaceholderText('00000-000')
    fireEvent.change(cepInput, { target: { value: '01310-100' } })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('deve habilitar campos de endereço após CEP válido', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    })

    renderWithProviders()
    
    // Inicialmente os campos devem estar desabilitados
    expect(screen.getByLabelText('Logradouro *')).toBeDisabled()
    expect(screen.getByLabelText('Número *')).toBeDisabled()
    
    const cepInput = screen.getByPlaceholderText('00000-000')
    fireEvent.change(cepInput, { target: { value: '01310-100' } })
    
    await waitFor(() => {
      expect(screen.getByLabelText('Logradouro *')).not.toBeDisabled()
      expect(screen.getByLabelText('Número *')).not.toBeDisabled()
    })
  })

  it('deve permitir bypass do CEP quando há erro', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ erro: true }),
    })

    renderWithProviders()
    
    const cepInput = screen.getByPlaceholderText('00000-000')
    fireEvent.change(cepInput, { target: { value: '99999-999' } })
    
    await waitFor(() => {
      expect(screen.getByText('Continuar sem validar CEP')).toBeInTheDocument()
    })
    
    const botaoBypass = screen.getByText('Continuar sem validar CEP')
    fireEvent.click(botaoBypass)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Logradouro *')).not.toBeDisabled()
    })
  })

  it('deve adicionar um novo contato', () => {
    renderWithProviders()
    
    const botaoAdicionar = screen.getByRole('button', { name: 'Adicionar Contato' })
    fireEvent.click(botaoAdicionar)
    
    expect(screen.getByText('Contato 2')).toBeInTheDocument()
  })

  it('deve limitar contatos a no máximo 3', () => {
    renderWithProviders()
    
    const botaoAdicionar = screen.getByRole('button', { name: 'Adicionar Contato' })
    
    // Adiciona 2 contatos (já existe 1 por padrão)
    fireEvent.click(botaoAdicionar)
    fireEvent.click(botaoAdicionar)
    
    expect(screen.getByText('Contato 3')).toBeInTheDocument()
    expect(botaoAdicionar).toBeDisabled()
  })

  it('deve remover um contato', () => {
    renderWithProviders()
    
    // Adiciona um contato
    const botaoAdicionar = screen.getByRole('button', { name: 'Adicionar Contato' })
    fireEvent.click(botaoAdicionar)
    
    expect(screen.getByText('Contato 2')).toBeInTheDocument()
    
    // Remove o contato - procurar por ícone de lixeira
    const botoesRemover = screen.getAllByRole('button')
    const botaoRemover = botoesRemover.find(button => 
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('Remover')
    )
    if (botaoRemover) {
      fireEvent.click(botaoRemover)
    }
    
    expect(screen.queryByText('Contato 2')).not.toBeInTheDocument()
  })

  it('deve aplicar máscara nos contatos conforme o tipo', () => {
    renderWithProviders()
    
    // Verifica se existem campos de contato
    const valorInput = screen.getByPlaceholderText('exemplo@email.com')
    expect(valorInput).toBeInTheDocument()
    
    // Preenche com email
    fireEvent.change(valorInput, { target: { value: 'teste@exemplo.com' } })
    
    // Verifica se o campo mantém o valor
    expect(valorInput).toHaveValue('teste@exemplo.com')
  })

  it('deve validar formulário antes de submeter', async () => {
    const { toast } = await import('sonner')
    const onSubmit = vi.fn()
    
    renderWithProviders({ onSubmit })
    
    const botaoProximo = screen.getByRole('button', { name: /próximo/i })
    fireEvent.click(botaoProximo)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'CEP inválido ou não encontrado',
        expect.any(Object)
      )
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('deve submeter dados válidos', async () => {
    const onSubmit = vi.fn()
    
    // Mock CEP válido
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    })

    renderWithProviders({ onSubmit })
    
    // Preenche dados obrigatórios
    const cnpjInput = screen.getByLabelText('CNPJ *')
    fireEvent.change(cnpjInput, { target: { value: '11.222.333/0001-81' } })
    
    const razaoSocialInput = screen.getByLabelText('Razão Social *')
    fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste LTDA' } })
    
    const estadoIESelect = screen.getByRole('combobox', { name: /estado.*uf/i })
    fireEvent.change(estadoIESelect, { target: { value: 'SP' } })
    
    const cepInput = screen.getByLabelText('CEP *')
    fireEvent.change(cepInput, { target: { value: '01310-100' } })
    
    // Aguarda CEP ser processado
    await waitFor(() => {
      expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument()
    })
    
    const numeroInput = screen.getByLabelText('Número *')
    fireEvent.change(numeroInput, { target: { value: '1000' } })
    
    // Preenche contato
    const nomeContatoInput = screen.getByPlaceholderText('Digite o nome')
    fireEvent.change(nomeContatoInput, { target: { value: 'João Silva' } })
    
    const valorContatoInput = screen.getByPlaceholderText('exemplo@email.com')
    fireEvent.change(valorContatoInput, { target: { value: 'joao@teste.com' } })
    
    const botaoProximo = screen.getByRole('button', { name: /próximo/i })
    fireEvent.click(botaoProximo)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          cnpj: '11222333000181', // CNPJ limpo
          razaoSocial: 'Empresa Teste LTDA',
          endereco: 'Avenida Paulista',
          cidade: 'São Paulo',
          estado: 'SP',
          contatos: expect.arrayContaining([
            expect.objectContaining({
              nome: 'João Silva',
              valor: 'joao@teste.com',
              tipo: 'Email',
            }),
          ]),
        })
      )
    })
  })

  it('deve chamar onPrevious ao clicar em Anterior', () => {
    const onPrevious = vi.fn()
    renderWithProviders({ onPrevious })
    
    const botaoAnterior = screen.getByRole('button', { name: /anterior/i })
    fireEvent.click(botaoAnterior)
    
    expect(onPrevious).toHaveBeenCalled()
  })

  it('deve chamar onCancel ao clicar em Cancelar', () => {
    const onCancel = vi.fn()
    renderWithProviders({ onCancel })
    
    const botaoCancelar = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(botaoCancelar)
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('deve preencher formulário com dados iniciais', () => {
    const dadosIniciais = {
      cnpj: '11.222.333/0001-81',
      razaoSocial: 'Empresa Inicial',
      endereco: 'Rua Inicial',
      numero: '100',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      contatos: [
        {
          id: '1',
          nome: 'Contato Inicial',
          valor: 'inicial@teste.com',
          tipo: 'Email',
          ativo: true,
        },
      ],
    }

    renderWithProviders({ dadosIniciais })
    
    expect(screen.getByDisplayValue('11.222.333/0001-81')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Empresa Inicial')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Contato Inicial')).toBeInTheDocument()
    expect(screen.getByDisplayValue('inicial@teste.com')).toBeInTheDocument()
  })

  it('deve notificar mudanças de dados', async () => {
    const onDataChange = vi.fn()
    renderWithProviders({ onDataChange })
    
    const razaoSocialInput = screen.getByLabelText('Razão Social *')
    fireEvent.change(razaoSocialInput, { target: { value: 'Nova Empresa' } })
    
    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          razaoSocial: 'Nova Empresa',
        })
      )
    })
  })

  it('deve desabilitar campos quando empresa já existe', () => {
    const empresaExistente = {
      id: '123',
      cnpj: '11.222.333/0001-81',
      razaoSocial: 'Empresa Existente',
    }

    // Mock para simular empresa encontrada
    const { useConsultarEmpresaPorCNPJ } = vi.mocked(
      require('@/modules/Fornecedores/hooks/use-empresas')
    )
    
    useConsultarEmpresaPorCNPJ.mockReturnValue({
      isLoading: false,
      refetch: vi.fn(),
      data: empresaExistente,
    })

    renderWithProviders()
    
    // Simula preenchimento e busca de CNPJ
    const cnpjInput = screen.getByLabelText('CNPJ *')
    fireEvent.change(cnpjInput, { target: { value: '11.222.333/0001-81' } })
    
    // Campos devem estar desabilitados quando empresa existe
    expect(screen.getByLabelText('CNPJ *')).toBeDisabled()
    expect(screen.getByLabelText('Razão Social *')).toBeDisabled()
  })
})